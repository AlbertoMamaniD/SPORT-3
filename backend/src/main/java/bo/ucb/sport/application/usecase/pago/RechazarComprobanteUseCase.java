package bo.ucb.sport.application.usecase.pago;

import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.pago.ConceptoPago;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.repository.PagoRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class RechazarComprobanteUseCase {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    public RechazarComprobanteUseCase(PagoRepository pagoRepository, ReservaRepository reservaRepository) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
    }

    public Pago execute(Long reservaId, ConceptoPago concepto) {
        Pago pago = pagoRepository.findByReservaIdAndConcepto(reservaId, concepto)
                .orElseThrow(() -> new ReservaNoEncontradaException("Pago no encontrado para reserva: " + reservaId + " con concepto: " + concepto));

        pago.rechazar();

        if (concepto == ConceptoPago.RESERVA_INICIAL) {
            Reserva reserva = reservaRepository.findById(new ReservaId(reservaId))
                    .orElseThrow(() -> new ReservaNoEncontradaException("Reserva no encontrada"));
            try {
                reserva.cancelar();
                reservaRepository.save(reserva);
            } catch (IllegalStateException e) {
                // Ya estaba cancelada, ignorar
            }
        }

        return pagoRepository.save(pago);
    }
}
