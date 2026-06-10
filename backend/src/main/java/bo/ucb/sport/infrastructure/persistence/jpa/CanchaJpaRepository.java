package bo.ucb.sport.infrastructure.persistence.jpa;

import bo.ucb.sport.infrastructure.persistence.entity.CanchaJpa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CanchaJpaRepository extends JpaRepository<CanchaJpa, Long> {
    List<CanchaJpa> findByActivaTrue();
}
