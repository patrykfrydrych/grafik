import React, { useState, useEffect, useContext, useMemo } from 'react';
import { Shift, Role } from '../types';
import { AuthContext } from '../App';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shiftData: Omit<Shift, 'id'> | Shift) => void;
  shiftToEdit?: Shift | null;
  selectedDate: Date;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ isOpen, onClose, onSubmit, shiftToEdit, selectedDate }) => {
  const auth = useContext(AuthContext);
  const [userId, setUserId] = useState<string>('');
  const [position, setPosition] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [overtimeHours, setOvertimeHours] = useState<number>(0);
  const [error, setError] = useState('');

  const formatDateTimeLocal = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  useEffect(() => {
    if (isOpen) {
        if (shiftToEdit) {
            setUserId(String(shiftToEdit.userId));
            setPosition(shiftToEdit.position);
            setStartTime(formatDateTimeLocal(shiftToEdit.startTime));
            setEndTime(formatDateTimeLocal(shiftToEdit.endTime));
            setOvertimeHours(shiftToEdit.overtimeHours);
        } else {
            const defaultStartTime = new Date(selectedDate);
            defaultStartTime.setHours(8, 0, 0, 0);
            const defaultEndTime = new Date(selectedDate);
            defaultEndTime.setHours(16, 0, 0, 0);
            
            setUserId('');
            setPosition('');
            setStartTime(formatDateTimeLocal(defaultStartTime));
            setEndTime(formatDateTimeLocal(defaultEndTime));
            setOvertimeHours(0);
        }
        setError('');
    }
  }, [shiftToEdit, selectedDate, isOpen]);

  const shiftDuration = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) return 0;
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return Math.round(diff * 100) / 100; // round to 2 decimal places
  }, [startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId || !position || !startTime || !endTime) {
      setError('Wszystkie pola są wymagane.');
      return;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      setError('Czas zakończenia musi być późniejszy niż czas rozpoczęcia.');
      return;
    }

    const shiftData = {
      userId: parseInt(userId, 10),
      position,
      startTime: start,
      endTime: end,
      overtimeHours: Number(overtimeHours) || 0,
    };
    
    if (shiftToEdit) {
      onSubmit({ ...shiftData, id: shiftToEdit.id });
    } else {
      onSubmit(shiftData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl animate-fade-in-up">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-xl font-semibold">{shiftToEdit ? 'Edytuj zmianę' : 'Dodaj nową zmianę'}</h3>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="employee" className="block mb-2 text-sm font-medium text-gray-700">Pracownik</label>
            <select id="employee" value={userId} onChange={e => setUserId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required>
              <option value="" disabled>Wybierz pracownika</option>
              {auth?.allUsers.filter(u => u.role === Role.Employee).map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
                <label htmlFor="position" className="block mb-2 text-sm font-medium text-gray-700">Stanowisko</label>
                <input type="text" id="position" value={position} onChange={e => setPosition(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="np. Kasjer" required/>
            </div>
             <div>
                <label htmlFor="overtime" className="block mb-2 text-sm font-medium text-gray-700">Nadgodziny (godz.)</label>
                <input type="number" id="overtime" value={overtimeHours} onChange={e => setOvertimeHours(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" placeholder="0"/>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="start-time" className="block mb-2 text-sm font-medium text-gray-700">Czas rozpoczęcia</label>
              <input type="datetime-local" id="start-time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required/>
            </div>
            <div>
              <label htmlFor="end-time" className="block mb-2 text-sm font-medium text-gray-700">Czas zakończenia</label>
              <input type="datetime-local" id="end-time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required/>
            </div>
          </div>
           {shiftDuration > 0 && <div className="p-2 text-sm text-center text-blue-800 bg-blue-100 rounded-md">Czas trwania zmiany: <strong>{shiftDuration} godz.</strong></div>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Anuluj</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-hover">
              {shiftToEdit ? 'Zapisz zmiany' : 'Dodaj zmianę'}
            </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fade-in-up {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default ShiftModal;