package bo.ucb.sport.application.usecase.auth;

import bo.ucb.sport.domain.exception.OtpInvalidoException;
import bo.ucb.sport.domain.exception.UsuarioNoEncontradoException;
import bo.ucb.sport.domain.model.usuario.OtpToken;
import bo.ucb.sport.domain.model.usuario.RolUsuario;
import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.OtpTokenRepository;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import bo.ucb.sport.infrastructure.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class VerificarOtpUseCaseTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private VerificarOtpUseCase useCase;

    @Test
    void debeVerificarOtpYGenerarJwt_CuandoOtpEsCorrecto() {
        // Arrange
        String telefono = "+59170010020";
        String codigo = "123456";

        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(1L);
        when(usuario.getRol()).thenReturn(RolUsuario.USUARIO);
        when(usuario.getNombre()).thenReturn("Chango QA");
        when(usuario.isVerificado()).thenReturn(false);

        OtpToken otpToken = mock(OtpToken.class);
        when(otpToken.estaVigente()).thenReturn(true);
        when(otpToken.getCodigo()).thenReturn(codigo);

        when(usuarioRepository.findByTelefono(new Telefono(telefono))).thenReturn(Optional.of(usuario));
        when(otpTokenRepository.findVigenteByUsuarioId(1L)).thenReturn(Optional.of(otpToken));
        when(jwtTokenProvider.generarToken(1L, "USUARIO")).thenReturn("mock-jwt-token");

        // Act
        VerificarOtpUseCase.Result resultado = useCase.execute(telefono, codigo);

        // Assert
        assertNotNull(resultado);
        assertEquals("mock-jwt-token", resultado.token());
        assertEquals("USUARIO", resultado.rol());

        // Verificamos que se marcó el OTP como usado
        verify(otpToken).marcarUsado();
        verify(otpTokenRepository, times(1)).save(otpToken);

        // Verificamos que se cambió el estado del usuario a verificado
        verify(usuario).verificar();
        verify(usuarioRepository, times(1)).save(usuario);
    }

    @Test
    void debeLanzarExcepcion_CuandoOtpEsIncorrecto() {
        // Arrange
        String telefono = "+59170010020";
        String codigoEnviado = "999999";

        Usuario usuario = mock(Usuario.class);
        when(usuario.getId()).thenReturn(1L);

        OtpToken otpToken = mock(OtpToken.class);
        when(otpToken.estaVigente()).thenReturn(true);
        when(otpToken.getCodigo()).thenReturn("123456"); // Diferente al enviado

        when(usuarioRepository.findByTelefono(new Telefono(telefono))).thenReturn(Optional.of(usuario));
        when(otpTokenRepository.findVigenteByUsuarioId(1L)).thenReturn(Optional.of(otpToken));

        // Act & Assert
        assertThrows(OtpInvalidoException.class, () -> useCase.execute(telefono, codigoEnviado));

        verify(otpToken, never()).marcarUsado();
        verify(jwtTokenProvider, never()).generarToken(anyLong(), anyString());
    }
}
