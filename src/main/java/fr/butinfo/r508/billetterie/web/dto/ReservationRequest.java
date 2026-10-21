package fr.butinfo.r508.billetterie.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ReservationRequest(
        @NotNull @Positive Long seanceId,
        @NotBlank @Email @Size(max = 254) String emailClient,
        @Min(1) @Max(8) int nombrePlaces
) {
}
