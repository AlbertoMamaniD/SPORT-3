package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.usecase.reserva.ConsultarDisponibilidadUseCase;
import bo.ucb.sport.domain.model.cancha.Cancha;
import bo.ucb.sport.domain.repository.CanchaRepository;
import bo.ucb.sport.interfaces.dto.response.CanchaResponse;
import bo.ucb.sport.interfaces.dto.response.SlotHorarioResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/canchas")
public class CanchaController {

    private final CanchaRepository canchaRepository;
    private final ConsultarDisponibilidadUseCase disponibilidadUseCase;

    public CanchaController(CanchaRepository canchaRepository,
                             ConsultarDisponibilidadUseCase disponibilidadUseCase) {
        this.canchaRepository = canchaRepository;
        this.disponibilidadUseCase = disponibilidadUseCase;
    }

    @GetMapping
    public ResponseEntity<List<CanchaResponse>> listarActivas() {
        List<CanchaResponse> canchas = canchaRepository.findAllActivas().stream()
                .map(this::toResponse).toList();
        return ResponseEntity.ok(canchas);
    }

    @GetMapping("/{id}/disponibilidad")
    public ResponseEntity<List<SlotHorarioResponse>> disponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        var slots = disponibilidadUseCase.execute(id, fecha).stream()
                .map(s -> new SlotHorarioResponse(s.horaInicio(), s.horaFin(), s.disponible(), s.precio()))
                .toList();
        return ResponseEntity.ok(slots);
    }

    private CanchaResponse toResponse(Cancha c) {
        return new CanchaResponse(c.getId(), c.getNombre(), c.getTipo().name(), c.getCapacidad(), c.isActiva());
    }
}
