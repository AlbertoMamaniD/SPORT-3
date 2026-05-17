package bo.ucb.sport.infrastructure.persistence.jpa;

import bo.ucb.sport.infrastructure.persistence.entity.PagoJpa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagoJpaRepository extends JpaRepository<PagoJpa, Long> {
    Optional<PagoJpa> findByReservaId(Long reservaId);
}
