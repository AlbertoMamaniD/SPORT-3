package bo.ucb.sport.application.usecase.auth;

import bo.ucb.sport.application.command.RegistrarUsuarioCommand;
import bo.ucb.sport.application.port.SmsPort;
import bo.ucb.sport.domain.exception.UsuarioYaRegistradoException;
import bo.ucb.sport.domain.model.usuario.OtpToken;
import bo.ucb.sport.domain.model.usuario.Telefono;
import bo.ucb.sport.domain.model.usuario.Usuario;
import bo.ucb.sport.domain.repository.OtpTokenRepository;
import bo.ucb.sport.domain.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RegistrarUsuarioUseCaseTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private SmsPort smsPort;

    @InjectMocks
    private RegistrarUsuarioUseCase useCase;

    @Test
    void debeRegistrarUsuarioYEnviarSms_CuandoElTelefonoNoExiste() {
        // Arrange
        String nombre = "Chango Test";
        String telefono = "+59170010020";
        RegistrarUsuarioCommand cmd = new RegistrarUsuarioCommand(nombre, telefono);

        // Simulamos que el usuario NO existe
        when(usuarioRepository.existsByTelefono(new Telefono(telefono))).thenReturn(false);

        // Simulamos el guardado de usuario
        Usuario mockUser = mock(Usuario.class);
        when(mockUser.getId()).thenReturn(1L);
        when(usuarioRepository.save(any(Usuario.class))).thenReturn(mockUser);

        // Act
        useCase.execute(cmd);

        // Assert
        verify(usuarioRepository, times(1)).save(any(Usuario.class));
        verify(otpTokenRepository, times(1)).save(any(OtpToken.class));
        verify(smsPort, times(1)).enviarOtp(eq(telefono), anyString());
    }

    @Test
    void debeLanzarExcepcion_CuandoElTelefonoYaExiste() {
        // Arrange
        String nombre = "Chango Test";
        String telefono = "+59170010020";
        RegistrarUsuarioCommand cmd = new RegistrarUsuarioCommand(nombre, telefono);

        // Simulamos que el usuario YA existe
        when(usuarioRepository.existsByTelefono(new Telefono(telefono))).thenReturn(true);

        // Act & Assert
        assertThrows(UsuarioYaRegistradoException.class, () -> useCase.execute(cmd));

        // Verificamos que no se intentó guardar ni enviar SMS
        verify(usuarioRepository, never()).save(any(Usuario.class));
        verify(otpTokenRepository, never()).save(any());
        verify(smsPort, never()).enviarOtp(anyString(), anyString());
    }
}
