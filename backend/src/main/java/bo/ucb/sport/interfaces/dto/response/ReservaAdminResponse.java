package bo.ucb.sport.interfaces.dto.response;

import java.math.BigDecimal;

public record ReservaAdminResponse(
        Long id,
        Long canchaId,
        Long usuarioId,
        String nombreUsuario,
        String fecha,
        String horaInicio,
        String horaFin,
        String estado,
        String estadoPago,
        BigDecimal montoTotal
) {}
