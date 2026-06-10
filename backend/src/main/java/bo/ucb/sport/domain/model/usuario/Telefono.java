package bo.ucb.sport.domain.model.usuario;

/**
 * Value Object — Número de teléfono validado.
 * Acepta formatos internacionales: +59177012345 o 77012345
 */
public record Telefono(String valor) {
    public Telefono {
        if (valor == null || !valor.matches("^\\+?[0-9]{7,20}$"))
            throw new IllegalArgumentException("Número de teléfono inválido: " + valor);
    }
}
