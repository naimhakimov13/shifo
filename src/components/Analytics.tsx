import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Patient, Doctor, Appointment, Payment } from '../types';

interface AnalyticsProps {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  payments: Payment[];
}

export function Analytics({ patients, doctors, appointments, payments }: AnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Расчет основных метрик
  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalAppointments = appointments.length;
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  // Статистика по приемам
  const appointmentsByStatus = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const appointmentsByType = appointments.reduce((acc, apt) => {
    acc[apt.type] = (acc[apt.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Статистика по врачам
  const doctorStats = doctors.map(doctor => {
    const doctorAppointments = appointments.filter(apt => apt.doctorId === doctor.id);
    const completedAppointments = doctorAppointments.filter(apt => apt.status === 'completed');
    const doctorPayments = payments.filter(p => {
      const appointment = appointments.find(a => a.id === p.appointmentId);
      return appointment?.doctorId === doctor.id && p.status === 'paid';
    });
    const revenue = doctorPayments.reduce((sum, p) => sum + p.amount, 0);

    return {
      doctor,
      totalAppointments: doctorAppointments.length,
      completedAppointments: completedAppointments.length,
      revenue,
      efficiency: doctorAppointments.length > 0 ? 
        (completedAppointments.length / doctorAppointments.length) * 100 : 0
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Статистика по методам оплаты
  const paymentMethodStats = payments.reduce((acc, payment) => {
    acc[payment.method] = (acc[payment.method] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  // Месячная статистика
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthAppointments = appointments.filter(apt => {
      const aptMonth = new Date(apt.date).getMonth() + 1;
      return aptMonth === month;
    });
    const monthPayments = payments.filter(p => {
      const paymentMonth = new Date(p.createdAt).getMonth() + 1;
      return paymentMonth === month && p.status === 'paid';
    });
    
    return {
      month,
      appointments: monthAppointments.length,
      revenue: monthPayments.reduce((sum, p) => sum + p.amount, 0)
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Аналитика</h1>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        >
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="year">Год</option>
        </select>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего пациентов</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
            </div>
            <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-sky-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12% за месяц</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего врачей</p>
              <p className="text-2xl font-bold text-gray-900">{totalDoctors}</p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Активных: {totalDoctors}</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего приемов</p>
              <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              Завершено: {appointmentsByStatus.completed || 0}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общий доход</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} ₽</p>
            </div>
            <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8% за месяц</span>
          </div>
        </div>
      </div>

      {/* Статистика по приемам */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Статус приемов</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {Object.entries(appointmentsByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'completed' ? 'bg-green-500' :
                    status === 'scheduled' ? 'bg-blue-500' :
                    status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {status === 'completed' ? 'Завершен' :
                     status === 'scheduled' ? 'Запланирован' :
                     status === 'cancelled' ? 'Отменен' : 'Неявка'}
                  </span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Типы приемов</h3>
            <BarChart3 className="h-5 w-5 text-gray-500" />
          </div>
          <div className="space-y-3">
            {Object.entries(appointmentsByType).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {type === 'consultation' ? 'Консультация' :
                   type === 'follow-up' ? 'Повторный прием' :
                   type === 'procedure' ? 'Процедура' : 'Экстренный'}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-sky-500 h-2 rounded-full" 
                      style={{ width: `${(count / totalAppointments) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Рейтинг врачей */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Рейтинг врачей</h3>
          <LineChart className="h-5 w-5 text-gray-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Врач</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Специализация</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Приемы</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Завершено</th>
                <th className="text-center py-3 px-4 font-medium text-gray-600">Эффективность</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Доход</th>
              </tr>
            </thead>
            <tbody>
              {doctorStats.map((stat) => (
                <tr key={stat.doctor.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">
                      {stat.doctor.firstName} {stat.doctor.lastName}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {stat.doctor.specialization}
                  </td>
                  <td className="py-3 px-4 text-center font-medium">
                    {stat.totalAppointments}
                  </td>
                  <td className="py-3 px-4 text-center text-green-600 font-medium">
                    {stat.completedAppointments}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stat.efficiency >= 80 ? 'bg-green-100 text-green-800' :
                      stat.efficiency >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {stat.efficiency.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {stat.revenue.toLocaleString()} ₽
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Методы оплаты */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Методы оплаты</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(paymentMethodStats).map(([method, amount]) => (
            <div key={method} className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {amount.toLocaleString()} ₽
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {method === 'cash' ? 'Наличные' :
                 method === 'card' ? 'Карта' :
                 method === 'insurance' ? 'Страховка' : 'Перевод'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}