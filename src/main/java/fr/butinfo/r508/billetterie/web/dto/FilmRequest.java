package fr.butinfo.r508.billetterie.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record FilmRequest(
        @NotBlank @Size(max = 200) String titre,
        @NotBlank @Size(max = 80) String genre,
        @Min(40) @Max(300) int dureeMinutes,
        @NotNull LocalDate dateSortie
) {
}
