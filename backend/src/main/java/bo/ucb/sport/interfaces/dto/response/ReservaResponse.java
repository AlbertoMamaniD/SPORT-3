package bo.ucb.sport.interfaces.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record ReservaResponse(
        Long id,
        Long canchaId,
        Long usuarioId,
        LocalDate fecha,
        LocalTime horaInicio,
        LocalTime horaFin,
        String estado,
        BigDecimal montoTotal
) {}
