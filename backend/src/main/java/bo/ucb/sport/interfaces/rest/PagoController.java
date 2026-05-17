package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.usecase.pago.ProcesarPagoOnlineUseCase;
import bo.ucb.sport.application.usecase.pago.RegistrarPagoPresencialUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final ProcesarPagoOnlineUseCase pagoOnline;
    private final RegistrarPagoPresencialUseCase pagoPresencial;

    public PagoController(ProcesarPagoOnlineUseCase pagoOnline,
                           RegistrarPagoPresencialUseCase pagoPresencial) {
        this.pagoOnline = pagoOnline;
        this.pagoPresencial = pagoPresencial;
    }

    @PostMapping("/online")
    public ResponseEntity<Map<String, String>> pagoOnline(
            @RequestParam Long reservaId,
            @RequestParam String referencia) {
        var pago = pagoOnline.execute(reservaId, referencia);
        return ResponseEntity.ok(Map.of("estado", pago.getEstado().name()));
    }

    @PostMapping("/presencial")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> pagoPresencial(@RequestParam Long reservaId) {
        var pago = pagoPresencial.execute(reservaId);
        return ResponseEntity.ok(Map.of("estado", pago.getEstado().name()));
    }
}
