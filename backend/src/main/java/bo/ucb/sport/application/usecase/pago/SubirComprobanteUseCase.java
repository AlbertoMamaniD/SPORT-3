package bo.ucb.sport.application.usecase.pago;

import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.pago.ConceptoPago;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.repository.PagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SubirComprobanteUseCase {

    private final PagoRepository pagoRepository;

    public SubirComprobanteUseCase(PagoRepository pagoRepository) {
        this.pagoRepository = pagoRepository;
    }

    public Pago execute(Long reservaId, ConceptoPago concepto, String urlComprobante) {
        Pago pago = pagoRepository.findByReservaIdAndConcepto(reservaId, concepto)
                .orElseThrow(() -> new ReservaNoEncontradaException("Pago no encontrado para reserva: " + reservaId + " con concepto: " + concepto));

        pago.vincularComprobante(urlComprobante);

        return pagoRepository.save(pago);
    }
}
