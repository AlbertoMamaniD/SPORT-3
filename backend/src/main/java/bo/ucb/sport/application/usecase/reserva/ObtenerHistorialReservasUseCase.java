package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.repository.ReservaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ObtenerHistorialReservasUseCase {

    private final ReservaRepository reservaRepository;

    public ObtenerHistorialReservasUseCase(ReservaRepository reservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    public List<Reserva> execute(Long usuarioId) {
        return reservaRepository.findByUsuarioId(usuarioId);
    }
}
