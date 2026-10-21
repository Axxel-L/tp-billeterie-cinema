package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.domain.Salle;
import fr.butinfo.r508.billetterie.error.SalleExistanteException;
import fr.butinfo.r508.billetterie.repository.SalleRepository;
import fr.butinfo.r508.billetterie.web.dto.SalleRequest;
import fr.butinfo.r508.billetterie.web.dto.SalleResponse;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SalleService {

    private final SalleRepository salleRepository;

    public SalleService(SalleRepository salleRepository) {
        this.salleRepository = salleRepository;
    }

    @Transactional(readOnly = true)
    public List<SalleResponse> lister() {
        return salleRepository.findAllByOrderByNomAsc().stream()
                .map(SalleResponse::from)
                .toList();
    }

    @Transactional
    public SalleResponse creer(SalleRequest requete) {
        String nom = requete.nom().trim();
        if (salleRepository.existsByNomIgnoreCase(nom)) {
            throw new SalleExistanteException(nom);
        }
        try {
            Salle salle = salleRepository.saveAndFlush(new Salle(nom, requete.capacite()));
            return SalleResponse.from(salle);
        } catch (DataIntegrityViolationException ex) {
            throw new SalleExistanteException(nom);
        }
    }
}
