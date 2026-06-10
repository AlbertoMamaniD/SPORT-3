package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.application.command.CrearReservaCommand;
import bo.ucb.sport.application.port.SmsPort;
import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.*;
import bo.ucb.sport.domain.service.CalculadorPrecioService;
import bo.ucb.sport.domain.service.DisponibilidadService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CrearReservaUseCaseTest {

    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private CanchaRepository canchaRepository;
    @Mock
    private PrecioRepository precioRepository;
    @Mock
    private PagoRepository pagoRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private DisponibilidadService disponibilidadService;
    @Mock
    private CalculadorPrecioService calculadorPrecio;
    @Mock
    private SmsPort smsPort;

    @InjectMocks
    private CrearReservaUseCase useCase;

    @Test
    void debeCrearReservaExitosamente_CuandoCanchaYHorarioEstanDisponibles() {
        // Arrange
        Long canchaId = 1L;
        Long usuarioId = 2L;
        LocalDate fecha = LocalDate.now().plusDays(1);
        String horaInicio = "08:00";
        String horaFin = "09:00";
        String metodoPago = "PRESENCIAL";

        CrearReservaCommand cmd = new CrearReservaCommand(usuarioId, canchaId, fecha, horaInicio, horaFin, metodoPago);

        Cancha cancha = mock(Cancha.class);
        when(cancha.isActiva()).thenReturn(true);
        when(cancha.getNombre()).thenReturn("Cancha Fúbol 7");
        when(canchaRepository.findById(canchaId)).thenReturn(Optional.of(cancha));

        // Simulamos disponibilidad sin lanzar excepciones
        doNothing().when(disponibilidadService).verificar(eq(canchaId), eq(fecha), any(FranjaHoraria.class));

        // Simulamos precio
        when(precioRepository.findVigentesByCanchaId(canchaId)).thenReturn(new ArrayList<>());
        when(calculadorPrecio.calcular(any(), eq(fecha), any(FranjaHoraria.class))).thenReturn(new BigDecimal("120.00"));

        // Mock de guardado
        Reserva mockReserva = mock(Reserva.class);
        when(mockReserva.getId()).thenReturn(new bo.ucb.sport.domain.model.reserva.ReservaId(10L));
        when(reservaRepository.save(any(Reserva.class))).thenReturn(mockReserva);

        // Mock de usuario para la notificación SMS
        Usuario usuario = mock(Usuario.class);
        when(usuario.getTelefono()).thenReturn(new Telefono("+59168699904"));
        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuario));

        // Act
        Reserva resultado = useCase.execute(cmd);

        // Assert
        assertNotNull(resultado);
        assertEquals(10L, resultado.getId().valor());

        // Verificamos que se guardó la reserva, el pago y se envió la confirmación
        verify(reservaRepository, times(1)).save(any(Reserva.class));
        verify(pagoRepository, times(1)).save(any());
        verify(smsPort, times(1)).enviarConfirmacion(eq("+59168699904"), anyString());
    }

    @Test
    void debeLanzarExcepcion_CuandoLaCanchaNoEstaActiva() {
        // Arrange
        Long canchaId = 1L;
        CrearReservaCommand cmd = new CrearReservaCommand(2L, canchaId, LocalDate.now(), "08:00", "09:00", "PRESENCIAL");

        Cancha cancha = mock(Cancha.class);
        when(cancha.isActiva()).thenReturn(false); // Inactiva!
        when(canchaRepository.findById(canchaId)).thenReturn(Optional.of(cancha));

        // Act & Assert
        assertThrows(CanchaNoDisponibleException.class, () -> useCase.execute(cmd));

        verify(reservaRepository, never()).save(any());
        verify(pagoRepository, never()).save(any());
        verify(smsPort, never()).enviarConfirmacion(any(), any());
    }
}
