package bo.ucb.sport.infrastructure.persistence.jpa;

import bo.ucb.sport.infrastructure.persistence.entity.ReservaJpa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservaJpaRepository extends JpaRepository<ReservaJpa, Long> {

    List<ReservaJpa> findByUsuarioIdOrderByFechaDesc(Long usuarioId);

    @Query("""
        SELECT r FROM ReservaJpa r
        WHERE r.canchaId = :canchaId
          AND r.fecha = :fecha
          AND r.estado <> 'CANCELADA'
        """)
    List<ReservaJpa> findActivasByCanchaIdAndFecha(@Param("canchaId") Long canchaId,
                                                    @Param("fecha") LocalDate fecha);

    @Query("""
        SELECT COUNT(r) > 0 FROM ReservaJpa r
        WHERE r.canchaId = :canchaId
          AND r.fecha = :fecha
          AND r.estado <> 'CANCELADA'
          AND r.horaInicio < :fin
          AND r.horaFin > :inicio
        """)
    boolean existeSolapamiento(@Param("canchaId") Long canchaId,
                                @Param("fecha") LocalDate fecha,
                                @Param("inicio") LocalTime inicio,
                                @Param("fin") LocalTime fin);
}
