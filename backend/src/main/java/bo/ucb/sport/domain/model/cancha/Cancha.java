package bo.ucb.sport.domain.model.cancha;

import java.time.OffsetDateTime;

/**
 * Entidad de dominio — Cancha deportiva.
 */
public class Cancha {

    private Long id;
    private String nombre;
    private TipoCancha tipo;
    private int capacidad;
    private boolean activa;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    private Cancha() {}

    public static Cancha crear(String nombre, TipoCancha tipo, int capacidad) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre de la cancha no puede estar vacío");
        if (tipo == null)
            throw new IllegalArgumentException("El tipo de cancha es obligatorio");
        if (capacidad <= 0)
            throw new IllegalArgumentException("La capacidad debe ser mayor a 0");
        Cancha c = new Cancha();
        c.nombre = nombre.trim();
        c.tipo = tipo;
        c.capacidad = capacidad;
        c.activa = true;
        c.createdAt = OffsetDateTime.now();
        c.updatedAt = OffsetDateTime.now();
        return c;
    }

    public static Cancha reconstituir(Long id, String nombre, TipoCancha tipo,
                                       int capacidad, boolean activa,
                                       OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        Cancha c = new Cancha();
        c.id = id;
        c.nombre = nombre;
        c.tipo = tipo;
        c.capacidad = capacidad;
        c.activa = activa;
        c.createdAt = createdAt;
        c.updatedAt = updatedAt;
        return c;
    }

    public void editar(String nombre, int capacidad) {
        if (nombre != null && !nombre.isBlank()) this.nombre = nombre.trim();
        if (capacidad > 0) this.capacidad = capacidad;
        this.updatedAt = OffsetDateTime.now();
    }

    public void desactivar() {
        this.activa = false;
        this.updatedAt = OffsetDateTime.now();
    }

    public void activar() {
        this.activa = true;
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public TipoCancha getTipo() { return tipo; }
    public int getCapacidad() { return capacidad; }
    public boolean isActiva() { return activa; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}
