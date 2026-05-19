package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.pago.ConceptoPago;
import bo.ucb.sport.domain.model.pago.Pago;

import java.util.Optional;

public interface PagoRepository {
    Pago save(Pago pago);
    Optional<Pago> findByReservaId(Long reservaId);
    Optional<Pago> findByReservaIdAndConcepto(Long reservaId, ConceptoPago concepto);
}
