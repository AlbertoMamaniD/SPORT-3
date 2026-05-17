package bo.ucb.sport.infrastructure.persistence.repository;

import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.infrastructure.persistence.jpa.ReservaJpaRepository;
import bo.ucb.sport.infrastructure.persistence.mapper.ReservaMapper;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class ReservaRepositoryImpl implements ReservaRepository {

    private final ReservaJpaRepository jpa;
    private final ReservaMapper mapper;

    public ReservaRepositoryImpl(ReservaJpaRepository jpa, ReservaMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Reserva save(Reserva reserva) {
        return mapper.toDomain(jpa.save(mapper.toJpa(reserva)));
    }

    @Override
    public Optional<Reserva> findById(ReservaId id) {
        return jpa.findById(id.valor()).map(mapper::toDomain);
    }

    @Override
    public List<Reserva> findByUsuarioId(Long usuarioId) {
        return jpa.findByUsuarioIdOrderByFechaDesc(usuarioId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public List<Reserva> findActivasByCanchaIdAndFecha(Long canchaId, LocalDate fecha) {
        return jpa.findActivasByCanchaIdAndFecha(canchaId, fecha).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public boolean existeSolapamiento(Long canchaId, LocalDate fecha, FranjaHoraria franja) {
        return jpa.existeSolapamiento(canchaId, fecha, franja.inicio(), franja.fin());
    }
}
