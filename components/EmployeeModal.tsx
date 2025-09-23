import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: User) => void;
  employeeToEdit: User | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, onSubmit, employeeToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (employeeToEdit) {
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email);
      setError('');
    }
  }, [employeeToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Imię i email są wymagane.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        setError('Proszę podać prawidłowy adres email.');
        return;
    }

    if (employeeToEdit) {
        onSubmit({
            ...employeeToEdit,
            name,
            email,
        });
    }
  };

  if (!isOpen || !employeeToEdit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" aria-modal="true" role="dialog">
      <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-xl animate-fade-in-up">
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-xl font-semibold">Edytuj dane pracownika</h3>
          <button onClick={onClose} className="p-1 text-gray-400 rounded-full hover:bg-gray-200 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="flex items-center space-x-4">
                <img src={employeeToEdit.avatarUrl} alt={name} className="w-20 h-20 rounded-full" />
                <div className="flex-1">
                    <label htmlFor="employee-name" className="block mb-2 text-sm font-medium text-gray-700">Imię i nazwisko</label>
                    <input type="text" id="employee-name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required />
                </div>
            </div>
            <div>
                <label htmlFor="employee-email" className="block mb-2 text-sm font-medium text-gray-700">Adres email</label>
                <input type="email" id="employee-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" required />
            </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end pt-4 space-x-3 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Anuluj</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white rounded-md bg-primary hover:bg-primary-hover">Zapisz zmiany</button>
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

export default EmployeeModal;
