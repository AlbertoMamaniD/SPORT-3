package bo.ucb.sport.application.usecase.auth;

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

/**
 * Caso de uso — Verificar OTP y retornar JWT.
 * RN-02..05: vigencia, unicidad, marcado como usado.
 */
@Service
@Transactional
public class VerificarOtpUseCase {

    private final UsuarioRepository usuarioRepository;
    private final OtpTokenRepository otpTokenRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public VerificarOtpUseCase(UsuarioRepository usuarioRepository,
                                OtpTokenRepository otpTokenRepository,
                                JwtTokenProvider jwtTokenProvider) {
        this.usuarioRepository = usuarioRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public record Result(String token, String rol, String nombre) {}

    public Result execute(String telefono, String codigo) {
        Telefono tel = new Telefono(telefono);
        Usuario usuario = usuarioRepository.findByTelefono(tel)
                .orElseThrow(() -> new UsuarioNoEncontradoException("Usuario no encontrado"));

        OtpToken otp = otpTokenRepository.findVigenteByUsuarioId(usuario.getId())
                .orElseThrow(() -> new OtpInvalidoException("No hay OTP activo para este usuario"));

        if (!otp.estaVigente())
            throw new OtpInvalidoException("El OTP ha expirado");

        if (!otp.getCodigo().equals(codigo))
            throw new OtpInvalidoException("Código OTP incorrecto");

        otp.marcarUsado();
        otpTokenRepository.save(otp);

        // Marcar usuario como verificado si aún no lo estaba
        if (!usuario.isVerificado()) {
            usuario.verificar();
            usuarioRepository.save(usuario);
        }

        String token = jwtTokenProvider.generarToken(usuario.getId(), usuario.getRol().name());
        return new Result(token, usuario.getRol().name(), usuario.getNombre());
    }
}
