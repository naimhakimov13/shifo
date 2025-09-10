import { Appointment } from '../types';

export interface DuplicationOptions {
  interval: 'week' | 'month';
  count: number;
  skipWeekends?: boolean;
  skipConflicts?: boolean;
}

export class AppointmentDuplicator {
  /**
   * Дублирует запись на указанное количество недель вперед
   */
  static duplicateAppointment(
    appointment: Omit<Appointment, 'id' | 'createdAt'>,
    options: DuplicationOptions
  ): Omit<Appointment, 'id' | 'createdAt'>[] {
    const duplicates: Omit<Appointment, 'id' | 'createdAt'>[] = [];
    const originalDate = new Date(appointment.date);

    for (let i = 1; i <= options.count; i++) {
      const newDate = new Date(originalDate);
      
      if (options.interval === 'week') {
        newDate.setDate(originalDate.getDate() + (i * 7));
      } else if (options.interval === 'month') {
        newDate.setMonth(originalDate.getMonth() + i);
      }

      // Пропускаем выходные дни если указано
      if (options.skipWeekends && this.isWeekend(newDate)) {
        // Переносим на понедельник
        const dayOfWeek = newDate.getDay();
        const daysToAdd = dayOfWeek === 0 ? 1 : 8 - dayOfWeek; // 0 = воскресенье
        newDate.setDate(newDate.getDate() + daysToAdd);
      }

      const duplicatedAppointment: Omit<Appointment, 'id' | 'createdAt'> = {
        ...appointment,
        date: newDate.toISOString().split('T')[0],
        status: 'scheduled', // Всегда создаем как запланированные
        notes: `${appointment.notes} (Дублировано из ${appointment.date})`.trim()
      };

      duplicates.push(duplicatedAppointment);
    }

    return duplicates;
  }

  /**
   * Дублирует несколько записей на следующую неделю
   */
  static duplicateMultipleAppointments(
    appointments: Appointment[],
    existingAppointments: Appointment[] = []
  ): { 
    successful: Omit<Appointment, 'id' | 'createdAt'>[], 
    conflicts: { appointment: Appointment, reason: string }[] 
  } {
    const successful: Omit<Appointment, 'id' | 'createdAt'>[] = [];
    const conflicts: { appointment: Appointment, reason: string }[] = [];

    appointments.forEach(appointment => {
      const duplicates = this.duplicateAppointment(appointment, {
        interval: 'week',
        count: 1,
        skipConflicts: true
      });

      duplicates.forEach(duplicate => {
        // Проверяем конфликты
        const hasConflict = this.checkForConflicts(duplicate, existingAppointments);
        
        if (hasConflict) {
          conflicts.push({
            appointment,
            reason: `Конфликт времени: ${duplicate.date} в ${duplicate.time}`
          });
        } else {
          successful.push(duplicate);
        }
      });
    });

    return { successful, conflicts };
  }

  /**
   * Создает серию повторяющихся записей
   */
  static createRecurringAppointments(
    appointment: Omit<Appointment, 'id' | 'createdAt'>,
    options: DuplicationOptions
  ): Omit<Appointment, 'id' | 'createdAt'>[] {
    const appointments: Omit<Appointment, 'id' | 'createdAt'>[] = [appointment];
    const duplicates = this.duplicateAppointment(appointment, options);
    
    return [...appointments, ...duplicates];
  }

  /**
   * Проверяет конфликты времени
   */
  private static checkForConflicts(
    newAppointment: Omit<Appointment, 'id' | 'createdAt'>,
    existingAppointments: Appointment[]
  ): boolean {
    return existingAppointments.some(existing => 
      existing.date === newAppointment.date &&
      existing.time === newAppointment.time &&
      existing.doctorId === newAppointment.doctorId &&
      existing.status !== 'cancelled'
    );
  }

  /**
   * Проверяет, является ли день выходным
   */
  private static isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Воскресенье или суббота
  }

  /**
   * Получает следующую доступную дату для врача
   */
  static getNextAvailableDate(
    doctorId: string,
    startDate: string,
    time: string,
    existingAppointments: Appointment[]
  ): string | null {
    const date = new Date(startDate);
    const maxAttempts = 30; // Максимум 30 дней поиска
    
    for (let i = 0; i < maxAttempts; i++) {
      const checkDate = new Date(date);
      checkDate.setDate(date.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      // Пропускаем выходные
      if (this.isWeekend(checkDate)) {
        continue;
      }
      
      // Проверяем конфликты
      const hasConflict = existingAppointments.some(apt => 
        apt.date === dateStr &&
        apt.time === time &&
        apt.doctorId === doctorId &&
        apt.status !== 'cancelled'
      );
      
      if (!hasConflict) {
        return dateStr;
      }
    }
    
    return null;
  }
}