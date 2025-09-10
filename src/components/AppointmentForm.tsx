import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, UserCheck, FileText, AlertCircle } from 'lucide-react';
import { Appointment, Patient, Doctor } from '../types';
import { SmartScheduler } from '../utils/scheduler';
import { RecurringAppointmentOption } from './RecurringAppointmentOption';
import { AppointmentDuplicator } from '../utils/appointmentDuplicator';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  onSubmit: (data: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function AppointmentForm({ 
  appointment, 
  patients, 
  doctors, 
  appointments,
  onSubmit, 
  onCancel 
}: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'consultation' as const,
    status: 'scheduled' as const,
    notes: '',
    symptoms: '',
    diagnosis: '',
    prescription: ''
  });

  const [suggestedSlots, setSuggestedSlots] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [recurringOptions, setRecurringOptions] = useState<{
    enabled: boolean;
    interval: 'week' | 'month';
    count: number;
    skipWeekends: boolean;
  }>({
    enabled: false,
    interval: 'week',
    count: 4,
    skipWeekends: true
  });

  useEffect(() => {
    if (appointment) {
      setFormData({
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        type: appointment.type,
        status: appointment.status,
        notes: appointment.notes,
        symptoms: appointment.symptoms,
        diagnosis: appointment.diagnosis || '',
        prescription: appointment.prescription || ''
      });
    }
  }, [appointment]);

  const handleDoctorChange = (doctorId: string) => {
    setFormData({ ...formData, doctorId });
    
    if (doctorId && formData.date) {
      const doctor = doctors.find(d => d.id === doctorId);
      if (doctor) {
        const slots = SmartScheduler.findBestSlots(
          doctor,
          formData.date,
          formData.duration,
          appointments.filter(apt => apt.id !== appointment?.id)
        );
        setSuggestedSlots(slots);

        // Проверяем конфликты
        const appointmentConflicts = SmartScheduler.validateAppointment(
          doctor,
          formData.date,
          formData.time,
          formData.duration,
          appointments.filter(apt => apt.id !== appointment?.id)
        );
        setConflicts(appointmentConflicts);
      }
    }
  };

  const handleDateChange = (date: string) => {
    setFormData({ ...formData, date });
    
    if (formData.doctorId && date) {
      const doctor = doctors.find(d => d.id === formData.doctorId);
      if (doctor) {
        const slots = SmartScheduler.findBestSlots(
          doctor,
          date,
          formData.duration,
          appointments.filter(apt => apt.id !== appointment?.id)
        );
        setSuggestedSlots(slots);
      }
    }
  };

  const handleTimeChange = (time: string) => {
    setFormData({ ...formData, time });
    
    if (formData.doctorId && formData.date && time) {
      const doctor = doctors.find(d => d.id === formData.doctorId);
      if (doctor) {
        const appointmentConflicts = SmartScheduler.validateAppointment(
          doctor,
          formData.date,
          time,
          formData.duration,
          appointments.filter(apt => apt.id !== appointment?.id)
        );
        setConflicts(appointmentConflicts);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (recurringOptions.enabled && !isEditing) {
      // Создаем повторяющиеся записи
      const recurringAppointments = AppointmentDuplicator.createRecurringAppointments(
        formData,
        {
          interval: recurringOptions.interval,
          count: recurringOptions.count,
          skipWeekends: recurringOptions.skipWeekends,
          skipConflicts: true
        }
      );
      
      // Отправляем все записи
      recurringAppointments.forEach(appointment => {
        onSubmit(appointment);
      });
    } else {
      onSubmit(formData);
    }
  };

  const handleRecurringChange = (enabled: boolean, options: any) => {
    setRecurringOptions({
      enabled,
      ...options
    });
  };

  const isEditing = !!appointment;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline w-4 h-4 mr-1" />
            Пациент
          </label>
          <select
            required
            value={formData.patientId}
            onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          >
            <option value="">Выберите пациента</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.firstName} {patient.lastName}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserCheck className="inline w-4 h-4 mr-1" />
            Врач
          </label>
          <select
            required
            value={formData.doctorId}
            onChange={(e) => handleDoctorChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          >
            <option value="">Выберите врача</option>
            {doctors.map(doctor => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.firstName} {doctor.lastName} - {doctor.specialization}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline w-4 h-4 mr-1" />
            Дата
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="inline w-4 h-4 mr-1" />
            Время
          </label>
          <input
            type="time"
            required
            value={formData.time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Тип приема</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          >
            <option value="consultation">Консультация</option>
            <option value="follow-up">Повторный прием</option>
            <option value="procedure">Процедура</option>
            <option value="emergency">Экстренный прием</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Длительность</label>
          <select
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
          >
            <option value={15}>15 минут</option>
            <option value={30}>30 минут</option>
            <option value={45}>45 минут</option>
            <option value={60}>60 минут</option>
          </select>
        </div>

        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            >
              <option value="scheduled">Запланировано</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
              <option value="no-show">Неявка</option>
            </select>
          </div>
        )}
      </div>

      {/* Предложенные временные слоты */}
      {suggestedSlots.length > 0 && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <label className="block text-sm font-medium text-green-800 mb-2">
            Рекомендуемое время:
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleTimeChange(slot.time)}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm hover:bg-green-200 transition-colors border border-green-300"
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Конфликты */}
      {conflicts.length > 0 && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center mb-2">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-800">Обнаружены конфликты:</span>
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {conflicts.map((conflict, index) => (
              <li key={index}>• {conflict.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Симптомы и заметки */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="inline w-4 h-4 mr-1" />
            Симптомы
          </label>
          <textarea
            value={formData.symptoms}
            onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Опишите симптомы пациента..."
          />
        </div>

        {isEditing && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Диагноз</label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                placeholder="Поставленный диагноз..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Назначения</label>
              <textarea
                value={formData.prescription}
                onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                placeholder="Назначенные препараты и процедуры..."
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Заметки</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Дополнительные заметки..."
          />
        </div>
      </div>

      {/* Опция повторяющихся записей - только при создании новой записи */}
      {!isEditing && (
        <RecurringAppointmentOption onRecurringChange={handleRecurringChange} />
      )}

      {/* Кнопки действий */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={conflicts.length > 0 && !recurringOptions.enabled}
          className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? 'Сохранить изменения' : 
           recurringOptions.enabled ? `Создать ${recurringOptions.count + 1} записей` : 'Создать запись'}
        </button>
      </div>
    </form>
  );
}