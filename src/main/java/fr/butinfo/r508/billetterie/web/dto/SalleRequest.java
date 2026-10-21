package fr.butinfo.r508.billetterie.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SalleRequest(
        @NotBlank @Size(max = 120) String nom,
        @Min(20) @Max(500) int capacite
) {
}
