package fr.butinfo.r508.billetterie.web.dto;

import fr.butinfo.r508.billetterie.domain.StatutReservation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservationClientResponse(
        String code,
        String filmTitre,
        String salleNom,
        LocalDateTime debut,
        int nombrePlaces,
        BigDecimal montantTotal,
        StatutReservation statut
) {
}
