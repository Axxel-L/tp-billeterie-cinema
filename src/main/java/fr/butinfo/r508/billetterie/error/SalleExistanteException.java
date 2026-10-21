package fr.butinfo.r508.billetterie.error;

import org.springframework.http.HttpStatus;

public class SalleExistanteException extends BusinessException {

    public SalleExistanteException(String nom) {
        super(HttpStatus.CONFLICT, "SALLE_EXISTANTE", "Une salle nommée « " + nom + " » existe déjà");
    }
}
