import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, User, UserCheck, MoreHorizontal } from 'lucide-react';
import { Appointment, Patient, Doctor } from '../types';

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

  // Генерация временных слотов (с 6:00 до 22:00 каждые 30 минут)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 21; hour++) {
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
    return appointments.filter(apt => 
      apt.date === dateStr && 
      apt.time === time &&
      apt.status !== 'cancelled'
    );
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

  // Получение цвета записи по врачу
  const getAppointmentColor = (doctorId: string, status: string) => {
    const colors = [
      'bg-blue-500 border-blue-600 text-white',
      'bg-green-500 border-green-600 text-white',
      'bg-purple-500 border-purple-600 text-white',
      'bg-orange-500 border-orange-600 text-white',
      'bg-pink-500 border-pink-600 text-white',
      'bg-indigo-500 border-indigo-600 text-white',
      'bg-teal-500 border-teal-600 text-white',
      'bg-red-500 border-red-600 text-white',
    ];
    
    const doctorIndex = doctors.findIndex(d => d.id === doctorId);
    const baseColor = colors[doctorIndex % colors.length];
    
    if (status === 'completed') {
      return baseColor.replace('500', '400').replace('600', '500');
    } else if (status === 'no-show') {
      return 'bg-gray-400 border-gray-500 text-white';
    }
    
    return baseColor;
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
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const [timeHour, timeMinute] = time.split(':').map(Number);
    
    return currentHour === timeHour && Math.abs(currentMinute - timeMinute) < 30;
  };

  const getCurrentTimePosition = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < 6 || currentHour > 21) return null;
    
    const totalMinutes = (currentHour - 6) * 60 + currentMinute;
    const slotHeight = 64; // 4rem = 64px
    const position = (totalMinutes / 30) * slotHeight;
    
    return position;
  };

  const currentTimePosition = getCurrentTimePosition();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Заголовок календаря */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-900 capitalize">
            {getCalendarTitle()}
          </h2>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => navigateCalendar('prev')}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronLeft size={18} className="text-gray-600" />
            </button>
            <button
              onClick={() => navigateCalendar('next')}
              className="p-2 hover:bg-white rounded-md transition-colors"
            >
              <ChevronRight size={18} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors font-medium"
          >
            Сегодня
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
                viewMode === 'day' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              День
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-4 py-2 text-sm rounded-md transition-colors font-medium ${
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
      <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50 sticky top-16 z-10">
        <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200">
          <div className="w-12"></div>
        </div>
        {displayDays.map((date, index) => (
          <div 
            key={index} 
            className={`p-3 text-center border-r border-gray-200 last:border-r-0 ${
              isToday(date) ? 'bg-blue-50' : ''
            }`}
          >
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {date.toLocaleDateString('ru-RU', { weekday: 'short' })}
            </div>
            <div className={`text-2xl font-semibold mt-1 ${
              isToday(date) ? 'text-blue-600' : 'text-gray-700'
            }`}>
              {date.getDate()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {date.toLocaleDateString('ru-RU', { month: 'short' })}
            </div>
          </div>
        ))}
      </div>

      {/* Сетка календаря */}
      <div className="flex-1 overflow-auto relative">
        <div className="grid grid-cols-8 min-h-full">
          {/* Колонка времени */}
          <div className="border-r border-gray-200 bg-gray-50 sticky left-0 z-10">
            {timeSlots.map((time, index) => (
              <div 
                key={time} 
                className={`h-16 border-b border-gray-100 flex items-start justify-center pt-2 text-xs text-gray-500 font-medium ${
                  isCurrentTime(time) ? 'bg-red-50 text-red-600' : ''
                }`}
              >
                {index % 2 === 0 ? time : ''}
              </div>
            ))}
          </div>

          {/* Колонки дней */}
          {displayDays.map((date, dayIndex) => (
            <div key={dayIndex} className="border-r border-gray-200 last:border-r-0 relative">
              {/* Индикатор текущего времени */}
              {isToday(date) && currentTimePosition !== null && (
                <div 
                  className="absolute left-0 right-0 z-20 flex items-center"
                  style={{ top: `${currentTimePosition}px` }}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                  <div className="flex-1 h-0.5 bg-red-500"></div>
                </div>
              )}
              
              {timeSlots.map((time, timeIndex) => {
                const appointmentsInSlot = getAppointmentsForSlot(date, time);
                const isCurrentSlot = isToday(date) && isCurrentTime(time);
                
                return (
                  <div 
                    key={`${dayIndex}-${timeIndex}`}
                    className={`h-16 border-b border-gray-100 p-1 relative cursor-pointer hover:bg-blue-50 transition-colors group ${
                      isCurrentSlot ? 'bg-red-50' : ''
                    }`}
                    onClick={() => onTimeSlotClick(date.toISOString().split('T')[0], time)}
                  >
                    {/* Записи в слоте */}
                    {appointmentsInSlot.map((appointment, aptIndex) => {
                      const patient = patients.find(p => p.id === appointment.patientId);
                      const doctor = doctors.find(d => d.id === appointment.doctorId);
                      
                      return (
                        <div
                          key={appointment.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                          className={`
                            absolute inset-1 rounded-md border-l-4 p-2 cursor-pointer
                            hover:shadow-lg transition-all duration-200 text-xs
                            ${getAppointmentColor(appointment.doctorId, appointment.status)}
                            ${aptIndex > 0 ? 'opacity-90' : ''}
                          `}
                          style={{
                            top: `${4 + aptIndex * 2}px`,
                            zIndex: 15 - aptIndex,
                            minHeight: '56px'
                          }}
                        >
                          <div className="font-semibold truncate text-sm">
                            {patient?.firstName} {patient?.lastName}
                          </div>
                          <div className="opacity-90 truncate flex items-center mt-1">
                            <UserCheck size={10} className="mr-1 flex-shrink-0" />
                            <span className="truncate">
                              {doctor?.firstName} {doctor?.lastName?.charAt(0)}.
                            </span>
                          </div>
                          <div className="opacity-75 truncate text-xs mt-1">
                            {appointment.type === 'consultation' ? 'Консультация' :
                             appointment.type === 'follow-up' ? 'Повторный' :
                             appointment.type === 'procedure' ? 'Процедура' : 'Экстренный'}
                          </div>
                          {appointment.symptoms && (
                            <div className="opacity-75 truncate text-xs mt-1">
                              {appointment.symptoms.substring(0, 25)}...
                            </div>
                          )}
                        </div>
                      );
                    })}
                    
                    {/* Кнопка добавления записи при наведении */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 bg-opacity-50 rounded">
                      {appointmentsInSlot.length === 0 && (
                        <div className="flex items-center space-x-1 text-blue-600 text-xs font-medium">
                          <Plus size={14} />
                          <span>Создать запись</span>
                        </div>
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
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded border border-blue-600"></div>
              <span className="text-gray-600">Запланировано</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded border border-green-500"></div>
              <span className="text-gray-600">Завершено</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-400 rounded border border-gray-500"></div>
              <span className="text-gray-600">Неявка</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Текущее время</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            Нажмите на пустое время для создания записи • Нажмите на запись для редактирования
          </div>
        </div>
      </div>
    </div>
  );
}