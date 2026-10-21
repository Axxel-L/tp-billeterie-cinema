package fr.butinfo.r508.billetterie.web.dto;

public record FilmMediaResponse(
        String afficheUrl,
        String bandeauUrl,
        String bandeAnnonceSite,
        String bandeAnnonceCle,
        String synopsis,
        Double note
) {
    public static FilmMediaResponse vide() {
        return new FilmMediaResponse(null, null, null, null, null, null);
    }
}
