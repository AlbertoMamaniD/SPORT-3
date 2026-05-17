package bo.ucb.sport.domain.exception;

public class UsuarioYaRegistradoException extends RuntimeException {
    public UsuarioYaRegistradoException(String mensaje) {
        super(mensaje);
    }
}
