import React, { useState } from 'react';
import { Copy, Calendar, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Appointment, Patient, Doctor } from '../types';
import { AppointmentDuplicator, DuplicationOptions } from '../utils/appointmentDuplicator';

interface AppointmentDuplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
  selectedAppointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  existingAppointments: Appointment[];
  onDuplicate: (duplicates: Omit<Appointment, 'id' | 'createdAt'>[]) => void;
}

export function AppointmentDuplicationModal({
  isOpen,
  onClose,
  appointments,
  selectedAppointments,
  patients,
  doctors,
  existingAppointments,
  onDuplicate
}: AppointmentDuplicationModalProps) {
  const [duplicationMode, setDuplicationMode] = useState<'single' | 'multiple'>('single');
  const [options, setOptions] = useState<DuplicationOptions>({
    interval: 'week',
    count: 1,
    skipWeekends: true,
    skipConflicts: true
  });
  const [previewResults, setPreviewResults] = useState<{
    successful: Omit<Appointment, 'id' | 'createdAt'>[];
    conflicts: { appointment: Appointment; reason: string }[];
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePreview = () => {
    setIsProcessing(true);
    
    try {
      if (duplicationMode === 'single' && selectedAppointments.length === 1) {
        const appointment = selectedAppointments[0];
        const duplicates = AppointmentDuplicator.duplicateAppointment(appointment, options);
        
        const conflicts: { appointment: Appointment; reason: string }[] = [];
        const successful: Omit<Appointment, 'id' | 'createdAt'>[] = [];
        
        duplicates.forEach(duplicate => {
          const hasConflict = existingAppointments.some(existing => 
            existing.date === duplicate.date &&
            existing.time === duplicate.time &&
            existing.doctorId === duplicate.doctorId &&
            existing.status !== 'cancelled'
          );
          
          if (hasConflict && options.skipConflicts) {
            conflicts.push({
              appointment,
              reason: `Конфликт времени: ${duplicate.date} в ${duplicate.time}`
            });
          } else {
            successful.push(duplicate);
          }
        });
        
        setPreviewResults({ successful, conflicts });
      } else {
        const results = AppointmentDuplicator.duplicateMultipleAppointments(
          selectedAppointments,
          existingAppointments
        );
        setPreviewResults(results);
      }
    } catch (error) {
      console.error('Ошибка при предварительном просмотре:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDuplication = () => {
    if (previewResults && previewResults.successful.length > 0) {
      onDuplicate(previewResults.successful);
      onClose();
      setPreviewResults(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setPreviewResults(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCancel} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sky-100 rounded-lg">
                <Copy className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Дублирование записей
                </h3>
                <p className="text-sm text-gray-500">
                  Выбрано записей: {selectedAppointments.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Выбранные записи */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Выбранные записи:</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedAppointments.map(appointment => {
                const patient = patients.find(p => p.id === appointment.patientId);
                const doctor = doctors.find(d => d.id === appointment.doctorId);
                
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar size={14} className="text-gray-500" />
                        <span>{new Date(appointment.date).toLocaleDateString('ru-RU')}</span>
                        <Clock size={14} className="text-gray-500" />
                        <span>{appointment.time}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {patient?.firstName} {patient?.lastName} → {doctor?.firstName} {doctor?.lastName}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Настройки дублирования */}
          <div className="mb-6 space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Настройки дублирования:</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Интервал
                </label>
                <select
                  value={options.interval}
                  onChange={(e) => setOptions({ ...options, interval: e.target.value as 'week' | 'month' })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="week">Еженедельно</option>
                  <option value="month">Ежемесячно</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Количество копий
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={options.count}
                  onChange={(e) => setOptions({ ...options, count: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.skipWeekends}
                  onChange={(e) => setOptions({ ...options, skipWeekends: e.target.checked })}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Пропускать выходные дни</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.skipConflicts}
                  onChange={(e) => setOptions({ ...options, skipConflicts: e.target.checked })}
                  className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="text-sm text-gray-700">Пропускать конфликтующие записи</span>
              </label>
            </div>
          </div>

          {/* Предварительный просмотр */}
          {previewResults && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Результат дублирования:</h4>
              
              {previewResults.successful.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Будет создано записей: {previewResults.successful.length}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {previewResults.successful.map((appointment, index) => (
                      <div key={index} className="text-xs text-gray-600 pl-6">
                        {new Date(appointment.date).toLocaleDateString('ru-RU')} в {appointment.time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {previewResults.conflicts.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Конфликтов: {previewResults.conflicts.length}
                    </span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {previewResults.conflicts.map((conflict, index) => (
                      <div key={index} className="text-xs text-amber-700 pl-6">
                        {conflict.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Отмена
            </button>
            
            {!previewResults ? (
              <button
                onClick={handlePreview}
                disabled={isProcessing || selectedAppointments.length === 0}
                className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Обработка...' : 'Предварительный просмотр'}
              </button>
            ) : (
              <button
                onClick={handleConfirmDuplication}
                disabled={previewResults.successful.length === 0}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Создать {previewResults.successful.length} записей
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}