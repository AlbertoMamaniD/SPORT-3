package bo.ucb.sport.infrastructure.sms;

import bo.ucb.sport.application.port.SmsPort;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Adaptador Twilio — activo en cualquier perfil que NO sea "dev".
 */
@Component
@Profile("!dev")
public class TwilioSmsAdapter implements SmsPort {

    private static final Logger log = LoggerFactory.getLogger(TwilioSmsAdapter.class);

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.phone-number}")
    private String phoneNumber;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
    }

    @Override
    public void enviarOtp(String telefono, String codigo) {
        try {
            Message.creator(
                    new PhoneNumber(telefono),
                    new PhoneNumber(phoneNumber),
                    "Tu código SPORT es: " + codigo + ". Expira en 5 minutos."
            ).create();
            log.info("OTP enviado a {}", telefono);
        } catch (Exception e) {
            log.error("Error al enviar OTP a {}: {}", telefono, e.getMessage());
            throw new RuntimeException("Error al enviar SMS", e);
        }
    }

    @Override
    public void enviarConfirmacion(String telefono, String mensaje) {
        try {
            Message.creator(
                    new PhoneNumber(telefono),
                    new PhoneNumber(phoneNumber),
                    mensaje
            ).create();
        } catch (Exception e) {
            log.error("Error al enviar confirmación a {}: {}", telefono, e.getMessage());
        }
    }
}
