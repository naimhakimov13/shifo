import React, { useState } from 'react';
import { CreditCard, DollarSign, Search, Filter, CheckCircle, XCircle, Clock, Receipt } from 'lucide-react';
import { Payment, Appointment, Patient } from '../types';

interface PaymentManagementProps {
  payments: Payment[];
  appointments: Appointment[];
  patients: Patient[];
  onUpdatePayment: (id: string, payment: Partial<Payment>) => void;
}

export function PaymentManagement({ 
  payments, 
  appointments, 
  patients, 
  onUpdatePayment 
}: PaymentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  const filteredPayments = payments.filter(payment => {
    const patient = patients.find(p => p.id === payment.patientId);
    const appointment = appointments.find(a => a.id === payment.appointmentId);
    
    const matchesSearch = 
      patient?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle size={16} className="text-green-600" />;
      case 'pending': return <Clock size={16} className="text-yellow-600" />;
      case 'failed': return <XCircle size={16} className="text-red-600" />;
      case 'refunded': return <Receipt size={16} className="text-gray-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return <CreditCard size={16} className="text-blue-600" />;
      case 'cash': return <DollarSign size={16} className="text-green-600" />;
      case 'insurance': return <Receipt size={16} className="text-purple-600" />;
      case 'transfer': return <CreditCard size={16} className="text-indigo-600" />;
      default: return <DollarSign size={16} className="text-gray-600" />;
    }
  };

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    const updateData: Partial<Payment> = { status: newStatus as any };
    
    if (newStatus === 'paid' && !payments.find(p => p.id === paymentId)?.paidAt) {
      updateData.paidAt = new Date().toISOString();
    }
    
    onUpdatePayment(paymentId, updateData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление платежами</h1>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Общий доход</p>
              <p className="text-2xl font-bold text-green-600">{totalRevenue.toLocaleString()} ₽</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ожидает оплаты</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingAmount.toLocaleString()} ₽</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего транзакций</p>
              <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
            </div>
            <div className="h-12 w-12 bg-sky-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-sky-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Поиск платежей..."
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
            <option value="paid">Оплачено</option>
            <option value="pending">Ожидает</option>
            <option value="failed">Неуспешно</option>
            <option value="refunded">Возврат</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="all">Все методы</option>
            <option value="cash">Наличные</option>
            <option value="card">Карта</option>
            <option value="insurance">Страховка</option>
            <option value="transfer">Перевод</option>
          </select>
        </div>
      </div>

      {/* Список платежей */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Список платежей ({filteredPayments.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Пациент</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Сумма</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Метод</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Статус</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Дата</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const patient = patients.find(p => p.id === payment.patientId);
                  const appointment = appointments.find(a => a.id === payment.appointmentId);
                  
                  return (
                    <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{patient?.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900">
                          {payment.amount.toLocaleString()} ₽
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getMethodIcon(payment.method)}
                          <span className="capitalize">{payment.method}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(payment.status)}`}>
                            {payment.status === 'paid' ? 'Оплачено' : 
                             payment.status === 'pending' ? 'Ожидает' :
                             payment.status === 'failed' ? 'Неуспешно' : 'Возврат'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">
                          {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                        {payment.paidAt && (
                          <p className="text-xs text-green-600">
                            Оплачен: {new Date(payment.paidAt).toLocaleDateString('ru-RU')}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {payment.status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleStatusChange(payment.id, 'paid')}
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Подтвердить
                            </button>
                            <button
                              onClick={() => handleStatusChange(payment.id, 'failed')}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Отклонить
                            </button>
                          </div>
                        )}
                        {payment.status === 'paid' && (
                          <button
                            onClick={() => handleStatusChange(payment.id, 'refunded')}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                          >
                            Возврат
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {filteredPayments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Платежи не найдены
            </div>
          )}
        </div>
      </div>
    </div>
  );
}