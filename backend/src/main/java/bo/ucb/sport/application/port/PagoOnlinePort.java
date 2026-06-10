package bo.ucb.sport.application.port;

/**
 * Puerto de salida (Hexagonal) — Pasarela de pago online.
 */
public interface PagoOnlinePort {
    boolean procesarPago(Long reservaId, String referencia, java.math.BigDecimal monto);
}
