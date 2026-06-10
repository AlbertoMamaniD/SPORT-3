package bo.ucb.sport.infrastructure.persistence.repository;

import bo.ucb.sport.domain.model.usuario.OtpToken;
import bo.ucb.sport.domain.repository.OtpTokenRepository;
import bo.ucb.sport.infrastructure.persistence.entity.OtpTokenJpa;
import bo.ucb.sport.infrastructure.persistence.jpa.OtpTokenJpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class OtpTokenRepositoryImpl implements OtpTokenRepository {

    private final OtpTokenJpaRepository jpa;

    public OtpTokenRepositoryImpl(OtpTokenJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public OtpToken save(OtpToken otpToken) {
        OtpTokenJpa entity = new OtpTokenJpa();
        entity.setId(otpToken.getId());
        entity.setUsuarioId(otpToken.getUsuarioId());
        entity.setCodigo(otpToken.getCodigo());
        entity.setExpiraEn(otpToken.getExpiraEn());
        entity.setUsado(otpToken.isUsado());
        entity.setCreatedAt(otpToken.getCreatedAt());
        OtpTokenJpa saved = jpa.save(entity);
        return OtpToken.reconstituir(saved.getId(), saved.getUsuarioId(), saved.getCodigo(),
                saved.getExpiraEn(), saved.isUsado(), saved.getCreatedAt());
    }

    @Override
    public Optional<OtpToken> findVigenteByUsuarioId(Long usuarioId) {
        return jpa.findVigenteByUsuarioId(usuarioId)
                .map(e -> OtpToken.reconstituir(e.getId(), e.getUsuarioId(), e.getCodigo(),
                        e.getExpiraEn(), e.isUsado(), e.getCreatedAt()));
    }

    @Override
    public void invalidarTodosParaUsuario(Long usuarioId) {
        jpa.invalidarTodosParaUsuario(usuarioId);
    }
}
