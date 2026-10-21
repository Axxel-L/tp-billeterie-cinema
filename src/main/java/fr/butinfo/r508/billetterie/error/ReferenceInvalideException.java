package fr.butinfo.r508.billetterie.error;

import org.springframework.http.HttpStatus;

public class ReferenceInvalideException extends BusinessException {

    public ReferenceInvalideException(String code, String message) {
        super(HttpStatus.BAD_REQUEST, code, message);
    }
}
