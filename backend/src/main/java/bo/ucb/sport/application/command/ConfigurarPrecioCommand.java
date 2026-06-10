package bo.ucb.sport.application.command;

import java.math.BigDecimal;
import java.time.LocalTime;

public record ConfigurarPrecioCommand(
        Long canchaId,
        BigDecimal precioHora,
        LocalTime horaInicio,
        LocalTime horaFin,
        String diaSemana,
        boolean esFeriado
) {}
