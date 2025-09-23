import React, { useState, useContext, useEffect } from 'react';
import { Role, Leave, LeaveType } from '../types';
import { AuthContext } from '../App';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (leaveData: Omit<Leave, 'id' | 'overtimeCorrection'>) => void;
  selectedDate: Date;
}

const LeaveModal: React.FC<LeaveModalProps> = ({ isOpen, onClose, onSubmit, selectedDate }) => {
  const auth = useContext(AuthContext);
  const [userId, setUserId] = useState<string>('');
  const [leaveDate, setLeaveDate] = useState<Date>(selectedDate);
  const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.Wypoczynkowy);
  const [error, setError] = useState('');

  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (isOpen) {
        setUserId('');
        setLeaveDate(selectedDate);
        setLeaveType(LeaveType.Wypoczynkowy);
        setError('');
    }
  }, [isOpen, selectedDate]);
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [year, month, day] = e.target.value.split('-').map(Number);
    // Create a new date at midnight in the user's local timezone to avoid UTC issues
    const localDate = new Date(year, month - 1, day);
    setLeaveDate(localDate);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('Proszę wybrać pracownika.');
      return;
    }
    onSubmit({ 
        userId: parseInt(userId, 10), 
        date: leaveDate,
        type: leaveType 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-xl font-semibold">Dodaj nieobecność</h3>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="leave-date" className="block mb-2 text-sm font-medium text-gray-700">Data</label>
            <input 
              type="date"
              id="leave-date"
              value={formatDateForInput(leaveDate)} 
              onChange={handleDateChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="leave-type" className="block mb-2 text-sm font-medium text-gray-700">Rodzaj nieobecności</label>
            <select id="leave-type" value={leaveType} onChange={e => setLeaveType(e.target.value as LeaveType)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required>
              {Object.values(LeaveType).map(type => (
                  <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="employee" className="block mb-2 text-sm font-medium text-gray-700">Pracownik</label>
            <select id="employee" value={userId} onChange={e => setUserId(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required>
              <option value="" disabled>Wybierz pracownika</option>
              {auth?.allUsers.filter(u => u.role === Role.Employee).map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Anuluj</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-hover">
              Zatwierdź
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveModal;