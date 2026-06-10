package bo.ucb.sport.domain.model.usuario;

import java.time.OffsetDateTime;

/**
 * Entidad de dominio — Token OTP para verificación/login.
 * Parte del agregado Usuario.
 */
public class OtpToken {

    private Long id;
    private Long usuarioId;
    private String codigo;
    private OffsetDateTime expiraEn;
    private boolean usado;
    private OffsetDateTime createdAt;

    private OtpToken() {}

    /** Factory method — crea un OTP nuevo con expiración de 5 minutos. */
    public static OtpToken crear(Long usuarioId, String codigo) {
        OtpToken otp = new OtpToken();
        otp.usuarioId = usuarioId;
        otp.codigo = codigo;
        otp.expiraEn = OffsetDateTime.now().plusMinutes(5);
        otp.usado = false;
        otp.createdAt = OffsetDateTime.now();
        return otp;
    }

    /** Factory method para reconstruir desde persistencia. */
    public static OtpToken reconstituir(Long id, Long usuarioId, String codigo,
                                         OffsetDateTime expiraEn, boolean usado,
                                         OffsetDateTime createdAt) {
        OtpToken otp = new OtpToken();
        otp.id = id;
        otp.usuarioId = usuarioId;
        otp.codigo = codigo;
        otp.expiraEn = expiraEn;
        otp.usado = usado;
        otp.createdAt = createdAt;
        return otp;
    }

    public boolean estaVigente() {
        return !usado && OffsetDateTime.now().isBefore(expiraEn);
    }

    public void marcarUsado() {
        this.usado = true;
    }

    // Getters
    public Long getId() { return id; }
    public Long getUsuarioId() { return usuarioId; }
    public String getCodigo() { return codigo; }
    public OffsetDateTime getExpiraEn() { return expiraEn; }
    public boolean isUsado() { return usado; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
}
