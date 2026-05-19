package bo.ucb.sport.domain.model.usuario;

import java.time.OffsetDateTime;

/**
 * Entidad de dominio — Usuario del sistema.
 * Sin anotaciones de framework (puro Java).
 */
public class Usuario {

    private Long id;
    private String nombre;
    private Telefono telefono;
    private RolUsuario rol;
    private boolean verificado;
    private boolean activo;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Constructor privado para uso interno y mappers
    private Usuario() {
    }

    /** Factory method para crear un nuevo usuario no verificado. */
    public static Usuario registrar(String nombre, Telefono telefono) {
        if (nombre == null || nombre.isBlank())
            throw new IllegalArgumentException("El nombre no puede estar vacío");
        Usuario u = new Usuario();
        u.nombre = nombre.trim();
        u.telefono = telefono;
        u.rol = RolUsuario.USUARIO;
        u.verificado = false;
        u.activo = true;
        u.createdAt = OffsetDateTime.now();
        u.updatedAt = OffsetDateTime.now();
        return u;
    }

    /** Factory method para reconstruir desde persistencia (mapper). */
    public static Usuario reconstituir(Long id, String nombre, Telefono telefono,
            RolUsuario rol, boolean verificado, boolean activo,
            OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        Usuario u = new Usuario();
        u.id = id;
        u.nombre = nombre;
        u.telefono = telefono;
        u.rol = rol;
        u.verificado = verificado;
        u.activo = activo;
        u.createdAt = createdAt;
        u.updatedAt = updatedAt;
        return u;
    }

    public void verificar() {
        this.verificado = true;
        this.updatedAt = OffsetDateTime.now();
    }

    public void desactivar() {
        this.activo = false;
        this.updatedAt = OffsetDateTime.now();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public Telefono getTelefono() {
        return telefono;
    }

    public RolUsuario getRol() {
        return rol;
    }

    public boolean isVerificado() {
        return verificado;
    }

    public boolean isActivo() {
        return activo;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }
}
