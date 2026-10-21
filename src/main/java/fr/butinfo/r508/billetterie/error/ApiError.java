package fr.butinfo.r508.billetterie.error;

import java.time.Instant;

public record ApiError(
        Instant timestamp,
        int status,
        String code,
        String message,
        String path
) {
}
