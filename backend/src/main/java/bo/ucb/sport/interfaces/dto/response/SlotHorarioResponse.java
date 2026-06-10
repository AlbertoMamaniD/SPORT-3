package bo.ucb.sport.interfaces.dto.response;

import java.math.BigDecimal;
import java.time.LocalTime;

public record SlotHorarioResponse(LocalTime horaInicio, LocalTime horaFin, boolean disponible, BigDecimal precio, boolean expirado) {}
