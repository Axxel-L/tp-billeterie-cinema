package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.domain.Reservation;
import fr.butinfo.r508.billetterie.domain.Seance;
import fr.butinfo.r508.billetterie.domain.StatutReservation;
import fr.butinfo.r508.billetterie.error.CapaciteInsuffisanteException;
import fr.butinfo.r508.billetterie.error.ReservationIntrouvableException;
import fr.butinfo.r508.billetterie.error.SeanceIntrouvableException;
import fr.butinfo.r508.billetterie.repository.ReservationRepository;
import fr.butinfo.r508.billetterie.repository.SeanceRepository;
import fr.butinfo.r508.billetterie.web.dto.ReservationRequest;
import fr.butinfo.r508.billetterie.web.dto.ReservationResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class ReservationService {

    private static final char[] ALPHABET_CODE = "0123456789ABCDEFGHJKMNPQRSTVWXYZ".toCharArray();
    private static final int LONGUEUR_CODE = 12;
    private static final int TENTATIVES_CODE = 5;
    private static final SecureRandom ALEA = new SecureRandom();

    private final ReservationRepository reservationRepository;
    private final SeanceRepository seanceRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              SeanceRepository seanceRepository) {
        this.reservationRepository = reservationRepository;
        this.seanceRepository = seanceRepository;
    }

    /**
     * Verrou pessimiste sur la séance : la lecture des places déjà réservées et
     * l'insertion de la nouvelle réservation forment une seule section critique,
     * y compris entre plusieurs instances applicatives.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public ReservationResponse creer(ReservationRequest requete) {
        Seance seance = seanceRepository.findByIdForUpdate(requete.seanceId())
                .orElseThrow(() -> new SeanceIntrouvableException(requete.seanceId()));

        long dejaReservees = Optional
                .ofNullable(reservationRepository.sommePlaces(seance.getId(), StatutReservation.CONFIRMEE))
                .orElse(0L);
        long placesRestantes = seance.getSalle().getCapacite() - dejaReservees;
        if (requete.nombrePlaces() > placesRestantes) {
            throw new CapaciteInsuffisanteException((int) Math.max(0L, placesRestantes));
        }

        Reservation reservation = new Reservation(
                genererCode(),
                seance,
                requete.emailClient().trim(),
                requete.nombrePlaces(),
                StatutReservation.CONFIRMEE,
                LocalDateTime.now());
        reservationRepository.save(reservation);

        return ReservationResponse.from(reservation, montant(seance, requete.nombrePlaces()));
    }

    /**
     * L'annulation ne peut que libérer de la capacité : elle n'a pas besoin du
     * verrou de la séance et ne peut pas violer l'invariant de capacité.
     */
    @Transactional
    public void annuler(String code) {
        Reservation reservation = reservationRepository.findByCode(code)
                .orElseThrow(() -> new ReservationIntrouvableException(code));
        if (reservation.getStatut() == StatutReservation.ANNULEE) {
            return;
        }
        reservation.annuler();
    }

    private BigDecimal montant(Seance seance, int nombrePlaces) {
        return seance.getPrixUnitaire()
                .multiply(BigDecimal.valueOf(nombrePlaces))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String genererCode() {
        for (int tentative = 0; tentative < TENTATIVES_CODE; tentative++) {
            String code = codeAleatoire();
            if (!reservationRepository.existsByCode(code)) {
                return code;
            }
        }
        throw new IllegalStateException("Impossible de générer un code de réservation unique");
    }

    private String codeAleatoire() {
        StringBuilder code = new StringBuilder("RES-");
        for (int i = 0; i < LONGUEUR_CODE; i++) {
            code.append(ALPHABET_CODE[ALEA.nextInt(ALPHABET_CODE.length)]);
        }
        return code.toString();
    }
}
