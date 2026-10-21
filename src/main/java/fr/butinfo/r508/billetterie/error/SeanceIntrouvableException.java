package fr.butinfo.r508.billetterie.error;

public class SeanceIntrouvableException extends RessourceIntrouvableException {

    public SeanceIntrouvableException(Long id) {
        super("SEANCE_INTROUVABLE", "Séance " + id + " introuvable");
    }
}
