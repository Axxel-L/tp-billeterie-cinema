package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.domain.Seance;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import fr.butinfo.r508.billetterie.error.ReferenceInvalideException;
import fr.butinfo.r508.billetterie.error.SeanceIntrouvableException;
import fr.butinfo.r508.billetterie.repository.FilmRepository;
import fr.butinfo.r508.billetterie.repository.ReservationRepository;
import fr.butinfo.r508.billetterie.repository.SalleRepository;
import fr.butinfo.r508.billetterie.repository.SeanceRepository;
import fr.butinfo.r508.billetterie.web.dto.SeanceRequest;
import fr.butinfo.r508.billetterie.web.dto.SeanceResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SeanceService {

    private static final int JOURS_PAR_DEFAUT = 7;

    private final SeanceRepository seanceRepository;
    private final FilmRepository filmRepository;
    private final SalleRepository salleRepository;
    private final ReservationRepository reservationRepository;

    public SeanceService(SeanceRepository seanceRepository,
                         FilmRepository filmRepository,
                         SalleRepository salleRepository,
                         ReservationRepository reservationRepository) {
        this.seanceRepository = seanceRepository;
        this.filmRepository = filmRepository;
        this.salleRepository = salleRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public List<SeanceResponse> lister(LocalDate du, LocalDate au) {
        LocalDate debut = du != null ? du : LocalDate.now();
        LocalDate fin = au != null ? au : debut.plusDays(JOURS_PAR_DEFAUT);
        if (fin.isBefore(debut)) {
            throw new ReferenceInvalideException("INTERVALLE_INVALIDE",
                    "La date de fin doit être postérieure ou égale à la date de début");
        }

        List<Seance> seances = seanceRepository.findByPeriode(
                debut.atStartOfDay(), fin.plusDays(1).atStartOfDay());
        if (seances.isEmpty()) {
            return List.of();
        }

        Map<Long, Long> placesConfirmees = new HashMap<>();
        List<Long> identifiants = seances.stream().map(Seance::getId).toList();
        for (Object[] ligne : reservationRepository.sommePlacesParSeance(
                identifiants, StatutReservation.CONFIRMEE)) {
            placesConfirmees.put((Long) ligne[0], ((Number) ligne[1]).longValue());
        }

        return seances.stream()
                .map(seance -> SeanceResponse.from(seance, placesRestantes(seance, placesConfirmees)))
                .toList();
    }

    @Transactional(readOnly = true)
    public SeanceResponse trouver(Long id) {
        Seance seance = seanceRepository.findByIdAvecReferences(id)
                .orElseThrow(() -> new SeanceIntrouvableException(id));
        return SeanceResponse.from(seance, placesRestantes(seance, Map.of()));
    }

    @Transactional
    public SeanceResponse creer(SeanceRequest requete) {
        var film = filmRepository.findById(requete.filmId())
                .orElseThrow(() -> new ReferenceInvalideException("FILM_INTROUVABLE",
                        "Film " + requete.filmId() + " introuvable"));
        var salle = salleRepository.findById(requete.salleId())
                .orElseThrow(() -> new ReferenceInvalideException("SALLE_INTROUVABLE",
                        "Salle " + requete.salleId() + " introuvable"));

        Seance seance = new Seance(film, salle, requete.debut(), requete.prixUnitaire());
        Seance enregistree = seanceRepository.saveAndFlush(seance);
        return SeanceResponse.from(enregistree, salle.getCapacite());
    }

    private long placesRestantes(Seance seance, Map<Long, Long> placesConfirmeesConnues) {
        long dejaReservees = placesConfirmeesConnues.containsKey(seance.getId())
                ? placesConfirmeesConnues.get(seance.getId())
                : reservationRepository.sommePlaces(seance.getId(), StatutReservation.CONFIRMEE);
        return Math.max(0L, seance.getSalle().getCapacite() - dejaReservees);
    }
}
