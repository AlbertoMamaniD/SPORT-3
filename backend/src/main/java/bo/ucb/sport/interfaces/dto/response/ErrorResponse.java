package bo.ucb.sport.interfaces.dto.response;

import java.time.Instant;

public record ErrorResponse(String codigo, String mensaje, Instant timestamp) {
    public ErrorResponse(String codigo, String mensaje) {
        this(codigo, mensaje, Instant.now());
    }
}
