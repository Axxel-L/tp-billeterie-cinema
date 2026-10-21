package fr.butinfo.r508.billetterie.web.dto;

import fr.butinfo.r508.billetterie.domain.Reservation;
import fr.butinfo.r508.billetterie.domain.StatutReservation;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ReservationResponse(
        String code,
        StatutReservation statut,
        int nombrePlaces,
        BigDecimal montantTotal,
        Long seanceId,
        String emailClient,
        LocalDateTime creeeLe
) {
    public static ReservationResponse from(Reservation reservation, BigDecimal montantTotal) {
        return new ReservationResponse(
                reservation.getCode(),
                reservation.getStatut(),
                reservation.getNombrePlaces(),
                montantTotal,
                reservation.getSeance().getId(),
                reservation.getEmailClient(),
                reservation.getCreeeLe());
    }
}
