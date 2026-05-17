package bo.ucb.sport.interfaces.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CrearCanchaRequest(
        @NotBlank String nombre,
        @NotBlank String tipo,
        @Positive int capacidad
) {}
