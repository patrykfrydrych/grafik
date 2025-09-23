import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../App';
import { Page } from '../types';

interface HeaderProps {
    currentPage: Page;
}

const Header: React.FC<HeaderProps> = ({ currentPage }) => {
  const auth = useContext(AuthContext);

  const todayOvertime = useMemo(() => {
    if (!auth?.shifts) return 0;
    const today = new Date().toDateString();
    return auth.shifts
      .filter(shift => shift.startTime.toDateString() === today)
      .reduce((total, shift) => total + shift.overtimeHours, 0);
  }, [auth?.shifts]);

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-900">{currentPage}</h1>
          <div className="flex items-center p-2 space-x-2 bg-gray-100 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-gray-600">Nadgodziny Dzisiaj:</span>
            <span className={`text-sm font-bold ${todayOvertime > 0 ? 'text-red-600' : 'text-green-600'}`}>{todayOvertime}h</span>
          </div>
        </div>
      <div className="flex items-center space-x-4">
        {/* Placeholder for notifications or other actions */}
        <div className="relative">
          <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
        <div className="flex items-center">
          <span className="hidden sm:inline text-right mr-3">
              <span className="block text-sm font-medium text-gray-800">{auth?.currentUser?.name}</span>
              <span className="block text-xs text-gray-500">{auth?.currentUser?.role}</span>
          </span>
          <img
            className="w-10 h-10 rounded-full"
            src={auth?.currentUser?.avatarUrl}
            alt="User avatar"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;