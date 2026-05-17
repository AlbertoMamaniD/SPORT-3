package bo.ucb.sport.interfaces.rest;

import bo.ucb.sport.application.command.RegistrarUsuarioCommand;
import bo.ucb.sport.application.usecase.auth.IniciarSesionUseCase;
import bo.ucb.sport.application.usecase.auth.RegistrarUsuarioUseCase;
import bo.ucb.sport.application.usecase.auth.VerificarOtpUseCase;
import bo.ucb.sport.interfaces.dto.request.LoginRequest;
import bo.ucb.sport.interfaces.dto.request.RegistroUsuarioRequest;
import bo.ucb.sport.interfaces.dto.request.VerificarOtpRequest;
import bo.ucb.sport.interfaces.dto.response.AuthResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegistrarUsuarioUseCase registrarUsuarioUseCase;
    private final VerificarOtpUseCase verificarOtpUseCase;
    private final IniciarSesionUseCase iniciarSesionUseCase;

    public AuthController(RegistrarUsuarioUseCase registrarUsuarioUseCase,
                          VerificarOtpUseCase verificarOtpUseCase,
                          IniciarSesionUseCase iniciarSesionUseCase) {
        this.registrarUsuarioUseCase = registrarUsuarioUseCase;
        this.verificarOtpUseCase = verificarOtpUseCase;
        this.iniciarSesionUseCase = iniciarSesionUseCase;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegistroUsuarioRequest req) {
        registrarUsuarioUseCase.execute(new RegistrarUsuarioCommand(req.nombre(), req.telefono()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("mensaje", "OTP enviado al número registrado"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerificarOtpRequest req) {
        var result = verificarOtpUseCase.execute(req.telefono(), req.codigo());
        return ResponseEntity.ok(new AuthResponse(result.token(), result.rol(), result.nombre()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@Valid @RequestBody LoginRequest req) {
        iniciarSesionUseCase.execute(req.telefono());
        return ResponseEntity.ok(Map.of("mensaje", "OTP enviado"));
    }
}
