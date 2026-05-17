package bo.ucb.sport.infrastructure.persistence.repository;

import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.repository.PagoRepository;
import bo.ucb.sport.infrastructure.persistence.jpa.PagoJpaRepository;
import bo.ucb.sport.infrastructure.persistence.mapper.PagoMapper;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PagoRepositoryImpl implements PagoRepository {

    private final PagoJpaRepository jpa;
    private final PagoMapper mapper;

    public PagoRepositoryImpl(PagoJpaRepository jpa, PagoMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Pago save(Pago pago) {
        return mapper.toDomain(jpa.save(mapper.toJpa(pago)));
    }

    @Override
    public Optional<Pago> findByReservaId(Long reservaId) {
        return jpa.findByReservaId(reservaId).map(mapper::toDomain);
    }
}
