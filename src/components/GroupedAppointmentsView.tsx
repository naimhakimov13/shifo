import React from 'react';
import { Calendar, Clock, User, UserCheck, Phone, Mail } from 'lucide-react';
import { GroupedRecordsDisplay } from './GroupedRecordsDisplay';
import { Appointment, Patient, Doctor } from '../types';
import { STATUS_ORDERS } from '../utils/recordGrouping';

interface GroupedAppointmentsViewProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onAppointmentClick?: (appointment: Appointment) => void;
  className?: string;
}

export function GroupedAppointmentsView({
  appointments,
  patients,
  doctors,
  onAppointmentClick,
  className = ''
}: GroupedAppointmentsViewProps) {
  
  const renderAppointment = (appointment: Appointment, index: number) => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const doctor = doctors.find(d => d.id === appointment.doctorId);

    return (
      <div 
        className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
          onAppointmentClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onAppointmentClick?.(appointment)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Patient Info */}
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {patient?.firstName} {patient?.lastName}
                </h4>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Phone size={12} />
                    <span>{patient?.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Mail size={12} />
                    <span>{patient?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-8 w-8 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {doctor?.firstName} {doctor?.lastName}
                </p>
                <p className="text-sm text-gray-600">{doctor?.specialization}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-gray-700">
                  {new Date(appointment.date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock size={14} className="text-gray-500" />
                <span className="text-gray-700">
                  {appointment.time} ({appointment.duration} мин)
                </span>
              </div>
            </div>

            {/* Type and Symptoms */}
            <div className="mt-3 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {appointment.type === 'consultation' ? 'Консультация' :
                   appointment.type === 'follow-up' ? 'Повторный прием' :
                   appointment.type === 'procedure' ? 'Процедура' : 'Экстренный'}
                </span>
              </div>
              
              {appointment.symptoms && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Симптомы:</span> {appointment.symptoms}
                </p>
              )}
              
              {appointment.diagnosis && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Диагноз:</span> {appointment.diagnosis}
                </p>
              )}
              
              {appointment.notes && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Заметки:</span> {appointment.notes}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
              appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {appointment.status === 'scheduled' ? 'Запланировано' :
               appointment.status === 'completed' ? 'Завершено' :
               appointment.status === 'cancelled' ? 'Отменено' : 'Неявка'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getGroupIcon = (groupName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      scheduled: <Calendar size={16} className="text-blue-600" />,
      completed: <Calendar size={16} className="text-green-600" />,
      cancelled: <Calendar size={16} className="text-red-600" />,
      'no-show': <Calendar size={16} className="text-gray-600" />
    };
    
    return iconMap[groupName];
  };

  return (
    <GroupedRecordsDisplay
      records={appointments}
      groupByField="status"
      title="Записи по статусам"
      renderRecord={renderAppointment}
      searchFields={['symptoms', 'notes', 'diagnosis']}
      config={{
        sortBy: 'custom',
        customOrder: STATUS_ORDERS.appointments,
        showEmptyGroups: false
      }}
      className={className}
      showStatistics={true}
      allowGroupToggle={true}
      emptyMessage="Нет записей для отображения"
      getGroupIcon={getGroupIcon}
    />
  );
}