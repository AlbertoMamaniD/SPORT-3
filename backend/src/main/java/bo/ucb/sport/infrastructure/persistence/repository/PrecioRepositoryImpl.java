package bo.ucb.sport.infrastructure.persistence.repository;

import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.repository.PrecioRepository;
import bo.ucb.sport.infrastructure.persistence.jpa.PrecioJpaRepository;
import bo.ucb.sport.infrastructure.persistence.mapper.PrecioMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class PrecioRepositoryImpl implements PrecioRepository {

    private final PrecioJpaRepository jpa;
    private final PrecioMapper mapper;

    public PrecioRepositoryImpl(PrecioJpaRepository jpa, PrecioMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Precio save(Precio precio) {
        return mapper.toDomain(jpa.save(mapper.toJpa(precio)));
    }

    @Override
    public List<Precio> findVigentesByCanchaId(Long canchaId) {
        return jpa.findByCanchaIdAndVigenteTrue(canchaId).stream()
                .map(mapper::toDomain).toList();
    }

    @Override
    public void invalidarPorCanchaId(Long canchaId) {
        jpa.invalidarPorCanchaId(canchaId);
    }
}
