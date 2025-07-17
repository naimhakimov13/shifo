import { Patient, Doctor, Appointment, Payment } from '../types';

export const mockPatients: Patient[] = [
  {
    id: '1',
    firstName: 'Анна',
    lastName: 'Петрова',
    dateOfBirth: '1985-03-15',
    phone: '+7 (999) 123-45-67',
    email: 'anna.petrova@email.com',
    address: 'ул. Ленина, 25, кв. 10',
    insuranceNumber: '1234567890',
    emergencyContact: '+7 (999) 765-43-21',
    allergies: ['Пенициллин', 'Пыльца'],
    medicalHistory: 'Гипертония, операция на аппендиците в 2010г.',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Михаил',
    lastName: 'Иванов',
    dateOfBirth: '1978-07-22',
    phone: '+7 (999) 234-56-78',
    email: 'mikhail.ivanov@email.com',
    address: 'пр. Мира, 45, кв. 23',
    insuranceNumber: '2345678901',
    emergencyContact: '+7 (999) 876-54-32',
    allergies: [],
    medicalHistory: 'Диабет 2 типа, диагностирован в 2015г.',
    createdAt: '2024-01-20T14:30:00Z'
  }
];

export const mockDoctors: Doctor[] = [
  {
    id: '1',
    firstName: 'Елена',
    lastName: 'Смирнова',
    specialization: 'Терапевт',
    phone: '+7 (999) 345-67-89',
    email: 'elena.smirnova@clinic.com',
    licenseNumber: 'DOC123456',
    experience: 15,
    workingHours: {
      start: '09:00',
      end: '17:00',
      workingDays: [1, 2, 3, 4, 5]
    },
    consultationFee: 2500
  },
  {
    id: '2',
    firstName: 'Дмитрий',
    lastName: 'Козлов',
    specialization: 'Кардиолог',
    phone: '+7 (999) 456-78-90',
    email: 'dmitry.kozlov@clinic.com',
    licenseNumber: 'DOC234567',
    experience: 20,
    workingHours: {
      start: '10:00',
      end: '18:00',
      workingDays: [1, 2, 3, 4, 5]
    },
    consultationFee: 3500
  },
  {
    id: '3',
    firstName: 'Ольга',
    lastName: 'Николаева',
    specialization: 'Невролог',
    phone: '+7 (999) 567-89-01',
    email: 'olga.nikolaeva@clinic.com',
    licenseNumber: 'DOC345678',
    experience: 12,
    workingHours: {
      start: '08:00',
      end: '16:00',
      workingDays: [1, 2, 3, 4, 5]
    },
    consultationFee: 3000
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '1',
    date: '2024-01-25',
    time: '10:00',
    duration: 30,
    type: 'consultation',
    status: 'scheduled',
    notes: 'Плановый осмотр',
    symptoms: 'Головная боль, усталость',
    createdAt: '2024-01-20T12:00:00Z'
  },
  {
    id: '2',
    patientId: '2',
    doctorId: '2',
    date: '2024-01-26',
    time: '14:30',
    duration: 45,
    type: 'follow-up',
    status: 'completed',
    notes: 'Контроль диабета',
    symptoms: 'Повышенный сахар',
    diagnosis: 'Диабет 2 типа - стабильное течение',
    prescription: 'Метформин 500мг 2 раза в день',
    createdAt: '2024-01-22T09:15:00Z'
  }
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    appointmentId: '2',
    patientId: '2',
    amount: 3500,
    method: 'card',
    status: 'paid',
    transactionId: 'TXN001234',
    createdAt: '2024-01-26T14:30:00Z',
    paidAt: '2024-01-26T14:35:00Z'
  },
  {
    id: '2',
    appointmentId: '1',
    patientId: '1',
    amount: 2500,
    method: 'cash',
    status: 'pending',
    createdAt: '2024-01-25T10:00:00Z'
  }
];