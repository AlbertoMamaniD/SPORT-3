package bo.ucb.sport.domain.model.pago;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entidad de dominio — Pago asociado a una reserva (relación 1:1).
 */
public class Pago {

    private Long id;
    private Long reservaId;
    private BigDecimal monto;
    private MetodoPago metodo;
    private EstadoPago estado;
    private String referencia;
    private OffsetDateTime fechaPago;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Pago() {}

    public static Pago crear(Long reservaId, BigDecimal monto, MetodoPago metodo) {
        if (monto == null || monto.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("El monto no puede ser negativo");
        Pago p = new Pago();
        p.reservaId = reservaId;
        p.monto = monto;
        p.metodo = metodo;
        p.estado = EstadoPago.PENDIENTE;
        p.createdAt = OffsetDateTime.now();
        p.updatedAt = OffsetDateTime.now();
        return p;
    }

    public static Pago reconstituir(Long id, Long reservaId, BigDecimal monto,
                                     MetodoPago metodo, EstadoPago estado,
                                     String referencia, OffsetDateTime fechaPago,
                                     OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        Pago p = new Pago();
        p.id = id;
        p.reservaId = reservaId;
        p.monto = monto;
        p.metodo = metodo;
        p.estado = estado;
        p.referencia = referencia;
        p.fechaPago = fechaPago;
        p.createdAt = createdAt;
        p.updatedAt = updatedAt;
        return p;
    }

    public void completar(String referencia) {
        this.estado = EstadoPago.COMPLETADO;
        this.referencia = referencia;
        this.fechaPago = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

    public void rechazar() {
        this.estado = EstadoPago.RECHAZADO;
        this.updatedAt = OffsetDateTime.now();
    }

    public void reembolsar() {
        this.estado = EstadoPago.REEMBOLSADO;
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public Long getReservaId() { return reservaId; }
    public BigDecimal getMonto() { return monto; }
    public MetodoPago getMetodo() { return metodo; }
    public EstadoPago getEstado() { return estado; }
    public String getReferencia() { return referencia; }
    public OffsetDateTime getFechaPago() { return fechaPago; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
