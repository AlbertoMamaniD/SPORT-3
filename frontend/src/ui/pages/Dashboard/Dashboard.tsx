import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { 
  canchaService, 
  reservaService, 
  type CanchaResponse, 
  type SlotHorarioResponse, 
  type ReservaResponse 
} from '../../../infrastructure/api/sportApi';
import './Dashboard.css';

// Importación de Componentes Modulares
import { DashboardNavbar } from './components/DashboardNavbar';
import { TabHome } from './components/TabHome';
import { TabCanchas } from './components/TabCanchas';
import { TabReservas } from './components/TabReservas';
import { BookingModal } from './components/BookingModal';
import { ExtendModal } from './components/ExtendModal';

interface UserSession {
  nombre: string;
  telefono: string;
  rol: string;
}

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserSession | null>(null);
  
  // Navigation State
  const [currentTab, setCurrentTab] = useState<'HOME' | 'CANCHAS' | 'RESERVAS'>('HOME');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data States
  const [canchas, setCanchas] = useState<CanchaResponse[]>([]);
  const [reservas, setReservas] = useState<ReservaResponse[]>([]);
  const [selectedCancha, setSelectedCancha] = useState<CanchaResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [slots, setSlots] = useState<SlotHorarioResponse[]>([]);
  
  // Interaction States
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  
  // Booking Modal States
  const [selectedSlotsParaReserva, setSelectedSlotsParaReserva] = useState<SlotHorarioResponse[]>([]);
  const [metodoPago, setMetodoPago] = useState<'ONLINE' | 'PRESENCIAL'>('ONLINE');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [payingQr, setPayingQr] = useState(false);

  // Extend Modal States
  const [extendModalReserva, setExtendModalReserva] = useState<ReservaResponse | null>(null);
  const [minutosExtra, setMinutosExtra] = useState<number>(60);
  const [showExtendModal, setShowExtendModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const nombre = localStorage.getItem('nombre') || 'Usuario';
    const telefono = localStorage.getItem('telefono') || '';
    const rol = localStorage.getItem('rol') || 'USUARIO';
    setUser({ nombre, telefono, rol });
  }, [navigate]);

  // Load initially or when tab changes
  useEffect(() => {
    if (currentTab === 'CANCHAS') {
      fetchCanchas();
    } else if (currentTab === 'RESERVAS') {
      fetchReservas();
    }
  }, [currentTab]);

  // Load slots when selected cancha or date changes
  useEffect(() => {
    if (selectedCancha) {
      fetchSlots(selectedCancha.id, selectedDate);
    }
  }, [selectedCancha, selectedDate]);

  const showAlertMessage = (type: 'success' | 'danger', message: string) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const fetchCanchas = async () => {
    setLoading(true);
    try {
      const data = await canchaService.listarActivas();
      setCanchas(data);
      if (data.length > 0 && !selectedCancha) {
        setSelectedCancha(data[0]);
      }
    } catch (err: any) {
      showAlertMessage('danger', 'Error al cargar las canchas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservas = async () => {
    setLoading(true);
    try {
      const data = await reservaService.obtenerHistorial();
      setReservas(data);
    } catch (err: any) {
      showAlertMessage('danger', 'Error al obtener el historial de reservas.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (canchaId: number, fecha: string) => {
    setLoadingSlots(true);
    try {
      const data = await canchaService.obtenerDisponibilidad(canchaId, fecha);
      setSlots(data);
    } catch (err: any) {
      showAlertMessage('danger', 'Error al obtener disponibilidad para esta fecha.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleLogoutClick = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleOpenBookingModal = () => {
    if (selectedSlotsParaReserva.length < 2) {
      showAlertMessage('danger', 'Debes seleccionar al menos 2 franjas contiguas (Mínimo 1 Hora).');
      return;
    }
    setMetodoPago('ONLINE');
    setPayingQr(false);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (comprobante: File | null = null) => {
    if (!selectedCancha || selectedSlotsParaReserva.length === 0) return;
    
    if (metodoPago === 'ONLINE' && !payingQr) {
      setPayingQr(true);
      return;
    }

    setLoading(true);
    try {
      // Ordenar para obtener horaInicio del primero y horaFin del último
      const sorted = [...selectedSlotsParaReserva].sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));
      const horaInicio = sorted[0].horaInicio.substring(0, 5);
      const horaFin = sorted[sorted.length - 1].horaFin.substring(0, 5);

      const reserva = await reservaService.crear(
        selectedCancha.id,
        selectedDate,
        horaInicio,
        horaFin,
        metodoPago
      );

      if (metodoPago === 'ONLINE' && comprobante && reserva.id) {
        await reservaService.subirComprobante(reserva.id, comprobante, 'RESERVA_INICIAL');
      }

      showAlertMessage('success', `¡Cancha reservada con éxito! Pago registrado como ${metodoPago}.`);
      setShowBookingModal(false);
      setSelectedSlotsParaReserva([]);
      fetchSlots(selectedCancha.id, selectedDate);
      fetchReservas();
    } catch (err: any) {
      const errorMsg = err.response?.data?.mensaje || 'Error al crear la reserva. Intenta con otro horario.';
      showAlertMessage('danger', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReserva = async (reservaId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;
    setLoading(true);
    try {
      await reservaService.cancelar(reservaId);
      showAlertMessage('success', 'Reserva cancelada correctamente.');
      fetchReservas();
    } catch (err: any) {
      const errorMsg = err.response?.data?.mensaje || 'No se pudo cancelar la reserva.';
      showAlertMessage('danger', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenExtendModal = (reserva: ReservaResponse) => {
    setExtendModalReserva(reserva);
    setMinutosExtra(60);
    setShowExtendModal(true);
  };

  const handleConfirmExtend = async (comprobante: File | null, chosenMetodoPago: 'ONLINE' | 'PRESENCIAL') => {
    if (!extendModalReserva || !extendModalReserva.id) return;
    setLoading(true);
    try {
      const reserva = await reservaService.ampliar(extendModalReserva.id, minutosExtra);

      if (chosenMetodoPago === 'ONLINE' && comprobante && reserva.id) {
        await reservaService.subirComprobante(reserva.id, comprobante, 'AMPLIACION');
      }

      showAlertMessage('success', `¡Reserva ampliada en ${minutosExtra} minutos con éxito! Pago registrado como ${chosenMetodoPago}.`);
      setShowExtendModal(false);
      setExtendModalReserva(null);
      fetchReservas();
    } catch (err: any) {
      const errorMsg = err.response?.data?.mensaje || 'No se pudo ampliar la reserva (horario colisiona o inválido).';
      showAlertMessage('danger', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getCanchaName = (id: number) => {
    const c = canchas.find(item => item.id === id);
    return c ? c.nombre : `Cancha #${id}`;
  };

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      {/* NAVBAR */}
      <DashboardNavbar 
        user={user}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        handleLogoutClick={handleLogoutClick}
      />

      {/* ALERTAS */}
      {alert && (
        <div className={`dashboard-alert alert-${alert.type}`}>
          {alert.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <main className="dashboard-content-area">
        {currentTab === 'HOME' && (
          <TabHome user={user} setCurrentTab={setCurrentTab} />
        )}

        {currentTab === 'CANCHAS' && (
          <TabCanchas 
            canchas={canchas}
            selectedCancha={selectedCancha}
            setSelectedCancha={setSelectedCancha}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            loadingSlots={loadingSlots}
            slots={slots}
            selectedSlotsParaReserva={selectedSlotsParaReserva}
            setSelectedSlotsParaReserva={setSelectedSlotsParaReserva}
            handleOpenBookingModal={handleOpenBookingModal}
          />
        )}

        {currentTab === 'RESERVAS' && (
          <TabReservas 
            loading={loading}
            reservas={reservas}
            getCanchaName={getCanchaName}
            handleOpenExtendModal={handleOpenExtendModal}
            handleCancelReserva={handleCancelReserva}
            setCurrentTab={setCurrentTab}
          />
        )}
      </main>

      {/* MODALES */}
      {selectedCancha && selectedSlotsParaReserva.length > 0 && (
        <BookingModal 
          showBookingModal={showBookingModal}
          setShowBookingModal={setShowBookingModal}
          selectedSlotsParaReserva={selectedSlotsParaReserva}
          selectedCancha={selectedCancha}
          selectedDate={selectedDate}
          payingQr={payingQr}
          setPayingQr={setPayingQr}
          metodoPago={metodoPago}
          setMetodoPago={setMetodoPago}
          handleConfirmBooking={handleConfirmBooking}
          loading={loading}
        />
      )}

      <ExtendModal 
        showExtendModal={showExtendModal}
        setShowExtendModal={setShowExtendModal}
        extendModalReserva={extendModalReserva}
        getCanchaName={getCanchaName}
        minutosExtra={minutosExtra}
        setMinutosExtra={setMinutosExtra}
        handleConfirmExtend={handleConfirmExtend}
        loading={loading}
      />
    </div>
  );
};
