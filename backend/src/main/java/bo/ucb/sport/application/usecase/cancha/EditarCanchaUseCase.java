package bo.ucb.sport.application.usecase.cancha;

import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class EditarCanchaUseCase {

    private final CanchaRepository canchaRepository;

    public EditarCanchaUseCase(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    public Cancha execute(Long id, String nombre, int capacidad) {
        Cancha cancha = canchaRepository.findById(id)
                .orElseThrow(() -> new CanchaNoDisponibleException("Cancha no encontrada: " + id));
        cancha.editar(nombre, capacidad);
        return canchaRepository.save(cancha);
    }
}
