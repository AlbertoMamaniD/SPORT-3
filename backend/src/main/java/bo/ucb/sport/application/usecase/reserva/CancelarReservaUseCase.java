package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.domain.exception.AccesoDenegadoException;
import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.model.usuario.RolUsuario;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CancelarReservaUseCase {

    private final ReservaRepository reservaRepository;
    private final UsuarioRepository usuarioRepository;

    public CancelarReservaUseCase(ReservaRepository reservaRepository,
                                   UsuarioRepository usuarioRepository) {
        this.reservaRepository = reservaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public void execute(Long reservaId, Long usuarioId) {
        Reserva reserva = reservaRepository.findById(new ReservaId(reservaId))
                .orElseThrow(() -> new ReservaNoEncontradaException("Reserva no encontrada: " + reservaId));

        // RN-10: solo el dueño o un ADMIN pueden cancelar
        boolean esAdmin = usuarioRepository.findById(usuarioId)
                .map(u -> u.getRol() == RolUsuario.ADMIN)
                .orElse(false);

        if (!esAdmin && !reserva.getUsuarioId().equals(usuarioId))
            throw new AccesoDenegadoException("No puede cancelar una reserva que no le pertenece");

        reserva.cancelar();
        reservaRepository.save(reserva);
    }
}
