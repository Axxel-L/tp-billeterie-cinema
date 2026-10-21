package fr.butinfo.r508.billetterie.service;

import fr.butinfo.r508.billetterie.web.dto.FilmMediaResponse;

import java.time.LocalDate;

public record FilmTmdbDetail(
        long tmdbId,
        String titre,
        String genre,
        int dureeMinutes,
        LocalDate dateSortie,
        FilmMediaResponse media
) {
}
