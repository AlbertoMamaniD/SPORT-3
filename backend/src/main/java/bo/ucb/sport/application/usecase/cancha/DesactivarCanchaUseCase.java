package bo.ucb.sport.application.usecase.cancha;

import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DesactivarCanchaUseCase {

    private final CanchaRepository canchaRepository;

    public DesactivarCanchaUseCase(CanchaRepository canchaRepository) {
        this.canchaRepository = canchaRepository;
    }

    public void execute(Long id) {
        Cancha cancha = canchaRepository.findById(id)
                .orElseThrow(() -> new CanchaNoDisponibleException("Cancha no encontrada: " + id));
        cancha.desactivar();
        canchaRepository.save(cancha);
    }
}
