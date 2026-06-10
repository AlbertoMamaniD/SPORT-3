package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.domain.exception.AccesoDenegadoException;
import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.model.usuario.RolUsuario;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CancelarReservaUseCaseTest {

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CancelarReservaUseCase useCase;

    @Test
    void debeCancelarReserva_CuandoElUsuarioEsElDuenio() {
        // Arrange
        Long reservaId = 100L;
        Long usuarioId = 2L;

        Reserva reserva = mock(Reserva.class);
        when(reserva.getUsuarioId()).thenReturn(usuarioId); // El dueño
        when(reservaRepository.findById(new ReservaId(reservaId))).thenReturn(Optional.of(reserva));

        Usuario usuario = mock(Usuario.class);
        when(usuario.getRol()).thenReturn(RolUsuario.USUARIO);
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

        // Act
        useCase.execute(reservaId, usuarioId);

        // Assert
        verify(reserva, times(1)).cancelar();
        verify(reservaRepository, times(1)).save(reserva);
    }

    @Test
    void debeCancelarReserva_CuandoElUsuarioEsAdminAunqueNoSeaElDuenio() {
        // Arrange
        Long reservaId = 100L;
        Long adminId = 99L;

        Reserva reserva = mock(Reserva.class);
        when(reservaRepository.findById(new ReservaId(reservaId))).thenReturn(Optional.of(reserva));

        Usuario admin = mock(Usuario.class);
        when(admin.getRol()).thenReturn(RolUsuario.ADMIN); // Es administrador!
        when(usuarioRepository.findById(adminId)).thenReturn(Optional.of(admin));

        // Act
        useCase.execute(reservaId, adminId);

        // Assert
        verify(reserva, times(1)).cancelar();
        verify(reservaRepository, times(1)).save(reserva);
    }

    @Test
    void debeLanzarExcepcion_CuandoElUsuarioNoEsDuenioNiAdmin() {
        // Arrange
        Long reservaId = 100L;
        Long intrusoId = 5L;

        Reserva reserva = mock(Reserva.class);
        when(reserva.getUsuarioId()).thenReturn(2L); // Pertenece a usuario 2
        when(reservaRepository.findById(new ReservaId(reservaId))).thenReturn(Optional.of(reserva));

        Usuario intruso = mock(Usuario.class);
        when(intruso.getRol()).thenReturn(RolUsuario.USUARIO); // No es admin
        when(usuarioRepository.findById(intrusoId)).thenReturn(Optional.of(intruso));

        // Act & Assert
        assertThrows(AccesoDenegadoException.class, () -> useCase.execute(reservaId, intrusoId));

        verify(reserva, never()).cancelar();
        verify(reservaRepository, never()).save(any());
    }
}
