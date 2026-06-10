package bo.ucb.sport.domain.exception;

public class OtpInvalidoException extends RuntimeException {
    public OtpInvalidoException(String mensaje) {
        super(mensaje);
    }
}
