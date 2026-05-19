package bo.ucb.sport.application.usecase.reserva;

import bo.ucb.sport.application.command.AmpliarReservaCommand;
import bo.ucb.sport.domain.exception.AccesoDenegadoException;
import bo.ucb.sport.domain.exception.CanchaNoDisponibleException;
import bo.ucb.sport.domain.exception.ReservaNoEncontradaException;
import bo.ucb.sport.domain.model.precio.Precio;
import bo.ucb.sport.domain.model.reserva.FranjaHoraria;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.domain.model.reserva.ReservaId;
import bo.ucb.sport.domain.model.pago.ConceptoPago;
import bo.ucb.sport.domain.model.pago.MetodoPago;
import bo.ucb.sport.domain.model.pago.Pago;
import bo.ucb.sport.domain.repository.PagoRepository;
import bo.ucb.sport.domain.repository.PrecioRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.domain.service.CalculadorPrecioService;
import bo.ucb.sport.domain.service.DisponibilidadService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

@Service
@Transactional
public class AmpliarReservaUseCase {

    private final ReservaRepository reservaRepository;
    private final PrecioRepository precioRepository;
    private final PagoRepository pagoRepository;
    private final DisponibilidadService disponibilidadService;
    private final CalculadorPrecioService calculadorPrecio;

    public AmpliarReservaUseCase(ReservaRepository reservaRepository,
                                  PrecioRepository precioRepository,
                                  PagoRepository pagoRepository,
                                  DisponibilidadService disponibilidadService,
                                  CalculadorPrecioService calculadorPrecio) {
        this.reservaRepository = reservaRepository;
        this.precioRepository = precioRepository;
        this.pagoRepository = pagoRepository;
        this.disponibilidadService = disponibilidadService;
        this.calculadorPrecio = calculadorPrecio;
    }

    public Reserva execute(AmpliarReservaCommand cmd) {
        Reserva reserva = reservaRepository.findById(new ReservaId(cmd.reservaId()))
                .orElseThrow(() -> new ReservaNoEncontradaException("Reserva no encontrada: " + cmd.reservaId()));

        // RN-10: solo el propietario puede modificar su reserva
        if (!reserva.getUsuarioId().equals(cmd.usuarioId()))
            throw new AccesoDenegadoException("No puede modificar una reserva que no le pertenece");

        Duration extension = Duration.ofMinutes(cmd.minutosExtra());
        FranjaHoraria nuevaFranja = reserva.getFranja().extender(extension);

        // Verificar disponibilidad de la extensión
        FranjaHoraria soloExtension = new FranjaHoraria(reserva.getFranja().fin(), nuevaFranja.fin());
        disponibilidadService.verificar(reserva.getCanchaId(), reserva.getFecha(), soloExtension);

        // Calcular costo adicional
        List<Precio> precios = precioRepository.findVigentesByCanchaId(reserva.getCanchaId());
        BigDecimal costoAdicional = calculadorPrecio.calcular(precios, reserva.getFecha(), soloExtension);

        Reserva ampliada = reserva.ampliar(extension, costoAdicional);
        Reserva guardada = reservaRepository.save(ampliada);

        // Registrar el pago de la ampliación si hay costo adicional
        if (costoAdicional.compareTo(BigDecimal.ZERO) > 0) {
            Pago pagoAmpliacion = Pago.crear(
                guardada.getId().valor(),
                costoAdicional,
                MetodoPago.PRESENCIAL,   // Por defecto; se puede cambiar según el front
                ConceptoPago.AMPLIACION
            );
            pagoRepository.save(pagoAmpliacion);
        }

        return guardada;
    }
}
