package bo.ucb.sport.infrastructure.sms;

import bo.ucb.sport.application.port.PagoOnlinePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Adaptador stub para pago online.
 * Reemplazar con integración real (Mercado Pago, PayPal, etc.).
 */
@Component
public class PagoOnlineAdapter implements PagoOnlinePort {

    private static final Logger log = LoggerFactory.getLogger(PagoOnlineAdapter.class);

    @Override
    public boolean procesarPago(Long reservaId, String referencia, BigDecimal monto) {
        log.info("[PAGO] Procesando pago online: reservaId={}, ref={}, monto={}", reservaId, referencia, monto);
        // TODO: integrar pasarela de pago real
        return true;
    }
}
