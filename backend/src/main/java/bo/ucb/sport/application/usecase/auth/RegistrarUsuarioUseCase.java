package bo.ucb.sport.application.usecase.auth;

import bo.ucb.sport.application.command.RegistrarUsuarioCommand;
import bo.ucb.sport.application.port.SmsPort;
import bo.ucb.sport.domain.exception.UsuarioYaRegistradoException;
import bo.ucb.sport.domain.model.usuario.OtpToken;
import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.OtpTokenRepository;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

/**
 * Caso de uso — Registrar un nuevo usuario.
 * RN-01: teléfono único. Envía OTP por SMS.
 */
@Service
@Transactional
public class RegistrarUsuarioUseCase {

    private final UsuarioRepository usuarioRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final SmsPort smsPort;
    private final SecureRandom secureRandom = new SecureRandom();

    public RegistrarUsuarioUseCase(UsuarioRepository usuarioRepository,
                                    OtpTokenRepository otpTokenRepository,
                                    SmsPort smsPort) {
        this.usuarioRepository = usuarioRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.smsPort = smsPort;
    }

    public void execute(RegistrarUsuarioCommand cmd) {
        Telefono telefono = new Telefono(cmd.telefono());

        // RN-01: un teléfono = una cuenta
        if (usuarioRepository.existsByTelefono(telefono))
            throw new UsuarioYaRegistradoException("El número " + cmd.telefono() + " ya está registrado");

        Usuario usuario = Usuario.registrar(cmd.nombre(), telefono);
        usuario = usuarioRepository.save(usuario);

        String codigo = generarOtp();
        OtpToken otp = OtpToken.crear(usuario.getId(), codigo);
        otpTokenRepository.save(otp);

        smsPort.enviarOtp(cmd.telefono(), codigo);
    }

    private String generarOtp() {
        int code = 100_000 + secureRandom.nextInt(900_000);
        return String.valueOf(code);
    }
}
