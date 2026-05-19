import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../../../infrastructure/api/sportApi';
import { SoccerBalls, WallyBalls } from '../../components/SportsBalls/SportsBalls';
import './Register.css';


export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');

  // UI states
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => {
      setAlert(null);
    }, 6000);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !telefono.trim()) {
      triggerAlert('danger', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await authService.register(nombre, telefono);
      triggerAlert('success', response.mensaje || 'Registro inicial completado. Código OTP enviado.');
      setStep('OTP');
    } catch (err: any) {
      const errMsg = err.response?.data?.mensaje || err.response?.data?.error || 'Error al registrar el usuario. Comprueba tu celular de pruebas Twilio.';
      triggerAlert('danger', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || codigo.length !== 6) {
      triggerAlert('danger', 'Por favor, ingresa el código OTP de 6 dígitos.');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const data = await authService.verifyOtp(telefono, codigo);

      // Guardar sesión en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('telefono', telefono);

      triggerAlert('success', '¡Cuenta creada e iniciada con éxito!');

      // Redireccionar al Dashboard usando la ruta real
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.mensaje || err.response?.data?.error || 'Código OTP incorrecto o vencido.';
      triggerAlert('danger', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      {/* Contenedor de balones de fútbol en movimiento (Izquierda) */}
      <SoccerBalls />

      <div className="register-card">

        <div className="login-header-logo">
          <div className="ball-container">
            {/* Balón de Fútbol */}
            <div className="ball soccer-ball">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#1e293b" strokeWidth="4" />
                <polygon points="50,30 38,38 43,53 57,53 62,38" fill="#1e293b" />
                <line x1="50" y1="30" x2="50" y2="10" stroke="#1e293b" strokeWidth="4" />
                <line x1="38" y1="38" x2="20" y2="30" stroke="#1e293b" strokeWidth="4" />
                <line x1="43" y1="53" x2="30" y2="70" stroke="#1e293b" strokeWidth="4" />
                <line x1="57" y1="53" x2="70" y2="70" stroke="#1e293b" strokeWidth="4" />
                <line x1="62" y1="38" x2="80" y2="30" stroke="#1e293b" strokeWidth="4" />
                <polygon points="50,10 42,4 58,4" fill="#1e293b" />
                <polygon points="20,30 12,24 16,40" fill="#1e293b" />
                <polygon points="30,70 18,74 30,86" fill="#1e293b" />
                <polygon points="70,70 82,74 70,86" fill="#1e293b" />
                <polygon points="80,30 88,24 84,40" fill="#1e293b" />
              </svg>
            </div>

            {/* Balón de Wally */}
            <div className="ball wally-ball">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                <circle cx="50" cy="50" r="46" fill="#facc15" stroke="#1e293b" strokeWidth="4" />
                <path d="M50,4 C24.6,4 4,24.6 4,50 C4,57.2 5.7,64 8.7,70 C14.3,55.7 28.5,45.7 45.1,45.1 C45.7,28.5 55.7,14.3 70,8.7 C64,5.7 57.2,4 50,4 Z" fill="#1d4ed8" />
                <path d="M96,50 C96,42.8 94.3,36 91.3,30 C85.7,44.3 71.5,54.3 54.9,54.9 C54.3,71.5 44.3,85.7 30,91.3 C36,94.3 42.8,96 50,96 C75.4,96 96,75.4 96,50 Z" fill="#ffffff" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="#1e293b" strokeWidth="4" />
                <path d="M8,30 C30,40 40,30 30,8" fill="none" stroke="#1e293b" strokeWidth="3" />
                <path d="M92,70 C70,60 60,70 70,92" fill="none" stroke="#1e293b" strokeWidth="3" />
                <path d="M30,92 C40,70 30,60 8,70" fill="none" stroke="#1e293b" strokeWidth="3" />
                <path d="M70,8 C60,30 70,40 92,30" fill="none" stroke="#1e293b" strokeWidth="3" />
              </svg>
            </div>
          </div>
          <h1 className="logo-brand">SPORT <span className="logo-number">3</span></h1>
        </div>

        {alert && (
          <div className={`register-alert register-alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        )}

        {step === 'FORM' ? (
          <form onSubmit={handleRegisterSubmit}>
            <h2 className="register-title">Crear Cuenta</h2>
            <p className="register-subtitle">
              Regístrate ingresando tus datos básicos y activa tu cuenta mediante OTP
            </p>

            <div className="register-input-group">
              <label className="register-label" htmlFor="reg-name">Nombre Completo</label>
              <div className="register-input-wrapper">
                <User size={18} style={{ position: 'absolute', left: '1.1rem', color: '#f97316' }} />
                <input
                  id="reg-name"
                  className="register-input-field"
                  type="text"
                  placeholder="Juan Perez"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="register-input-group">
              <label className="register-label" htmlFor="reg-phone">Celular (con código de país)</label>
              <div className="register-input-wrapper">
                <Phone size={18} style={{ position: 'absolute', left: '1.1rem', color: '#f97316' }} />
                <input
                  id="reg-phone"
                  className="register-input-field"
                  type="tel"
                  placeholder="+5917XXXXXXX"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
                Ejemplo: +59170000000
              </span>
            </div>

            <button className="register-btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creando...' : 'Crear Cuenta y Recibir OTP'}
            </button>

            <div className="register-switch-mode">
              ¿Ya tienes cuenta?{' '}
              <span className="register-link" onClick={() => navigate('/login')}>
                Inicia sesión
              </span>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtpSubmit}>
            <h2 className="register-title">Verificar OTP</h2>
            <p className="register-subtitle">
              Ingresa el código OTP de validación enviado a <strong style={{ color: '#ffffff' }}>{telefono}</strong>
            </p>

            <div className="register-input-group">
              <label className="register-label" htmlFor="reg-otp">Código OTP</label>
              <div className="register-input-wrapper">
                <KeyRound size={18} style={{ position: 'absolute', left: '1.1rem', color: '#f97316' }} />
                <input
                  id="reg-otp"
                  className="register-input-field register-input-otp"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <button className="register-btn-primary" type="submit" disabled={loading}>
              {loading ? 'Verificando...' : 'Verificar y Activar'}
            </button>

            <button
              className="register-btn-secondary"
              type="button"
              onClick={() => { setStep('FORM'); setCodigo(''); }}
              disabled={loading}
            >
              Volver al Formulario
            </button>
          </form>
        )}

      </div>

      {/* Contenedor de balones de wally en movimiento (Derecha) */}
      <WallyBalls />
    </div>
  );
};
