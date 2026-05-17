package bo.ucb.sport.interfaces.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerificarOtpRequest(
        @NotBlank String telefono,
        @NotBlank @Size(min = 6, max = 6) String codigo
) {}
