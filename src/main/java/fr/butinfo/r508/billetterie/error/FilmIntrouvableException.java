package fr.butinfo.r508.billetterie.error;

public class FilmIntrouvableException extends RessourceIntrouvableException {

    public FilmIntrouvableException(Long id) {
        super("FILM_INTROUVABLE", "Film " + id + " introuvable");
    }
}
