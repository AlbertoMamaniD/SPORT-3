package bo.ucb.sport.infrastructure.persistence.jpa;

import bo.ucb.sport.infrastructure.persistence.entity.PrecioJpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrecioJpaRepository extends JpaRepository<PrecioJpa, Long> {

    List<PrecioJpa> findByCanchaIdAndVigenteTrue(Long canchaId);

    @Modifying
    @Query("UPDATE PrecioJpa p SET p.vigente = false WHERE p.canchaId = :canchaId")
    void invalidarPorCanchaId(@Param("canchaId") Long canchaId);
}
