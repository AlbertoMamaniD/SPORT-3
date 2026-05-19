package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.application.command.CrearReservaCommand;
import bo.ucb.sport.application.port.SmsPort;
import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;
import bo.ucb.sport.domain.exception.UsuarioNoEncontradoException;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.model.pago.MetodoPago;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.*;
import bo.ucb.sport.domain.service.CalculadorPrecioService;
import bo.ucb.sport.domain.service.DisponibilidadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class CrearReservaUseCase {

    private final ReservaRepository reservaRepository;
    private final CanchaRepository canchaRepository;
    private final PrecioRepository precioRepository;
    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final DisponibilidadService disponibilidadService;
    private final CalculadorPrecioService calculadorPrecio;
    private final SmsPort smsPort;

    public CrearReservaUseCase(ReservaRepository reservaRepository,
                                CanchaRepository canchaRepository,
                                PrecioRepository precioRepository,
                                PagoRepository pagoRepository,
                                UsuarioRepository usuarioRepository,
                                DisponibilidadService disponibilidadService,
                                CalculadorPrecioService calculadorPrecio,
                                SmsPort smsPort) {
        this.reservaRepository = reservaRepository;
        this.canchaRepository = canchaRepository;
        this.precioRepository = precioRepository;
        this.pagoRepository = pagoRepository;
        this.usuarioRepository = usuarioRepository;
        this.disponibilidadService = disponibilidadService;
        this.calculadorPrecio = calculadorPrecio;
        this.smsPort = smsPort;
    }

    public Reserva execute(CrearReservaCommand cmd) {
        // 1. Obtener cancha y validar activa (RN-09)
        Cancha cancha = canchaRepository.findById(cmd.canchaId())
                .orElseThrow(() -> new CanchaNoDisponibleException("Cancha no encontrada"));
        if (!cancha.isActiva())
            throw new CanchaNoDisponibleException("La cancha no está disponible para reservas");

        FranjaHoraria franja = new FranjaHoraria(
                LocalTime.parse(cmd.horaInicio()),
                LocalTime.parse(cmd.horaFin())
        );

        // 2. Validar disponibilidad (RN-08)
        disponibilidadService.verificar(cmd.canchaId(), cmd.fecha(), franja);

        // 3. Calcular precio
        List<Precio> precios = precioRepository.findVigentesByCanchaId(cmd.canchaId());
        BigDecimal monto = calculadorPrecio.calcular(precios, cmd.fecha(), franja);

        // 4. Crear reserva (RN-06, RN-07 validados en el agregado)
        Reserva reserva = Reserva.crear(cmd.usuarioId(), cmd.canchaId(), cmd.fecha(), franja, monto);
        reserva = reservaRepository.save(reserva);

        // 5. Crear pago en estado PENDIENTE (RN-16)
        MetodoPago metodo = MetodoPago.valueOf(cmd.metodoPago().toUpperCase());
        Pago pago = Pago.crear(reserva.getId().valor(), monto, metodo, bo.ucb.sport.domain.model.pago.ConceptoPago.RESERVA_INICIAL);
        pagoRepository.save(pago);

        // 6. Notificar por SMS
        usuarioRepository.findById(cmd.usuarioId()).ifPresent(u ->
            smsPort.enviarConfirmacion(u.getTelefono().valor(),
                    "Reserva creada para " + cancha.getNombre() + " el " +
                    cmd.fecha() + " " + franja.inicio() + "-" + franja.fin() +
                    ". Monto: Bs. " + monto)
        );

        return reserva;
    }
}
