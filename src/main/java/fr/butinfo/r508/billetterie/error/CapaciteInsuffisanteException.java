package fr.butinfo.r508.billetterie.error;

import org.springframework.http.HttpStatus;

public class CapaciteInsuffisanteException extends BusinessException {

    public CapaciteInsuffisanteException(int placesRestantes) {
        super(HttpStatus.CONFLICT, "CAPACITE_INSUFFISANTE",
                "Il ne reste que " + placesRestantes + " place(s) pour cette séance");
    }
}
