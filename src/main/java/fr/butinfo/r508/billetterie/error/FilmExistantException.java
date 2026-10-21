package fr.butinfo.r508.billetterie.error;

import org.springframework.http.HttpStatus;

public class FilmExistantException extends BusinessException {

    public FilmExistantException(String titre) {
        super(HttpStatus.CONFLICT, "FILM_EXISTANT", "Le film « " + titre + " » est déjà programmé");
    }
}
