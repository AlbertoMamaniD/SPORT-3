package bo.ucb.sport.application.port;

/**
 * Puerto de salida (Hexagonal) — Servicio de envío de SMS.
 * La implementación concreta vive en infrastructure/sms/.
 */
public interface SmsPort {
    void enviarOtp(String telefono, String codigo);
    void enviarConfirmacion(String telefono, String mensaje);
}
