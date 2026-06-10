package bo.ucb.sport.interfaces.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(@NotBlank String telefono) {}
