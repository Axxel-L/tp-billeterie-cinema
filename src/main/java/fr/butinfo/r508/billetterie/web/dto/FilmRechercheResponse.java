package fr.butinfo.r508.billetterie.web.dto;

public record FilmRechercheResponse(
        long tmdbId,
        String titre,
        Integer annee,
        String afficheUrl,
        String synopsis
) {
}
