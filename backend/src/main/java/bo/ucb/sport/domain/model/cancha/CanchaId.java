package bo.ucb.sport.domain.model.cancha;

/**
 * Value Object — Identificador tipado para Cancha.
 */
public record CanchaId(Long valor) {
    public CanchaId {
        if (valor == null || valor <= 0)
            throw new IllegalArgumentException("CanchaId debe ser un valor positivo");
    }
}
