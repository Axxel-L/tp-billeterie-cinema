package fr.butinfo.r508.billetterie.error;

public class ReservationIntrouvableException extends RessourceIntrouvableException {

    public ReservationIntrouvableException(String code) {
        super("RESERVATION_INTROUVABLE", "Réservation " + code + " introuvable");
    }
}
