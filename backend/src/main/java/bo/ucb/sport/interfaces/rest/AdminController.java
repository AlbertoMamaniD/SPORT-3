package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.command.ConfigurarPrecioCommand;
import bo.ucb.sport.application.usecase.cancha.CrearCanchaUseCase;
import bo.ucb.sport.application.usecase.cancha.DesactivarCanchaUseCase;
import bo.ucb.sport.application.usecase.cancha.EditarCanchaUseCase;
import bo.ucb.sport.application.usecase.precio.ConfigurarPrecioUseCase;
import bo.ucb.sport.application.usecase.reserva.CancelarReservaUseCase;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.interfaces.dto.request.ConfigurarPrecioRequest;
import bo.ucb.sport.interfaces.dto.request.CrearCanchaRequest;
import bo.ucb.sport.interfaces.dto.response.CanchaResponse;
import bo.ucb.sport.interfaces.dto.response.PagoAdminDTO;
import bo.ucb.sport.interfaces.dto.response.ReservaResponse;
import bo.ucb.sport.domain.repository.PagoRepository;
import bo.ucb.sport.domain.model.pago.Pago;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

        private final CrearCanchaUseCase crearCancha;
        private final EditarCanchaUseCase editarCancha;
        private final DesactivarCanchaUseCase desactivarCancha;
        private final ConfigurarPrecioUseCase configurarPrecio;
        private final CancelarReservaUseCase cancelarReserva;
        private final CanchaRepository canchaRepository;
        private final ReservaRepository reservaRepository;
        private final bo.ucb.sport.domain.repository.PrecioRepository precioRepository;
        private final bo.ucb.sport.domain.repository.UsuarioRepository usuarioRepository;
        private final PagoRepository pagoRepository;

        public AdminController(CrearCanchaUseCase crearCancha,
                        EditarCanchaUseCase editarCancha,
                        DesactivarCanchaUseCase desactivarCancha,
                        ConfigurarPrecioUseCase configurarPrecio,
                        CancelarReservaUseCase cancelarReserva,
                        CanchaRepository canchaRepository,
                        ReservaRepository reservaRepository,
                        bo.ucb.sport.domain.repository.PrecioRepository precioRepository,
                        bo.ucb.sport.domain.repository.UsuarioRepository usuarioRepository,
                        PagoRepository pagoRepository) {
                this.crearCancha = crearCancha;
                this.editarCancha = editarCancha;
                this.desactivarCancha = desactivarCancha;
                this.configurarPrecio = configurarPrecio;
                this.cancelarReserva = cancelarReserva;
                this.canchaRepository = canchaRepository;
                this.reservaRepository = reservaRepository;
                this.precioRepository = precioRepository;
                this.usuarioRepository = usuarioRepository;
                this.pagoRepository = pagoRepository;
        }

        private List<bo.ucb.sport.interfaces.dto.response.ReservaAdminResponse> getReservasAdmin() {
                return reservaRepository.findAll().stream()
                                .map(r -> {
                                        String nombre = usuarioRepository.findById(r.getUsuarioId())
                                                        .map(u -> u.getNombre()).orElse("Usuario #" + r.getUsuarioId());
                                        
                                        List<Pago> pagosList = pagoRepository.findAllByReservaId(r.getId() != null ? r.getId().valor() : null);
                                        
                                        String estadoPago = "PENDIENTE";
                                        if (!pagosList.isEmpty()) {
                                            boolean anyPendiente = pagosList.stream().anyMatch(p -> p.getEstado() == bo.ucb.sport.domain.model.pago.EstadoPago.PENDIENTE);
                                            boolean anyCompletado = pagosList.stream().anyMatch(p -> p.getEstado() == bo.ucb.sport.domain.model.pago.EstadoPago.COMPLETADO);
                                            boolean allRechazados = pagosList.stream().allMatch(p -> p.getEstado() == bo.ucb.sport.domain.model.pago.EstadoPago.RECHAZADO);
                                            
                                            if (anyPendiente) {
                                                estadoPago = "PENDIENTE";
                                            } else if (anyCompletado) {
                                                estadoPago = "COMPLETADO";
                                            } else if (allRechazados) {
                                                estadoPago = "RECHAZADO";
                                            }
                                        } else {
                                            estadoPago = "PENDIENTE"; // Default si no hay pago
                                        }
                                        
                                        List<PagoAdminDTO> pagosDto = pagosList.stream()
                                            .map(p -> new PagoAdminDTO(
                                                    p.getConcepto().name(), 
                                                    p.getEstado().name(), 
                                                    p.getUrlComprobante(),
                                                    p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null
                                            ))
                                            .toList();

                                        return new bo.ucb.sport.interfaces.dto.response.ReservaAdminResponse(
                                                        r.getId() != null ? r.getId().valor() : null,
                                                        r.getCanchaId(),
                                                        r.getUsuarioId(),
                                                        nombre,
                                                        r.getFecha().toString(),
                                                        r.getFranja().inicio().toString(),
                                                        r.getFranja().fin().toString(),
                                                        r.getEstado().name(),
                                                        estadoPago,
                                                        pagosDto,
                                                        r.getMontoTotal());
                                })
                                .sorted((a, b) -> Long.compare(b.id(), a.id())) // order by id desc
                                .toList();
        }

        @GetMapping("/dashboard")
        public ResponseEntity<Map<String, Object>> dashboard() {
                long totalCanchas = canchaRepository.findAll().size();
                long canchasActivas = canchaRepository.findAllActivas().size();

                List<bo.ucb.sport.interfaces.dto.response.ReservaAdminResponse> todas = getReservasAdmin();
                String hoy = java.time.LocalDate.now().toString();

                List<bo.ucb.sport.interfaces.dto.response.ReservaAdminResponse> hoyReservas = todas.stream()
                                .filter(r -> r.fecha().equals(hoy))
                                .toList();

                long totalReservasHoy = hoyReservas.size();
                java.math.BigDecimal ingresosHoy = hoyReservas.stream()
                                .filter(r -> !"CANCELADA".equals(r.estado()))
                                .map(r -> r.montoTotal() != null ? r.montoTotal() : java.math.BigDecimal.ZERO)
                                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);

                long reservasPendientesPago = todas.stream()
                                .filter(r -> "PENDIENTE".equals(r.estadoPago()) && !"CANCELADA".equals(r.estado()))
                                .count();

                List<bo.ucb.sport.interfaces.dto.response.ReservaAdminResponse> reservasRecientes = todas.stream()
                                .limit(10)
                                .toList();

                return ResponseEntity.ok(Map.of(
                                "totalCanchas", totalCanchas,
                                "canchasActivas", canchasActivas,
                                "totalReservasHoy", totalReservasHoy,
                                "ingresosHoy", ingresosHoy,
                                "reservasPendientesPago", reservasPendientesPago,
                                "reservasRecientes", reservasRecientes,
                                "mensaje", "Panel de administración SPORT"));
        }

        @GetMapping("/reservas")
        public ResponseEntity<List<bo.ucb.sport.interfaces.dto.response.ReservaAdminResponse>> listarTodasReservas() {
                return ResponseEntity.ok(getReservasAdmin());
        }

        @DeleteMapping("/reservas/{id}")
        public ResponseEntity<Void> cancelarReservaAdmin(@PathVariable Long id,
                        @AuthenticationPrincipal Long usuarioId) {
                cancelarReserva.execute(id, usuarioId);
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/canchas")
        public ResponseEntity<CanchaResponse> crearCancha(@Valid @RequestBody CrearCanchaRequest req) {
                Cancha c = crearCancha.execute(req.nombre(), req.tipo(), req.capacidad());
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(new CanchaResponse(c.getId(), c.getNombre(), c.getTipo().name(), c.getCapacidad(),
                                                c.isActiva()));
        }

        @PutMapping("/canchas/{id}")
        public ResponseEntity<CanchaResponse> editarCancha(@PathVariable Long id, @RequestBody CrearCanchaRequest req) {
                Cancha c = editarCancha.execute(id, req.nombre(), req.capacidad());
                return ResponseEntity.ok(new CanchaResponse(c.getId(), c.getNombre(), c.getTipo().name(),
                                c.getCapacidad(), c.isActiva()));
        }

        @DeleteMapping("/canchas/{id}")
        public ResponseEntity<Void> desactivarCancha(@PathVariable Long id) {
                desactivarCancha.execute(id);
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/precios")
        public ResponseEntity<Map<String, String>> configurarPrecio(@Valid @RequestBody ConfigurarPrecioRequest req) {
                var cmd = new ConfigurarPrecioCommand(
                                req.canchaId(), req.precioHora(),
                                LocalTime.parse(req.horaInicio()), LocalTime.parse(req.horaFin()),
                                req.diaSemana(), req.esFeriado());
                configurarPrecio.execute(cmd);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(Map.of("mensaje", "Precio configurado correctamente"));
        }

        @GetMapping("/precios")
        public ResponseEntity<List<bo.ucb.sport.interfaces.dto.response.PrecioResponse>> listarPrecios() {
                List<bo.ucb.sport.interfaces.dto.response.PrecioResponse> res = precioRepository.findAllVigentes()
                                .stream()
                                .map(p -> new bo.ucb.sport.interfaces.dto.response.PrecioResponse(
                                                p.getId(), p.getCanchaId(), p.getPrecioHora(),
                                                p.getFranja().inicio().toString(), p.getFranja().fin().toString(),
                                                p.getDiaSemana() != null ? p.getDiaSemana().name() : null,
                                                p.isEsFeriado()))
                                .toList();
                return ResponseEntity.ok(res);
        }

        @DeleteMapping("/precios/{id}")
        public ResponseEntity<Void> eliminarPrecio(@PathVariable Long id) {
                precioRepository.deleteById(id);
                return ResponseEntity.noContent().build();
        }

        @PostMapping("/reservas/{id}/confirmar")
        public ResponseEntity<Map<String, String>> confirmarReserva(@PathVariable Long id) {
                bo.ucb.sport.domain.model.reserva.Reserva reserva = reservaRepository
                                .findById(new bo.ucb.sport.domain.model.reserva.ReservaId(id))
                                .orElseThrow(() -> new bo.ucb.sport.domain.exception.ReservaNoEncontradaException(
                                                "Reserva no encontrada: " + id));
                reserva.confirmar();
                reservaRepository.save(reserva);
                return ResponseEntity.ok(Map.of(
                                "mensaje", "Reserva confirmada correctamente",
                                "estado", reserva.getEstado().name()));
        }
}
