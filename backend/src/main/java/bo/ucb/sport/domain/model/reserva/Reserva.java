package bo.ucb.sport.domain.model.reserva;

import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * Agregado raíz — Reserva de cancha deportiva.
 * Contiene todas las reglas de negocio invariantes (RN-06, RN-07, RN-10, RN-11).
 */
public class Reserva {

    private ReservaId id;
    private Long usuarioId;
    private Long canchaId;
    private LocalDate fecha;
    private FranjaHoraria franja;
    private EstadoReserva estado;
    private BigDecimal montoTotal;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Reserva() {}

    /**
     * Factory method — crea una nueva reserva validando reglas de dominio.
     * RN-06: duración mínima 1 hora. RN-07: bloques de 30 min.
     */
    public static Reserva crear(Long usuarioId, Long canchaId,
                                 LocalDate fecha, FranjaHoraria franja,
                                 BigDecimal montoTotal) {
        validarFranja(franja);
        Reserva r = new Reserva();
        r.usuarioId = usuarioId;
        r.canchaId = canchaId;
        r.fecha = fecha;
        r.franja = franja;
        r.estado = EstadoReserva.PENDIENTE;
        r.montoTotal = montoTotal;
        r.createdAt = OffsetDateTime.now();
        r.updatedAt = OffsetDateTime.now();
        return r;
    }

    public static Reserva reconstituir(ReservaId id, Long usuarioId, Long canchaId,
                                        LocalDate fecha, FranjaHoraria franja,
                                        EstadoReserva estado, BigDecimal montoTotal,
                                        OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        Reserva r = new Reserva();
        r.id = id;
        r.usuarioId = usuarioId;
        r.canchaId = canchaId;
        r.fecha = fecha;
        r.franja = franja;
        r.estado = estado;
        r.montoTotal = montoTotal;
        r.createdAt = createdAt;
        r.updatedAt = updatedAt;
        return r;
    }

    /** Confirma la reserva. Solo válido si está PENDIENTE. */
    public void confirmar() {
        if (this.estado != EstadoReserva.PENDIENTE)
            throw new IllegalStateException("Solo se puede confirmar una reserva PENDIENTE");
        this.estado = EstadoReserva.CONFIRMADA;
        this.updatedAt = OffsetDateTime.now();
    }

    /** Cancela la reserva. RN-10: un usuario solo puede cancelar la suya propia (validado en use case). */
    public void cancelar() {
        if (this.estado == EstadoReserva.CANCELADA)
            throw new IllegalStateException("La reserva ya está cancelada");
        this.estado = EstadoReserva.CANCELADA;
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * Amplía la franja horaria de la reserva. RN-11: bloques de 30 min.
     * Devuelve una nueva instancia con la franja extendida.
     */
    public Reserva ampliar(Duration extension, BigDecimal costoAdicional) {
        if (extension.toMinutes() % 30 != 0)
            throw new CanchaNoDisponibleException("La extensión debe ser en bloques de 30 minutos");
        FranjaHoraria nuevaFranja = franja.extender(extension);
        Reserva r = new Reserva();
        r.id = this.id;
        r.usuarioId = this.usuarioId;
        r.canchaId = this.canchaId;
        r.fecha = this.fecha;
        r.franja = nuevaFranja;
        r.estado = this.estado;
        r.montoTotal = this.montoTotal.add(costoAdicional);
        r.createdAt = this.createdAt;
        r.updatedAt = OffsetDateTime.now();
        return r;
    }

    private static void validarFranja(FranjaHoraria franja) {
        if (franja.duracionEnMinutos() < 60)
            throw new IllegalArgumentException("Duración mínima es 1 hora (RN-06)");
        if (franja.duracionEnMinutos() % 30 != 0)
            throw new IllegalArgumentException("La duración debe ser en bloques de 30 minutos (RN-07)");
    }

    // Getters
    public ReservaId getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public Long getCanchaId() { return canchaId; }
    public LocalDate getFecha() { return fecha; }
    public FranjaHoraria getFranja() { return franja; }
    public EstadoReserva getEstado() { return estado; }
    public BigDecimal getMontoTotal() { return montoTotal; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
