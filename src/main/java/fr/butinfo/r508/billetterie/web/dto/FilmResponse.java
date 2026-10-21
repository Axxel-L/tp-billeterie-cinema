package fr.butinfo.r508.billetterie.web.dto;

import fr.butinfo.r508.billetterie.domain.Film;

import java.time.LocalDate;

public record FilmResponse(
        Long id,
        String titre,
        String genre,
        int dureeMinutes,
        LocalDate dateSortie,
        String afficheUrl,
        String bandeauUrl,
        String bandeAnnonceCle,
        String synopsis,
        Double note
) {
    public static FilmResponse from(Film film) {
        return new FilmResponse(
                film.getId(),
                film.getTitre(),
                film.getGenre(),
                film.getDureeMinutes(),
                film.getDateSortie(),
                film.getAfficheUrl(),
                film.getBandeauUrl(),
                film.getBandeAnnonceCle(),
                film.getSynopsis(),
                film.getNote() == null ? null : film.getNote().doubleValue());
    }
}
