package bo.ucb.sport.infrastructure.persistence.repository;

import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import bo.ucb.sport.infrastructure.persistence.jpa.CanchaJpaRepository;
import bo.ucb.sport.infrastructure.persistence.mapper.CanchaMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CanchaRepositoryImpl implements CanchaRepository {

    private final CanchaJpaRepository jpa;
    private final CanchaMapper mapper;

    public CanchaRepositoryImpl(CanchaJpaRepository jpa, CanchaMapper mapper) {
        this.jpa = jpa;
        this.mapper = mapper;
    }

    @Override
    public Optional<Cancha> findById(Long id) {
        return jpa.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<Cancha> findAllActivas() {
        return jpa.findByActivaTrue().stream().map(mapper::toDomain).toList();
    }

    @Override
    public List<Cancha> findAll() {
        return jpa.findAll().stream().map(mapper::toDomain).toList();
    }

    @Override
    public Cancha save(Cancha cancha) {
        return mapper.toDomain(jpa.save(mapper.toJpa(cancha)));
    }
}
