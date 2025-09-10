import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PatientManagement } from './components/PatientManagement';
import { DoctorManagement } from './components/DoctorManagement';
import { AppointmentScheduler } from './components/AppointmentScheduler';
import { PaymentManagement } from './components/PaymentManagement';
import { Analytics } from './components/Analytics';
import { useLocalStorage } from './hooks/useLocalStorage';
import { mockPatients, mockDoctors, mockAppointments, mockPayments } from './data/mockData';
import { Patient, Doctor, Appointment, Payment } from './types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useLocalStorage<Patient[]>('patients', mockPatients);
  const [doctors, setDoctors] = useLocalStorage<Doctor[]>('doctors', mockDoctors);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', mockAppointments);
  const [payments, setPayments] = useLocalStorage<Payment[]>('payments', mockPayments);

  const handleAddPatient = (patientData: Omit<Patient, 'id' | 'createdAt'>) => {
    const newPatient: Patient = {
      ...patientData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setPatients([...patients, newPatient]);
  };

  const handleUpdatePatient = (id: string, updates: Partial<Patient>) => {
    setPatients(patients.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const handleAddDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    const newDoctor: Doctor = {
      ...doctorData,
      id: Date.now().toString()
    };
    setDoctors([...doctors, newDoctor]);
  };

  const handleUpdateDoctor = (id: string, updates: Partial<Doctor>) => {
    setDoctors(doctors.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const handleDeleteDoctor = (id: string) => {
    setDoctors(doctors.filter(d => d.id !== id));
  };

  const handleAddAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAppointments([...appointments, newAppointment]);

    // Автоматически создаем запись о платеже
    const doctor = doctors.find(d => d.id === appointmentData.doctorId);
    if (doctor) {
      const newPayment: Payment = {
        id: (Date.now() + Math.random()).toString(),
        appointmentId: newAppointment.id,
        patientId: appointmentData.patientId,
        amount: doctor.consultationFee,
        method: 'cash',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      setPayments([...payments, newPayment]);
    }
  };

  const handleUpdateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(appointments.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(appointments.filter(a => a.id !== id));
    // Также удаляем связанные платежи
    setPayments(payments.filter(p => p.appointmentId !== id));
  };
  const handleUpdatePayment = (id: string, updates: Partial<Payment>) => {
    setPayments(payments.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            patients={patients}
            doctors={doctors}
            appointments={appointments}
            payments={payments}
          />
        );
      case 'patients':
        return (
          <PatientManagement
            patients={patients}
            onAddPatient={handleAddPatient}
            onUpdatePatient={handleUpdatePatient}
            onDeletePatient={handleDeletePatient}
          />
        );
      case 'doctors':
        return (
          <DoctorManagement
            doctors={doctors}
            onAddDoctor={handleAddDoctor}
            onUpdateDoctor={handleUpdateDoctor}
            onDeleteDoctor={handleDeleteDoctor}
          />
        );
      case 'appointments':
        return (
          <AppointmentScheduler
            appointments={appointments}
            patients={patients}
            doctors={doctors}
            onAddAppointment={handleAddAppointment}
            onUpdateAppointment={handleUpdateAppointment}
            onDeleteAppointment={handleDeleteAppointment}
          />
        );
      case 'payments':
        return (
          <PaymentManagement
            payments={payments}
            appointments={appointments}
            patients={patients}
            onUpdatePayment={handleUpdatePayment}
          />
        );
      case 'analytics':
        return (
          <Analytics
            patients={patients}
            doctors={doctors}
            appointments={appointments}
            payments={payments}
          />
        );
      case 'settings':
        return (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Настройки</h2>
            <p className="text-gray-600">Раздел настроек в разработке...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;