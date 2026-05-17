package bo.ucb.sport.domain.repository;

import bo.ucb.sport.domain.model.cancha.Cancha;

import java.util.List;
import java.util.Optional;

public interface CanchaRepository {
    Optional<Cancha> findById(Long id);
    List<Cancha> findAllActivas();
    List<Cancha> findAll();
    Cancha save(Cancha cancha);
}
