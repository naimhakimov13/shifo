import React, { useState } from 'react';
import { Calendar, Clock, Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Appointment, Patient, Doctor } from '../types';
import { Modal } from './Modal';
import { AppointmentForm } from './AppointmentForm';

interface AppointmentSchedulerProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onUpdateAppointment: (id: string, appointment: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
}

export function AppointmentScheduler({ 
  appointments, 
  patients, 
  doctors, 
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment
}: AppointmentSchedulerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const todayAppointments = appointments.filter(apt => apt.date === selectedDate);

  const filteredAppointments = appointments.filter(appointment => {
    const patient = patients.find(p => p.id === appointment.patientId);
    const doctor = doctors.find(d => d.id === appointment.doctorId);
    
    const matchesSearch = 
      patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.symptoms.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddAppointment = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleFormSubmit = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => {
    if (editingAppointment) {
      onUpdateAppointment(editingAppointment.id, appointmentData);
      setEditingAppointment(null);
    } else {
      onAddAppointment(appointmentData);
    }
    setShowModal(false);
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleCancel = () => {
    setShowModal(false);
    setEditingAppointment(null);
  };

  const handleStatusChange = (appointmentId: string, newStatus: string) => {
    onUpdateAppointment(appointmentId, { status: newStatus as any });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle size={16} className="text-green-600" />;
      case 'scheduled': return <Clock size={16} className="text-blue-600" />;
      case 'cancelled': return <XCircle size={16} className="text-red-600" />;
      case 'no-show': return <XCircle size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getAppointmentsByTime = () => {
    const timeSlots: { [key: string]: Appointment[] } = {};
    
    todayAppointments.forEach(apt => {
      if (!timeSlots[apt.time]) {
        timeSlots[apt.time] = [];
      }
      timeSlots[apt.time].push(apt);
    });

    return timeSlots;
  };

  const appointmentsByTime = getAppointmentsByTime();
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Планировщик записей</h1>
        <button
          onClick={handleAddAppointment}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sky-600 transition-colors"
        >
          <Plus size={20} />
          <span>Создать запись</span>
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск записей..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="all">Все статусы</option>
            <option value="scheduled">Запланировано</option>
            <option value="completed">Завершено</option>
            <option value="cancelled">Отменено</option>
            <option value="no-show">Неявка</option>
          </select>
        </div>
      </div>

      {/* Модальное окно для создания/редактирования записи */}
      <Modal
        isOpen={showModal}
        onClose={handleCancel}
        title={editingAppointment ? 'Редактировать запись' : 'Создать новую запись'}
        size="xl"
      >
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          doctors={doctors}
          appointments={appointments}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Modal>

      {/* Список всех записей */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Все записи ({filteredAppointments.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Пациент</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Врач</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Дата и время</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Тип</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const patient = patients.find(p => p.id === appointment.patientId);
                  const doctor = doctors.find(d => d.id === appointment.doctorId);
                  
                  return (
                    <tr key={appointment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{patient?.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {doctor?.firstName} {doctor?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{doctor?.specialization}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString('ru-RU')}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.time}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="capitalize text-sm text-gray-600">
                          {appointment.type === 'consultation' ? 'Консультация' :
                           appointment.type === 'follow-up' ? 'Повторный' :
                           appointment.type === 'procedure' ? 'Процедура' : 'Экстренный'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(appointment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}>
                            {appointment.status === 'scheduled' ? 'Запланировано' :
                             appointment.status === 'completed' ? 'Завершено' :
                             appointment.status === 'cancelled' ? 'Отменено' : 'Неявка'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <Edit size={16} />
                          </button>
                          
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Завершить"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Отменить"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          
                          <button
                            onClick={() => onDeleteAppointment(appointment.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredAppointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Записи не найдены
            </div>
          )}
        </div>
      </div>

      {/* Календарь записей */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Выбор даты */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Выберите дату</h3>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          
          <div className="mt-4">
            <h4 className="font-medium text-gray-700 mb-2">Статистика на дату:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Всего записей:</span>
                <span className="font-medium">{todayAppointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Завершено:</span>
                <span className="font-medium text-green-600">
                  {todayAppointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Запланировано:</span>
                <span className="font-medium text-blue-600">
                  {todayAppointments.filter(a => a.status === 'scheduled').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Расписание на день */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">
            Расписание на {new Date(selectedDate).toLocaleDateString('ru-RU')}
          </h3>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {timeSlots.map(time => {
              const appointmentsAtTime = appointmentsByTime[time] || [];
              
              return (
                <div key={time} className="flex items-center space-x-4 py-2 border-b border-gray-100">
                  <div className="w-16 text-sm font-medium text-gray-600">
                    {time}
                  </div>
                  <div className="flex-1">
                    {appointmentsAtTime.length === 0 ? (
                      <div className="text-gray-400 text-sm">Свободно</div>
                    ) : (
                      <div className="space-y-1">
                        {appointmentsAtTime.map(appointment => {
                          const patient = patients.find(p => p.id === appointment.patientId);
                          const doctor = doctors.find(d => d.id === appointment.doctorId);
                          
                          return (
                            <div
                              key={appointment.id}
                              className={`p-2 rounded-lg text-sm cursor-pointer hover:shadow-md transition-shadow ${
                                appointment.status === 'completed' 
                                  ? 'bg-green-100 border border-green-200'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 border border-red-200'
                                  : 'bg-blue-100 border border-blue-200'
                              }`}
                              onClick={() => handleEdit(appointment)}
                            >
                              <div className="font-medium">
                                {patient?.firstName} {patient?.lastName}
                              </div>
                              <div className="text-gray-600">
                                {doctor?.firstName} {doctor?.lastName} • {appointment.type}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}