package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.usecase.pago.ProcesarPagoOnlineUseCase;
import bo.ucb.sport.application.usecase.pago.RegistrarPagoPresencialUseCase;
import bo.ucb.sport.application.usecase.pago.SubirComprobanteUseCase;
import bo.ucb.sport.application.usecase.pago.AprobarComprobanteUseCase;
import bo.ucb.sport.application.usecase.pago.RechazarComprobanteUseCase;
import bo.ucb.sport.domain.model.pago.ConceptoPago;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.upload-preset}")
    private String uploadPreset;

    private final ProcesarPagoOnlineUseCase pagoOnline;
    private final RegistrarPagoPresencialUseCase pagoPresencial;
    private final SubirComprobanteUseCase subirComprobanteUseCase;
    private final AprobarComprobanteUseCase aprobarComprobanteUseCase;
    private final RechazarComprobanteUseCase rechazarComprobanteUseCase;

    public PagoController(ProcesarPagoOnlineUseCase pagoOnline,
                           RegistrarPagoPresencialUseCase pagoPresencial,
                           SubirComprobanteUseCase subirComprobanteUseCase,
                           AprobarComprobanteUseCase aprobarComprobanteUseCase,
                           RechazarComprobanteUseCase rechazarComprobanteUseCase) {
        this.pagoOnline = pagoOnline;
        this.pagoPresencial = pagoPresencial;
        this.subirComprobanteUseCase = subirComprobanteUseCase;
        this.aprobarComprobanteUseCase = aprobarComprobanteUseCase;
        this.rechazarComprobanteUseCase = rechazarComprobanteUseCase;
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

    @PostMapping("/{reservaId}/comprobante")
    public ResponseEntity<Map<String, String>> subirComprobante(
            @PathVariable Long reservaId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "concepto", defaultValue = "RESERVA_INICIAL") String conceptoStr) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "El archivo no puede estar vacío"));
        }

        if (cloudName == null || cloudName.trim().isEmpty() || uploadPreset == null || uploadPreset.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error: Las credenciales de Cloudinary no están configuradas en el servidor."));
        }

        try {
            // Subir a Cloudinary usando RestTemplate
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });
            body.add("upload_preset", uploadPreset);

            HttpEntity<LinkedMultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String cloudinaryUrl = "https://api.cloudinary.com/v1_1/" + cloudName + "/image/upload";

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(cloudinaryUrl, requestEntity, Map.class);

            if (response == null || !response.containsKey("secure_url")) {
                throw new IOException("No se pudo obtener la URL de Cloudinary de la respuesta.");
            }

            String urlComprobante = (String) response.get("secure_url");

            ConceptoPago concepto = ConceptoPago.valueOf(conceptoStr.toUpperCase());
            var pago = subirComprobanteUseCase.execute(reservaId, concepto, urlComprobante);

            return ResponseEntity.ok(Map.of(
                    "estado", pago.getEstado().name(),
                    "urlComprobante", urlComprobante
            ));

        } catch (IOException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("mensaje", "Error al subir comprobante a Cloudinary: " + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", "Concepto de pago inválido"));
        }
    }

    @PostMapping("/{reservaId}/comprobante/aprobar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> aprobarComprobante(
            @PathVariable Long reservaId,
            @RequestParam(value = "concepto", defaultValue = "RESERVA_INICIAL") String conceptoStr) {
        ConceptoPago concepto = ConceptoPago.valueOf(conceptoStr.toUpperCase());
        var pago = aprobarComprobanteUseCase.execute(reservaId, concepto);
        return ResponseEntity.ok(Map.of("estado", pago.getEstado().name()));
    }

    @PostMapping("/{reservaId}/comprobante/rechazar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> rechazarComprobante(
            @PathVariable Long reservaId,
            @RequestParam(value = "concepto", defaultValue = "RESERVA_INICIAL") String conceptoStr) {
        ConceptoPago concepto = ConceptoPago.valueOf(conceptoStr.toUpperCase());
        var pago = rechazarComprobanteUseCase.execute(reservaId, concepto);
        return ResponseEntity.ok(Map.of("estado", pago.getEstado().name()));
    }
}
