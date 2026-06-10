package bo.ucb.sport.interfaces.dto.response;

import java.math.BigDecimal;

public record PrecioResponse(
        Long id,
        Long canchaId,
        BigDecimal precioHora,
        String horaInicio,
        String horaFin,
        String diaSemana,
        boolean esFeriado
) {}
