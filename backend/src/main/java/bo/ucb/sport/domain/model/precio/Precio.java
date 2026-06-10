package bo.ucb.sport.domain.model.precio;

import bo.ucb.sport.domain.model.reserva.FranjaHoraria;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Entidad de dominio — Tarifa horaria de una cancha.
 */
public class Precio {

    private Long id;
    private Long canchaId;
    private BigDecimal precioHora;
    private FranjaHoraria franja;
    private DiaSemana diaSemana;    // null = cualquier día
    private boolean esFeriado;
    private boolean vigente;
    private OffsetDateTime createdAt;

    private Precio() {}

    public static Precio crear(Long canchaId, BigDecimal precioHora, FranjaHoraria franja,
                                DiaSemana diaSemana, boolean esFeriado) {
        if (canchaId == null) throw new IllegalArgumentException("canchaId es obligatorio");
        if (precioHora == null || precioHora.compareTo(BigDecimal.ZERO) < 0)
            throw new IllegalArgumentException("precio_hora debe ser >= 0");
        Precio p = new Precio();
        p.canchaId = canchaId;
        p.precioHora = precioHora;
        p.franja = franja;
        p.diaSemana = diaSemana;
        p.esFeriado = esFeriado;
        p.vigente = true;
        p.createdAt = OffsetDateTime.now();
        return p;
    }

    public static Precio reconstituir(Long id, Long canchaId, BigDecimal precioHora,
                                       FranjaHoraria franja, DiaSemana diaSemana,
                                       boolean esFeriado, boolean vigente,
                                       OffsetDateTime createdAt) {
        Precio p = new Precio();
        p.id = id;
        p.canchaId = canchaId;
        p.precioHora = precioHora;
        p.franja = franja;
        p.diaSemana = diaSemana;
        p.esFeriado = esFeriado;
        p.vigente = vigente;
        p.createdAt = createdAt;
        return p;
    }

    public void invalidar() {
        this.vigente = false;
    }

    // Getters
    public Long getId() { return id; }
    public Long getCanchaId() { return canchaId; }
    public BigDecimal getPrecioHora() { return precioHora; }
    public FranjaHoraria getFranja() { return franja; }
    public DiaSemana getDiaSemana() { return diaSemana; }
    public boolean isEsFeriado() { return esFeriado; }
    public boolean isVigente() { return vigente; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
