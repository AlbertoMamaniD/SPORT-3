package bo.ucb.sport.infrastructure.persistence.jpa;

import bo.ucb.sport.infrastructure.persistence.entity.OtpTokenJpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface OtpTokenJpaRepository extends JpaRepository<OtpTokenJpa, Long> {

    @Query("SELECT o FROM OtpTokenJpa o WHERE o.usuarioId = :uid AND o.usado = false ORDER BY o.expiraEn DESC LIMIT 1")
    Optional<OtpTokenJpa> findVigenteByUsuarioId(@Param("uid") Long usuarioId);

    @Modifying
    @Query("UPDATE OtpTokenJpa o SET o.usado = true WHERE o.usuarioId = :uid AND o.usado = false")
    void invalidarTodosParaUsuario(@Param("uid") Long usuarioId);
}
