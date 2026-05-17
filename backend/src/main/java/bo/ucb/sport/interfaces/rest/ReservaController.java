package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.command.AmpliarReservaCommand;
import bo.ucb.sport.application.command.CrearReservaCommand;
import bo.ucb.sport.application.usecase.reserva.*;
import bo.ucb.sport.domain.model.reserva.Reserva;
import bo.ucb.sport.interfaces.dto.request.AmpliarReservaRequest;
import bo.ucb.sport.interfaces.dto.request.CrearReservaRequest;
import bo.ucb.sport.interfaces.dto.response.ReservaResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final CrearReservaUseCase crearReserva;
    private final AmpliarReservaUseCase ampliarReserva;
    private final CancelarReservaUseCase cancelarReserva;
    private final ObtenerHistorialReservasUseCase historialReservas;

    public ReservaController(CrearReservaUseCase crearReserva,
                              AmpliarReservaUseCase ampliarReserva,
                              CancelarReservaUseCase cancelarReserva,
                              ObtenerHistorialReservasUseCase historialReservas) {
        this.crearReserva = crearReserva;
        this.ampliarReserva = ampliarReserva;
        this.cancelarReserva = cancelarReserva;
        this.historialReservas = historialReservas;
    }

    @PostMapping
    public ResponseEntity<ReservaResponse> crear(
            @Valid @RequestBody CrearReservaRequest req,
            @AuthenticationPrincipal Long usuarioId) {
        var cmd = new CrearReservaCommand(usuarioId, req.canchaId(), req.fecha(),
                req.horaInicio(), req.horaFin(), req.metodoPago());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(crearReserva.execute(cmd)));
    }

    @GetMapping("/historial")
    public ResponseEntity<List<ReservaResponse>> historial(@AuthenticationPrincipal Long usuarioId) {
        return ResponseEntity.ok(historialReservas.execute(usuarioId).stream().map(this::toResponse).toList());
    }

    @PutMapping("/{id}/ampliar")
    public ResponseEntity<ReservaResponse> ampliar(
            @PathVariable Long id,
            @Valid @RequestBody AmpliarReservaRequest req,
            @AuthenticationPrincipal Long usuarioId) {
        var cmd = new AmpliarReservaCommand(id, usuarioId, req.minutosExtra());
        return ResponseEntity.ok(toResponse(ampliarReserva.execute(cmd)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id, @AuthenticationPrincipal Long usuarioId) {
        cancelarReserva.execute(id, usuarioId);
        return ResponseEntity.noContent().build();
    }

    private ReservaResponse toResponse(Reserva r) {
        return new ReservaResponse(
                r.getId() != null ? r.getId().valor() : null,
                r.getCanchaId(), r.getUsuarioId(), r.getFecha(),
                r.getFranja().inicio(), r.getFranja().fin(),
                r.getEstado().name(), r.getMontoTotal()
        );
    }
}
