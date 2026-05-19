package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.repository.CanchaRepository;
import bo.ucb.sport.domain.repository.PrecioRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.domain.service.CalculadorPrecioService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Caso de uso — Consultar disponibilidad de una cancha en una fecha.
 * Retorna slots de 30 minutos entre 07:00 y 23:00.
 */
@Service
@Transactional(readOnly = true)
public class ConsultarDisponibilidadUseCase {

    private final ReservaRepository reservaRepository;
    private final CanchaRepository canchaRepository;
    private final PrecioRepository precioRepository;
    private final CalculadorPrecioService calculadorPrecio;

    public ConsultarDisponibilidadUseCase(ReservaRepository reservaRepository,
                                           CanchaRepository canchaRepository,
                                           PrecioRepository precioRepository,
                                           CalculadorPrecioService calculadorPrecio) {
        this.reservaRepository = reservaRepository;
        this.canchaRepository = canchaRepository;
        this.precioRepository = precioRepository;
        this.calculadorPrecio = calculadorPrecio;
    }

    public record SlotDto(LocalTime horaInicio, LocalTime horaFin, boolean disponible, BigDecimal precio, boolean expirado) {}

    public List<SlotDto> execute(Long canchaId, LocalDate fecha) {
        List<Reserva> reservasActivas = reservaRepository.findActivasByCanchaIdAndFecha(canchaId, fecha);
        List<Precio> precios = precioRepository.findVigentesByCanchaId(canchaId);

        List<SlotDto> slots = new ArrayList<>();
        LocalTime cursor = LocalTime.of(7, 0);
        LocalTime fin = LocalTime.of(23, 0);

        while (cursor.isBefore(fin)) {
            LocalTime slotFin = cursor.plusMinutes(30);
            FranjaHoraria slot = new FranjaHoraria(cursor, slotFin);
            boolean ocupado = reservasActivas.stream()
                    .anyMatch(r -> r.getFranja().seSolapa(slot));
            
            // Si es hoy, las horas pasadas se marcan como expiradas (no disponibles)
            boolean pasado = fecha.isEqual(LocalDate.now()) && cursor.isBefore(LocalTime.now());
            boolean disponibleFinal = !ocupado && !pasado;

            BigDecimal precio = BigDecimal.ZERO;
            if (!precios.isEmpty()) {
                FranjaHoraria franjaUnaHora = new FranjaHoraria(cursor, cursor.plusHours(1));
                precio = calculadorPrecio.calcular(precios, fecha, franjaUnaHora);
            }
            slots.add(new SlotDto(cursor, slotFin, disponibleFinal, precio, pasado));
            cursor = slotFin;
        }
        return slots;
    }
}
