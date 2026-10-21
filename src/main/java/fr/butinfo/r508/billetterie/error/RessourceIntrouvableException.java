package fr.butinfo.r508.billetterie.error;

import org.springframework.http.HttpStatus;

public class RessourceIntrouvableException extends BusinessException {

    public RessourceIntrouvableException(String code, String message) {
        super(HttpStatus.NOT_FOUND, code, message);
    }
}
