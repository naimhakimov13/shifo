import React, { useState } from 'react';
import { Repeat, Calendar, AlertCircle } from 'lucide-react';

interface RecurringAppointmentOptionProps {
  onRecurringChange: (enabled: boolean, options: {
    interval: 'week' | 'month';
    count: number;
    skipWeekends: boolean;
  }) => void;
}

export function RecurringAppointmentOption({ onRecurringChange }: RecurringAppointmentOptionProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [options, setOptions] = useState({
    interval: 'week' as 'week' | 'month',
    count: 4,
    skipWeekends: true
  });

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    onRecurringChange(enabled, options);
  };

  const handleOptionsChange = (newOptions: typeof options) => {
    setOptions(newOptions);
    if (isEnabled) {
      onRecurringChange(true, newOptions);
    }
  };

  const getPreviewText = () => {
    if (!isEnabled) return '';
    
    const intervalText = options.interval === 'week' ? 'неделю' : 'месяц';
    const totalAppointments = options.count + 1; // +1 для оригинальной записи
    
    return `Будет создано ${totalAppointments} записей (каждую ${intervalText})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="recurring"
          checked={isEnabled}
          onChange={(e) => handleToggle(e.target.checked)}
          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
        />
        <label htmlFor="recurring" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Repeat size={16} />
          <span>Создать повторяющиеся записи</span>
        </label>
      </div>

      {isEnabled && (
        <div className="ml-6 p-4 bg-sky-50 border border-sky-200 rounded-lg space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Интервал повторения
              </label>
              <select
                value={options.interval}
                onChange={(e) => handleOptionsChange({ 
                  ...options, 
                  interval: e.target.value as 'week' | 'month' 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              >
                <option value="week">Каждую неделю</option>
                <option value="month">Каждый месяц</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Количество повторений
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={options.count}
                onChange={(e) => handleOptionsChange({ 
                  ...options, 
                  count: Number(e.target.value) 
                })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={options.skipWeekends}
                onChange={(e) => handleOptionsChange({ 
                  ...options, 
                  skipWeekends: e.target.checked 
                })}
                className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
              />
              <span className="text-sm text-gray-700">Пропускать выходные дни</span>
            </label>
          </div>

          {getPreviewText() && (
            <div className="flex items-start space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Calendar size={16} className="text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">{getPreviewText()}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Все записи будут созданы со статусом "Запланировано"
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertCircle size={16} className="text-amber-600 mt-0.5" />
            <div className="text-xs text-amber-700">
              <p className="font-medium">Важно:</p>
              <ul className="mt-1 space-y-1">
                <li>• Проверьте доступность врача на выбранные даты</li>
                <li>• Конфликтующие записи не будут созданы</li>
                <li>• Вы сможете отредактировать каждую запись отдельно</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}