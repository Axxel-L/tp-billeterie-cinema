package fr.butinfo.r508.billetterie.error;

import org.springframework.http.HttpStatus;

public class TmdbNonConfigureException extends BusinessException {

    public TmdbNonConfigureException() {
        super(HttpStatus.SERVICE_UNAVAILABLE, "TMDB_NON_CONFIGURE",
                "La recherche de films nécessite la variable d'environnement TMDB_API_KEY");
    }
}
