package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.command.ConfigurarPrecioCommand;
import bo.ucb.sport.application.usecase.cancha.CrearCanchaUseCase;
import bo.ucb.sport.application.usecase.cancha.DesactivarCanchaUseCase;
import bo.ucb.sport.application.usecase.cancha.EditarCanchaUseCase;
import bo.ucb.sport.application.usecase.precio.ConfigurarPrecioUseCase;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import bo.ucb.sport.domain.repository.ReservaRepository;
import bo.ucb.sport.interfaces.dto.request.ConfigurarPrecioRequest;
import bo.ucb.sport.interfaces.dto.request.CrearCanchaRequest;
import bo.ucb.sport.interfaces.dto.response.CanchaResponse;
import bo.ucb.sport.interfaces.dto.response.ReservaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final CanchaRepository canchaRepository;
    private final ReservaRepository reservaRepository;

    public AdminController(CrearCanchaUseCase crearCancha,
                            EditarCanchaUseCase editarCancha,
                            DesactivarCanchaUseCase desactivarCancha,
                            ConfigurarPrecioUseCase configurarPrecio,
                            CanchaRepository canchaRepository,
                            ReservaRepository reservaRepository) {
        this.crearCancha = crearCancha;
        this.editarCancha = editarCancha;
        this.desactivarCancha = desactivarCancha;
        this.configurarPrecio = configurarPrecio;
        this.canchaRepository = canchaRepository;
        this.reservaRepository = reservaRepository;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        long totalCanchas = canchaRepository.findAll().size();
        long canchasActivas = canchaRepository.findAllActivas().size();
        return ResponseEntity.ok(Map.of(
                "totalCanchas", totalCanchas,
                "canchasActivas", canchasActivas,
                "mensaje", "Panel de administración SPORT"
        ));
    }

    @PostMapping("/canchas")
    public ResponseEntity<CanchaResponse> crearCancha(@Valid @RequestBody CrearCanchaRequest req) {
        Cancha c = crearCancha.execute(req.nombre(), req.tipo(), req.capacidad());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new CanchaResponse(c.getId(), c.getNombre(), c.getTipo().name(), c.getCapacidad(), c.isActiva()));
    }

    @PutMapping("/canchas/{id}")
    public ResponseEntity<CanchaResponse> editarCancha(@PathVariable Long id, @RequestBody CrearCanchaRequest req) {
        Cancha c = editarCancha.execute(id, req.nombre(), req.capacidad());
        return ResponseEntity.ok(new CanchaResponse(c.getId(), c.getNombre(), c.getTipo().name(), c.getCapacidad(), c.isActiva()));
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
                req.diaSemana(), req.esFeriado()
        );
        configurarPrecio.execute(cmd);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Precio configurado correctamente"));
    }
}
