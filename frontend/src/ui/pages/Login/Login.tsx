import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  User,
  Trophy,
  CalendarCheck,
  ShieldCheck,
  CreditCard,
  Timer,
  Volleyball,
  CircleDot,
} from 'lucide-react';
import { authService } from '../../../infrastructure/api/sportApi';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!telefono.trim()) {
      triggerAlert('danger', 'Por favor, ingresa tu número de celular.');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await authService.login(telefono);
      triggerAlert('success', response.mensaje || 'Código OTP enviado con éxito.');
      setStep('OTP');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Error al enviar el OTP. Verifica si el número está registrado.';
      triggerAlert('danger', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim() || codigo.length !== 6) {
      triggerAlert('danger', 'Por favor, ingresa el código OTP de 6 dígitos.');
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const data = await authService.verifyOtp(telefono, codigo);

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('telefono', telefono);

      triggerAlert('success', '¡Acceso verificado con éxito!');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Código OTP inválido o expirado.';
      triggerAlert('danger', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="sport-auth-page">
      <FloatingIcons />

      <section className="sport-auth-card">
        <div className="sport-auth-content">
          <div className="sport-brand-zone">
            <div className="sport-brand-icons">
              <span className="sport-brand-icon-circle">
                <CircleDot size={20} />
              </span>
              <span className="sport-brand-icon-circle alt">
                <Volleyball size={20} />
              </span>
            </div>

            <div className="sport-brand-name">
              <span>SPORT</span>
              <span className="sport-brand-number">3</span>
            </div>

            <h1 className="sport-auth-title">
              {step === 'PHONE' ? 'Iniciar Sesión' : 'Verificar OTP'}
            </h1>

            <p className="sport-auth-copy">
              {step === 'PHONE'
                ? 'Introduce tu número celular para recibir tu código de acceso por SMS.'
                : `Hemos enviado un código a tu celular ${telefono}.`}
            </p>
          </div>

          {alert && (
            <div className={`sport-auth-alert ${alert.type}`}>
              {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{alert.message}</span>
            </div>
          )}

          {step === 'PHONE' ? (
            <form className="sport-auth-form" onSubmit={handleRequestOtp}>
              <div className="sport-form-group">
                <label className="sport-form-label" htmlFor="login-phone">
                  Teléfono / Celular
                </label>

                <div className="sport-input-wrap">
                  <Phone size={18} />
                  <input
                    id="login-phone"
                    className="sport-input"
                    type="tel"
                    placeholder="+5917XXXXXXX"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button className="sport-main-btn" type="submit" disabled={loading}>
                {loading ? 'Solicitando...' : 'Solicitar Código OTP'}
              </button>

              <p className="sport-switch-text">
                ¿No tienes una cuenta?{' '}
                <button type="button" onClick={() => navigate('/register')}>
                  Regístrate
                </button>
              </p>
            </form>
          ) : (
            <form className="sport-auth-form" onSubmit={handleVerifyOtp}>
              <div className="sport-form-group">
                <label className="sport-form-label" htmlFor="login-otp">
                  Código OTP
                </label>

                <div className="sport-input-wrap">
                  <KeyRound size={18} />
                  <input
                    id="login-otp"
                    className="sport-input sport-otp-input"
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button className="sport-main-btn" type="submit" disabled={loading}>
                {loading ? 'Verificando...' : 'Verificar e Ingresar'}
              </button>

              <button
                className="sport-secondary-btn"
                type="button"
                onClick={() => {
                  setStep('PHONE');
                  setCodigo('');
                }}
                disabled={loading}
              >
                Cambiar teléfono
              </button>
            </form>
          )}

          <div className="sport-security-strip">
            <ShieldCheck size={16} />
            Acceso protegido mediante verificación OTP
          </div>
        </div>
      </section>
    </main>
  );
};

const FloatingIcons = () => (
  <>
    <span className="floating-icon orange i1"><CircleDot /></span>
    <span className="floating-icon small i2"><Trophy /></span>
    <span className="floating-icon blue i3"><Volleyball /></span>
    <span className="floating-icon small orange i4"><CalendarCheck /></span>
    <span className="floating-icon i5"><Timer /></span>
    <span className="floating-icon blue i6"><CircleDot /></span>
    <span className="floating-icon small orange i7"><Trophy /></span>
    <span className="floating-icon i8"><ShieldCheck /></span>
    <span className="floating-icon small blue i9"><CreditCard /></span>
    <span className="floating-icon orange i10"><User /></span>
  </>
);