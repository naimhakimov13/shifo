export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insuranceNumber: string;
  emergencyContact: string;
  allergies: string[];
  medicalHistory: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  phone: string;
  email: string;
  licenseNumber: string;
  experience: number;
  workingHours: {
    start: string;
    end: string;
    workingDays: number[];
  };
  consultationFee: number;
  avatar?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'procedure' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes: string;
  symptoms: string;
  diagnosis?: string;
  prescription?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  patientId: string;
  amount: number;
  method: 'cash' | 'card' | 'insurance' | 'transfer';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  paidAt?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

export interface ScheduleConflict {
  type: 'overlap' | 'outside-hours' | 'unavailable';
  message: string;
}