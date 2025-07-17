import { Doctor, Appointment, TimeSlot, ScheduleConflict } from '../types';

export class SmartScheduler {
  static generateTimeSlots(
    doctor: Doctor,
    date: string,
    existingAppointments: Appointment[]
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const { start, end, workingDays } = doctor.workingHours;
    
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    // Проверяем, работает ли врач в этот день
    if (!workingDays.includes(dayOfWeek)) {
      return slots;
    }
    
    // Генерируем временные слоты каждые 30 минут
    const startTime = this.timeToMinutes(start);
    const endTime = this.timeToMinutes(end);
    
    for (let minutes = startTime; minutes < endTime; minutes += 30) {
      const timeString = this.minutesToTime(minutes);
      const isAvailable = !this.isSlotOccupied(date, timeString, existingAppointments);
      
      slots.push({
        time: timeString,
        available: isAvailable,
        reason: isAvailable ? undefined : 'Время занято'
      });
    }
    
    return slots;
  }
  
  static findBestSlots(
    doctor: Doctor,
    date: string,
    duration: number,
    existingAppointments: Appointment[]
  ): TimeSlot[] {
    const allSlots = this.generateTimeSlots(doctor, date, existingAppointments);
    const availableSlots = allSlots.filter(slot => slot.available);
    
    // Группируем доступные слоты по времени дня
    const morningSlots = availableSlots.filter(slot => 
      this.timeToMinutes(slot.time) < 12 * 60
    );
    const afternoonSlots = availableSlots.filter(slot => 
      this.timeToMinutes(slot.time) >= 12 * 60
    );
    
    // Возвращаем лучшие варианты (утром и после обеда)
    return [
      ...morningSlots.slice(0, 3),
      ...afternoonSlots.slice(0, 3)
    ].slice(0, 6);
  }
  
  static validateAppointment(
    doctor: Doctor,
    date: string,
    time: string,
    duration: number,
    existingAppointments: Appointment[]
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Проверяем рабочие часы
    const appointmentTime = this.timeToMinutes(time);
    const workStart = this.timeToMinutes(doctor.workingHours.start);
    const workEnd = this.timeToMinutes(doctor.workingHours.end);
    
    if (appointmentTime < workStart || appointmentTime + duration > workEnd) {
      conflicts.push({
        type: 'outside-hours',
        message: 'Время записи вне рабочих часов врача'
      });
    }
    
    // Проверяем пересечения с существующими записями
    const isOccupied = this.isSlotOccupied(date, time, existingAppointments);
    if (isOccupied) {
      conflicts.push({
        type: 'overlap',
        message: 'Время уже занято другой записью'
      });
    }
    
    return conflicts;
  }
  
  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  
  private static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
  
  private static isSlotOccupied(
    date: string,
    time: string,
    appointments: Appointment[]
  ): boolean {
    return appointments.some(appointment => 
      appointment.date === date && 
      appointment.time === time &&
      appointment.status !== 'cancelled'
    );
  }
}