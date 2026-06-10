package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.usuario.OtpToken;

import java.util.Optional;

public interface OtpTokenRepository {
    OtpToken save(OtpToken otpToken);
    Optional<OtpToken> findVigenteByUsuarioId(Long usuarioId);
    void invalidarTodosParaUsuario(Long usuarioId);
}
