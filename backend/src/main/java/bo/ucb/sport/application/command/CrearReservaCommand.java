package bo.ucb.sport.application.command;

import java.time.LocalDate;

public record CrearReservaCommand(
        Long usuarioId,
        Long canchaId,
        LocalDate fecha,
        String horaInicio,
        String horaFin,
        String metodoPago
) {}
