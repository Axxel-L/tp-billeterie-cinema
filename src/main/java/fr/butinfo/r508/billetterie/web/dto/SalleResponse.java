package fr.butinfo.r508.billetterie.web.dto;

import fr.butinfo.r508.billetterie.domain.Salle;

public record SalleResponse(Long id, String nom, int capacite) {

    public static SalleResponse from(Salle salle) {
        return new SalleResponse(salle.getId(), salle.getNom(), salle.getCapacite());
    }
}
