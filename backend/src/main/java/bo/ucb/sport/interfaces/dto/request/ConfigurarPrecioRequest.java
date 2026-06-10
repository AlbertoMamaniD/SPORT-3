package bo.ucb.sport.interfaces.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ConfigurarPrecioRequest(
        @NotNull Long canchaId,
        @NotNull @Positive BigDecimal precioHora,
        @NotBlank String horaInicio,
        @NotBlank String horaFin,
        String diaSemana,
        boolean esFeriado
) {}
