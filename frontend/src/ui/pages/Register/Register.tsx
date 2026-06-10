import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Trophy,
  CalendarCheck,
  ShieldCheck,
  CreditCard,
  Timer,
  Volleyball,
  CircleDot,
} from 'lucide-react';
import { authService } from '../../../infrastructure/api/sportApi';
import './Register.css';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [codigo, setCodigo] = useState('');
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const triggerAlert = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
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
      const errMsg =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Error al registrar el usuario. Comprueba tu celular de pruebas Twilio.';
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

      localStorage.setItem('token', data.token);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('telefono', telefono);

      triggerAlert('success', '¡Cuenta creada e iniciada con éxito!');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg =
        err.response?.data?.mensaje ||
        err.response?.data?.error ||
        'Código OTP incorrecto o vencido.';
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
              {step === 'FORM' ? 'Crear Cuenta' : 'Verificar OTP'}
            </h1>

            <p className="sport-auth-copy">
              {step === 'FORM'
                ? 'Regístrate ingresando tus datos básicos y activa tu cuenta mediante OTP.'
                : `Ingresa el código OTP enviado a ${telefono}.`}
            </p>
          </div>

          {alert && (
            <div className={`sport-auth-alert ${alert.type}`}>
              {alert.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{alert.message}</span>
            </div>
          )}

          {step === 'FORM' ? (
            <form className="sport-auth-form" onSubmit={handleRegisterSubmit}>
              <div className="sport-form-group">
                <label className="sport-form-label" htmlFor="reg-name">
                  Nombre completo
                </label>

                <div className="sport-input-wrap">
                  <User size={18} />
                  <input
                    id="reg-name"
                    className="sport-input"
                    type="text"
                    placeholder="Juan Perez"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="sport-form-group">
                <label className="sport-form-label" htmlFor="reg-phone">
                  Celular con código de país
                </label>

                <div className="sport-input-wrap">
                  <Phone size={18} />
                  <input
                    id="reg-phone"
                    className="sport-input"
                    type="tel"
                    placeholder="+5917XXXXXXX"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <p className="sport-input-help">Ejemplo: +59170000000</p>
              </div>

              <button className="sport-main-btn" type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Cuenta y Recibir OTP'}
              </button>

              <p className="sport-switch-text">
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => navigate('/login')}>
                  Inicia sesión
                </button>
              </p>
            </form>
          ) : (
            <form className="sport-auth-form" onSubmit={handleVerifyOtpSubmit}>
              <div className="sport-form-group">
                <label className="sport-form-label" htmlFor="reg-otp">
                  Código OTP
                </label>

                <div className="sport-input-wrap">
                  <KeyRound size={18} />
                  <input
                    id="reg-otp"
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
                {loading ? 'Verificando...' : 'Verificar y Activar'}
              </button>

              <button
                className="sport-secondary-btn"
                type="button"
                onClick={() => {
                  setStep('FORM');
                  setCodigo('');
                }}
                disabled={loading}
              >
                Cambiar datos
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