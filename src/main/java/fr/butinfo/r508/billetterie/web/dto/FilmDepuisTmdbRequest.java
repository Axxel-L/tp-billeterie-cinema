package fr.butinfo.r508.billetterie.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FilmDepuisTmdbRequest(@NotNull @Positive Long tmdbId) {
}
