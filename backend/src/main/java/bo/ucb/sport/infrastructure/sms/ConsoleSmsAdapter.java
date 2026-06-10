package bo.ucb.sport.infrastructure.sms;

import bo.ucb.sport.application.port.SmsPort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Adaptador de SMS para entorno de desarrollo.
 * En lugar de enviar SMS reales, imprime el OTP en la consola.
 * Seleccionable con el perfil Spring "dev".
 */
@Component
@Profile("dev")
public class ConsoleSmsAdapter implements SmsPort {

    private static final Logger log = LoggerFactory.getLogger(ConsoleSmsAdapter.class);

    @Override
    public void enviarOtp(String telefono, String codigo) {
        log.info("========================================");
        log.info("[DEV] OTP para {}: {}", telefono, codigo);
        log.info("========================================");
    }

    @Override
    public void enviarConfirmacion(String telefono, String mensaje) {
        log.info("[DEV] SMS de confirmación para {}: {}", telefono, mensaje);
    }
}
