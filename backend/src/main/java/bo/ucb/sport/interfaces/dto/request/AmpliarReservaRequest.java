package bo.ucb.sport.interfaces.dto.request;

import jakarta.validation.constraints.Min;

public record AmpliarReservaRequest(@Min(30) int minutosExtra) {}
