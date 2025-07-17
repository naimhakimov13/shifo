import React from 'react';
import { 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface DashboardProps {
  patients: any[];
  doctors: any[];
  appointments: any[];
  payments: any[];
}

export function Dashboard({ patients, doctors, appointments, payments }: DashboardProps) {
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const pendingPayments = payments.filter(payment => payment.status === 'pending');
  const totalRevenue = payments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const upcomingAppointments = appointments
    .filter(apt => {
      const aptDate = new Date(apt.date);
      const today = new Date();
      return aptDate >= today && apt.status === 'scheduled';
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-600 mt-2">Добро пожаловать в систему управления клиникой</p>
      </div>

      {/* Статистические карточки */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего пациентов</p>
              <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
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

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Записи сегодня</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="h-4 w-4 text-blue-500 mr-1" />
            <span className="text-gray-600">Ближайшая в 10:00</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Доход за месяц</p>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} ₽</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8% за месяц</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ожидают оплаты</p>
              <p className="text-2xl font-bold text-gray-900">{pendingPayments.length}</p>
            </div>
            <div className="h-12 w-12 bg-rose-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {pendingPayments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Ближайшие записи */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Ближайшие записи</h2>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Нет запланированных записей</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const patient = patients.find(p => p.id === appointment.patientId);
                const doctor = doctors.find(d => d.id === appointment.doctorId);
                
                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {patient?.firstName?.[0]}{patient?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {doctor?.firstName} {doctor?.lastName} • {doctor?.specialization}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {new Date(appointment.date).toLocaleDateString('ru-RU')}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.time}</p>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}