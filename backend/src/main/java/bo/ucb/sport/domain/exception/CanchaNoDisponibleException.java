package bo.ucb.sport.domain.exception;

public class CanchaNoDisponibleException extends RuntimeException {
    public CanchaNoDisponibleException(String mensaje) {
        super(mensaje);
    }
}
