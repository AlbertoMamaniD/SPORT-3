package bo.ucb.sport.application.usecase.cancha;

import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.model.cancha.TipoCancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CrearCanchaUseCase {

    private final CanchaRepository canchaRepository;

    public CrearCanchaUseCase(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    public Cancha execute(String nombre, String tipo, int capacidad) {
        Cancha cancha = Cancha.crear(nombre, TipoCancha.valueOf(tipo.toUpperCase()), capacidad);
        return canchaRepository.save(cancha);
    }
}
