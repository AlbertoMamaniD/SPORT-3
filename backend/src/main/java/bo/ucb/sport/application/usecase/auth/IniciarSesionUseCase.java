package bo.ucb.sport.application.usecase.auth;

import bo.ucb.sport.application.port.SmsPort;
import bo.ucb.sport.domain.exception.OtpInvalidoException;
import bo.ucb.sport.domain.exception.UsuarioNoEncontradoException;
import bo.ucb.sport.domain.model.usuario.OtpToken;
import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.OtpTokenRepository;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import bo.ucb.sport.infrastructure.security.JwtTokenProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

/**
 * Caso de uso — Iniciar sesión (login).
 * RN-02: solo usuarios verificados. Genera nuevo OTP.
 */
@Service
@Transactional
public class IniciarSesionUseCase {

    private final UsuarioRepository usuarioRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final SmsPort smsPort;
    private final SecureRandom secureRandom = new SecureRandom();

    public IniciarSesionUseCase(UsuarioRepository usuarioRepository,
                                 OtpTokenRepository otpTokenRepository,
                                 SmsPort smsPort) {
        this.usuarioRepository = usuarioRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.smsPort = smsPort;
    }

    public void execute(String telefono) {
        Telefono tel = new Telefono(telefono);
        Usuario usuario = usuarioRepository.findByTelefono(tel)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        if (!usuario.isVerificado())
            throw new OtpInvalidoException("Debe verificar su cuenta antes de iniciar sesión");
        if (!usuario.isActivo())
            throw new OtpInvalidoException("Cuenta desactivada");

        // Invalidar OTPs anteriores
        otpTokenRepository.invalidarTodosParaUsuario(usuario.getId());

        String codigo = String.valueOf(100_000 + secureRandom.nextInt(900_000));
        OtpToken otp = OtpToken.crear(usuario.getId(), codigo);
        otpTokenRepository.save(otp);

        smsPort.enviarOtp(telefono, codigo);
    }
}
