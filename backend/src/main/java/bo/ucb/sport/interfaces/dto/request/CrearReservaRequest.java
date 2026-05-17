package bo.ucb.sport.interfaces.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CrearReservaRequest(
        @NotNull Long canchaId,
        @NotNull @Future LocalDate fecha,
        @NotBlank String horaInicio,
        @NotBlank String horaFin,
        @NotBlank String metodoPago
) {}
