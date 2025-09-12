import React from 'react';
import { CreditCard, DollarSign, User, Calendar, Receipt } from 'lucide-react';
import { GroupedRecordsDisplay } from './GroupedRecordsDisplay';
import { Payment, Appointment, Patient } from '../types';
import { STATUS_ORDERS } from '../utils/recordGrouping';

interface GroupedPaymentsViewProps {
  payments: Payment[];
  appointments: Appointment[];
  patients: Patient[];
  onPaymentClick?: (payment: Payment) => void;
  className?: string;
}

export function GroupedPaymentsView({
  payments,
  appointments,
  patients,
  onPaymentClick,
  className = ''
}: GroupedPaymentsViewProps) {
  
  const renderPayment = (payment: Payment, index: number) => {
    const patient = patients.find(p => p.id === payment.patientId);
    const appointment = appointments.find(a => a.id === payment.appointmentId);

    const getMethodIcon = (method: string) => {
      switch (method) {
        case 'card': return <CreditCard size={16} className="text-blue-600" />;
        case 'cash': return <DollarSign size={16} className="text-green-600" />;
        case 'insurance': return <Receipt size={16} className="text-purple-600" />;
        case 'transfer': return <CreditCard size={16} className="text-indigo-600" />;
        default: return <DollarSign size={16} className="text-gray-600" />;
      }
    };

    const getMethodName = (method: string) => {
      switch (method) {
        case 'card': return 'Карта';
        case 'cash': return 'Наличные';
        case 'insurance': return 'Страховка';
        case 'transfer': return 'Перевод';
        default: return method;
      }
    };

    return (
      <div 
        className={`p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${
          onPaymentClick ? 'cursor-pointer' : ''
        }`}
        onClick={() => onPaymentClick?.(payment)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Patient Info */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="h-10 w-10 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {patient?.firstName} {patient?.lastName}
                </h4>
                <p className="text-sm text-gray-500">{patient?.phone}</p>
              </div>
            </div>

            {/* Payment Details */}
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <span className="text-gray-500">Сумма:</span>
                <span className="ml-2 font-bold text-lg text-gray-900">
                  {payment.amount.toLocaleString()} ₽
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getMethodIcon(payment.method)}
                <span className="text-gray-700">{getMethodName(payment.method)}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar size={14} />
                <div>
                  <div>Создан: {new Date(payment.createdAt).toLocaleDateString('ru-RU')}</div>
                  {payment.paidAt && (
                    <div className="text-green-600">
                      Оплачен: {new Date(payment.paidAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
              {appointment && (
                <div>
                  <span className="text-gray-500">Прием:</span>
                  <div className="text-gray-700">
                    {new Date(appointment.date).toLocaleDateString('ru-RU')} в {appointment.time}
                  </div>
                </div>
              )}
            </div>

            {/* Transaction ID */}
            {payment.transactionId && (
              <div className="mt-2 text-xs text-gray-500">
                ID транзакции: {payment.transactionId}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="ml-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              payment.status === 'paid' ? 'bg-green-100 text-green-800' :
              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              payment.status === 'failed' ? 'bg-red-100 text-red-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {payment.status === 'paid' ? 'Оплачено' :
               payment.status === 'pending' ? 'Ожидает' :
               payment.status === 'failed' ? 'Неуспешно' : 'Возврат'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const getGroupIcon = (groupName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      paid: <DollarSign size={16} className="text-green-600" />,
      pending: <DollarSign size={16} className="text-yellow-600" />,
      failed: <DollarSign size={16} className="text-red-600" />,
      refunded: <Receipt size={16} className="text-purple-600" />
    };
    
    return iconMap[groupName];
  };

  return (
    <GroupedRecordsDisplay
      records={payments}
      groupByField="status"
      title="Платежи по статусам"
      renderRecord={renderPayment}
      searchFields={['transactionId']}
      config={{
        sortBy: 'custom',
        customOrder: STATUS_ORDERS.payments,
        showEmptyGroups: false
      }}
      className={className}
      showStatistics={true}
      allowGroupToggle={true}
      emptyMessage="Нет платежей для отображения"
      getGroupIcon={getGroupIcon}
    />
  );
}