package fr.butinfo.r508.billetterie.web.dto;

import fr.butinfo.r508.billetterie.domain.Seance;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SeanceResponse(
        Long id,
        Long filmId,
        String filmTitre,
        Long salleId,
        String salleNom,
        LocalDateTime debut,
        BigDecimal prixUnitaire,
        long placesRestantes
) {
    public static SeanceResponse from(Seance seance, long placesRestantes) {
        return new SeanceResponse(
                seance.getId(),
                seance.getFilm().getId(),
                seance.getFilm().getTitre(),
                seance.getSalle().getId(),
                seance.getSalle().getNom(),
                seance.getDebut(),
                seance.getPrixUnitaire(),
                placesRestantes);
    }
}
