import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, UserCheck, Phone, Mail, Clock } from 'lucide-react';
import { Doctor } from '../types';

interface DoctorManagementProps {
  doctors: Doctor[];
  onAddDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  onUpdateDoctor: (id: string, doctor: Partial<Doctor>) => void;
  onDeleteDoctor: (id: string) => void;
}

export function DoctorManagement({ 
  doctors, 
  onAddDoctor, 
  onUpdateDoctor, 
  onDeleteDoctor 
}: DoctorManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    specialization: '',
    phone: '',
    email: '',
    licenseNumber: '',
    experience: 0,
    workingHours: {
      start: '09:00',
      end: '17:00',
      workingDays: [1, 2, 3, 4, 5] as number[]
    },
    consultationFee: 0
  });

  const filteredDoctors = doctors.filter(doctor =>
    doctor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone.includes(searchTerm) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDoctor) {
      onUpdateDoctor(editingDoctor.id, formData);
      setEditingDoctor(null);
    } else {
      onAddDoctor(formData);
      setShowAddForm(false);
    }
    
    setFormData({
      firstName: '',
      lastName: '',
      specialization: '',
      phone: '',
      email: '',
      licenseNumber: '',
      experience: 0,
      workingHours: {
        start: '09:00',
        end: '17:00',
        workingDays: [1, 2, 3, 4, 5]
      },
      consultationFee: 0
    });
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      phone: doctor.phone,
      email: doctor.email,
      licenseNumber: doctor.licenseNumber,
      experience: doctor.experience,
      workingHours: doctor.workingHours,
      consultationFee: doctor.consultationFee
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingDoctor(null);
    setFormData({
      firstName: '',
      lastName: '',
      specialization: '',
      phone: '',
      email: '',
      licenseNumber: '',
      experience: 0,
      workingHours: {
        start: '09:00',
        end: '17:00',
        workingDays: [1, 2, 3, 4, 5]
      },
      consultationFee: 0
    });
  };

  const handleWorkingDayChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        workingDays: checked 
          ? [...prev.workingHours.workingDays, day]
          : prev.workingHours.workingDays.filter(d => d !== day)
      }
    }));
  };

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const specializations = [
    'Терапевт', 'Кардиолог', 'Невролог', 'Хирург', 'Офтальмолог',
    'Отоларинголог', 'Гинеколог', 'Уролог', 'Дерматолог', 'Педиатр'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Управление врачами</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sky-600 transition-colors"
        >
          <Plus size={20} />
          <span>Добавить врача</span>
        </button>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Поиск врачей..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
        />
      </div>

      {/* Форма добавления/редактирования */}
      {(showAddForm || editingDoctor) && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold mb-4">
            {editingDoctor ? 'Редактировать врача' : 'Добавить нового врача'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Специализация</label>
                <select
                  required
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                >
                  <option value="">Выберите специализацию</option>
                  {specializations.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Номер лицензии</label>
                <input
                  type="text"
                  required
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Опыт работы (лет)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Стоимость консультации (₽)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.consultationFee}
                  onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
              </div>
            </div>

            {/* Рабочие часы */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Рабочие часы</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Начало рабочего дня</label>
                  <input
                    type="time"
                    required
                    value={formData.workingHours.start}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      workingHours: { ...formData.workingHours, start: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Конец рабочего дня</label>
                  <input
                    type="time"
                    required
                    value={formData.workingHours.end}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      workingHours: { ...formData.workingHours, end: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Рабочие дни</label>
                <div className="flex flex-wrap gap-2">
                  {dayNames.map((day, index) => (
                    <label key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.workingHours.workingDays.includes(index)}
                        onChange={(e) => handleWorkingDayChange(index, e.target.checked)}
                        className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-sm">{day}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-sky-500 text-white px-6 py-2 rounded-lg hover:bg-sky-600 transition-colors"
              >
                {editingDoctor ? 'Сохранить изменения' : 'Добавить врача'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список врачей */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Список врачей ({filteredDoctors.length})</h2>
          <div className="space-y-4">
            {filteredDoctors.map((doctor) => (
              <div
                key={doctor.id}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone size={14} className="mr-1" />
                        {doctor.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail size={14} className="mr-1" />
                        {doctor.email}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {doctor.consultationFee.toLocaleString()} ₽
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Clock size={14} className="mr-1" />
                    {doctor.workingHours.start} - {doctor.workingHours.end}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Опыт: {doctor.experience} лет
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="p-2 text-gray-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteDoctor(doctor.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}