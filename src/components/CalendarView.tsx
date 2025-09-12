import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, UserCheck } from 'lucide-react';
import { Appointment, Patient, Doctor } from '../types';
import { groupRecordsByField, STATUS_ORDERS } from '../utils/recordGrouping';

interface CalendarViewProps {
  appointments: Appointment[];
  patients: Patient[];
  doctors: Doctor[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick: (date: string, time: string) => void;
}

export function CalendarView({ 
  appointments, 
  patients, 
  doctors, 
  onAppointmentClick,
  onTimeSlotClick 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [groupByStatus, setGroupByStatus] = useState(true);

  // Генерация временных слотов (с 8:00 до 20:00 каждые 30 минут)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return slots;
  }, []);

  // Получение дней недели для отображения
  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Понедельник как первый день
    startOfWeek.setDate(diff);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const displayDays = viewMode === 'week' ? weekDays : [currentDate];

  // Получение записей для конкретной даты и времени
  const getAppointmentsForSlot = (date: Date, time: string) => {
    const dateStr = date.toISOString().split('T')[0];
    const slotAppointments = appointments.filter(apt => 
      apt.date === dateStr && 
      apt.time === time &&
      apt.status !== 'cancelled'
    );
    
    if (groupByStatus) {
      // Группируем записи по статусу для лучшей визуализации
      const grouped = groupRecordsByField(slotAppointments, 'status', {
        sortBy: 'custom',
        customOrder: STATUS_ORDERS.appointments
      });
      return Object.values(grouped).flat();
    }
    
    return slotAppointments;
  };

  // Навигация по календарю
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Получение цвета записи по статусу
  const getAppointmentColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-gradient-to-r from-blue-500 to-blue-600 border-l-blue-700 text-white';
      case 'completed': return 'bg-gradient-to-r from-green-500 to-green-600 border-l-green-700 text-white';
      case 'cancelled': return 'bg-gradient-to-r from-red-500 to-red-600 border-l-red-700 text-white';
      case 'no-show': return 'bg-gradient-to-r from-gray-400 to-gray-500 border-l-gray-600 text-white';
      default: return 'bg-gradient-to-r from-blue-500 to-blue-600 border-l-blue-700 text-white';
    }
  };

  // Получение приоритета статуса для сортировки
  const getStatusPriority = (status: string) => {
    const priorities = {
      'scheduled': 1,
      'completed': 2,
      'cancelled': 3,
      'no-show': 4
    };
    return priorities[status as keyof typeof priorities] || 5;
  };

  // Получение индикатора статуса
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'scheduled': return '●';
      case 'completed': return '✓';
      case 'cancelled': return '✕';
      case 'no-show': return '○';
      default: return '●';
    }
  };

  // Форматирование заголовка календаря
  const getCalendarTitle = () => {
    if (viewMode === 'week') {
      const startDate = weekDays[0];
      const endDate = weekDays[6];
      const startMonth = startDate.toLocaleDateString('ru-RU', { month: 'long' });
      const endMonth = endDate.toLocaleDateString('ru-RU', { month: 'long' });
      const year = startDate.getFullYear();
      
      if (startMonth === endMonth) {
        return `${startMonth} ${year}`;
      } else {
        return `${startMonth} - ${endMonth} ${year}`;
      }
    } else {
      return currentDate.toLocaleDateString('ru-RU', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentTime = (time: string) => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${Math.floor(now.getMinutes() / 30) * 30}`;
    return time === currentTime;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
      {/* Заголовок календаря */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900 capitalize">
            {getCalendarTitle()}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateCalendar('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => navigateCalendar('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={groupByStatus}
              onChange={(e) => setGroupByStatus(e.target.checked)}
              className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-gray-700">Группировать по статусу</span>
          </label>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Сегодня
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'day' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              День
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === 'week' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Неделя
            </button>
          </div>
        </div>
      </div>

      {/* Заголовки дней */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200">
          Время
        </div>
        {displayDays.map((date, index) => (
          <div 
            key={index} 
            className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
              isToday(date) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="text-sm font-medium text-gray-900">
              {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-semibold mt-1 ${
              isToday(date) ? 'text-blue-600' : 'text-gray-700'
            }`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 min-h-full">
          {/* Колонка времени */}
          <div className="border-r border-gray-200">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className={`h-16 border-b border-gray-100 flex items-center justify-center text-sm text-gray-500 ${
                  isCurrentTime(time) ? 'bg-red-50 text-red-600 font-medium' : ''
                }`}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Колонки дней */}
          {displayDays.map((date, dayIndex) => (
            <div key={dayIndex} className="border-r border-gray-200 last:border-r-0">
              {timeSlots.map((time, timeIndex) => {
                const appointmentsInSlot = getAppointmentsForSlot(date, time);
                // Сортируем записи по статусу если включена группировка
                const sortedAppointments = groupByStatus 
                  ? appointmentsInSlot.sort((a, b) => getStatusPriority(a.status) - getStatusPriority(b.status))
                  : appointmentsInSlot;
                const isCurrentSlot = isToday(date) && isCurrentTime(time);
                
                return (
                  <div 
                    key={`${dayIndex}-${timeIndex}`}
                    className={`h-16 border-b border-gray-100 p-1 relative cursor-pointer hover:bg-gray-50 transition-colors ${
                      isCurrentSlot ? 'bg-red-50' : ''
                    }`}
                    onClick={() => onTimeSlotClick(date.toISOString().split('T')[0], time)}
                  >
                    {/* Индикатор текущего времени */}
                    {isCurrentSlot && (
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-red-500 z-10"></div>
                    )}
                    
                    {/* Записи в слоте */}
                    <div className="space-y-0.5">
                      {sortedAppointments.map((appointment, aptIndex) => {
                      const patient = patients.find(p => p.id === appointment.patientId);
                      const doctor = doctors.find(d => d.id === appointment.doctorId);
                      
                      // Calculate positioning for grouped display
                      const baseHeight = groupByStatus ? 12 : 14;
                      const spacing = groupByStatus ? 1 : 2;
                      const topOffset = groupByStatus ? aptIndex * (baseHeight + spacing) : aptIndex * 16;
                      
                      return (
                        <div
                          key={appointment.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                          className={`
                            absolute left-1 right-1 rounded-md border-l-4 p-1 cursor-pointer
                            hover:shadow-lg transition-all duration-200 text-xs overflow-hidden
                            ${getAppointmentColor(appointment.status)}
                            ${groupByStatus && aptIndex > 0 ? 'shadow-sm' : ''}
                          `}
                          style={{
                            top: `${4 + topOffset}px`,
                            height: `${baseHeight}px`,
                            zIndex: 10 - aptIndex
                          }}
                        >
                          {/* Индикатор статуса */}
                          {groupByStatus && (
                            <div className="absolute -left-1 top-0 text-xs font-bold">
                              {getStatusIndicator(appointment.status)}
                            </div>
                          )}
                          
                          {/* Main content */}
                          <div className="flex items-center justify-between h-full">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate text-xs leading-tight">
                                {patient?.firstName} {patient?.lastName}
                              </div>
                              <div className="opacity-90 truncate flex items-center text-xs leading-tight">
                                <UserCheck size={8} className="mr-1 flex-shrink-0" />
                                <span className="truncate">
                                  {doctor?.firstName} {doctor?.lastName?.charAt(0)}.
                                </span>
                              </div>
                            </div>
                            
                            {/* Status badge for grouped view */}
                            {groupByStatus && (
                              <div className="ml-1 flex-shrink-0">
                                <div className="w-2 h-2 rounded-full bg-white opacity-75"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Tooltip on hover */}
                          <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="absolute -top-8 left-0 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
                              {appointment.symptoms || 'Нет симптомов'}
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                    
                    {/* Кнопка добавления записи при наведении */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      {sortedAppointments.length === 0 && (
                        <Plus size={16} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Легенда */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded border-l-2 border-blue-700"></div>
              <span className="text-gray-600">● Запланировано</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-green-600 rounded border-l-2 border-green-700"></div>
              <span className="text-gray-600">✓ Завершено</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded border-l-2 border-red-700"></div>
              <span className="text-gray-600">✕ Отменено</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-gray-400 to-gray-500 rounded border-l-2 border-gray-600"></div>
              <span className="text-gray-600">○ Неявка</span>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Текущее время</span>
            </div>
            {groupByStatus && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white border border-gray-400 rounded-full"></div>
                <span className="text-gray-500 italic">Группировка включена</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}