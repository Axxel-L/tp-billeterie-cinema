package fr.butinfo.r508.billetterie.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record SeanceRequest(
        @NotNull @Positive Long filmId,
        @NotNull @Positive Long salleId,
        @NotNull @Future LocalDateTime debut,
        @NotNull @DecimalMin("0.01") @Digits(integer = 6, fraction = 2) BigDecimal prixUnitaire
) {
}
