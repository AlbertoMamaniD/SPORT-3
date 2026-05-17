package bo.ucb.sport.application.usecase.pago;

import bo.ucb.sport.application.port.PagoOnlinePort;
import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.repository.PagoRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProcesarPagoOnlineUseCaseTest {

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private ReservaRepository reservaRepository;

    @Mock
    private PagoOnlinePort pagoOnlinePort;

    @InjectMocks
    private ProcesarPagoOnlineUseCase useCase;

    @Test
    void debeCompletarPagoYConfirmarReserva_CuandoPagoEsExitoso() {
        // Arrange
        Long reservaId = 55L;
        String referencia = "REF-999";
        BigDecimal monto = new BigDecimal("150.00");

        Pago pago = mock(Pago.class);
        when(pago.getMonto()).thenReturn(monto);
        when(pagoRepository.findByReservaId(reservaId)).thenReturn(Optional.of(pago));

        // Simulamos que la pasarela online responde ÉXITO
        when(pagoOnlinePort.procesarPago(reservaId, referencia, monto)).thenReturn(true);

        Reserva reserva = mock(Reserva.class);
        when(reservaRepository.findById(new ReservaId(reservaId))).thenReturn(Optional.of(reserva));

        when(pagoRepository.save(pago)).thenReturn(pago);

        // Act
        Pago resultado = useCase.execute(reservaId, referencia);

        // Assert
        assertNotNull(resultado);
        verify(pago, times(1)).completar(referencia);
        verify(reserva, times(1)).confirmar();
        verify(reservaRepository, times(1)).save(reserva);
        verify(pagoRepository, times(1)).save(pago);
    }

    @Test
    void debeRechazarPago_CuandoPasarelaFalla() {
        // Arrange
        Long reservaId = 55L;
        String referencia = "REF-999";
        BigDecimal monto = new BigDecimal("150.00");

        Pago pago = mock(Pago.class);
        when(pago.getMonto()).thenReturn(monto);
        when(pagoRepository.findByReservaId(reservaId)).thenReturn(Optional.of(pago));

        // Simulamos que la pasarela online responde FALLO
        when(pagoOnlinePort.procesarPago(reservaId, referencia, monto)).thenReturn(false);

        when(pagoRepository.save(pago)).thenReturn(pago);

        // Act
        Pago resultado = useCase.execute(reservaId, referencia);

        // Assert
        assertNotNull(resultado);
        verify(pago, times(1)).rechazar();
        verify(reservaRepository, never()).findById(any());
        verify(pagoRepository, times(1)).save(pago);
    }
}
