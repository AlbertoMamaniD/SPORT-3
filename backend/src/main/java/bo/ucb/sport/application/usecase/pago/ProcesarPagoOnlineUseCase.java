package bo.ucb.sport.application.usecase.pago;

import bo.ucb.sport.application.port.PagoOnlinePort;
import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.repository.PagoRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ProcesarPagoOnlineUseCase {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final PagoOnlinePort pagoOnlinePort;

    public ProcesarPagoOnlineUseCase(PagoRepository pagoRepository,
                                      ReservaRepository reservaRepository,
                                      PagoOnlinePort pagoOnlinePort) {
        this.pagoRepository = pagoRepository;
        this.reservaRepository = reservaRepository;
        this.pagoOnlinePort = pagoOnlinePort;
    }

    public Pago execute(Long reservaId, String referencia) {
        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new ReservaNoEncontradaException("Pago no encontrado para reserva: " + reservaId));

        boolean exitoso = pagoOnlinePort.procesarPago(reservaId, referencia, pago.getMonto());

        if (exitoso) {
            pago.completar(null, referencia);
            Reserva reserva = reservaRepository.findById(new ReservaId(reservaId))
                    .orElseThrow(() -> new ReservaNoEncontradaException("Reserva no encontrada: " + reservaId));
            reserva.confirmar();
            reservaRepository.save(reserva);
        } else {
            pago.rechazar();
        }

        return pagoRepository.save(pago);
    }
}
