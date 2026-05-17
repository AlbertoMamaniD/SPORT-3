package bo.ucb.sport.domain.model.reserva;

/**
 * Value Object — Identificador tipado para Reserva.
 */
public record ReservaId(Long valor) {
    public ReservaId {
        if (valor == null || valor <= 0)
            throw new IllegalArgumentException("ReservaId debe ser un valor positivo");
    }
}
