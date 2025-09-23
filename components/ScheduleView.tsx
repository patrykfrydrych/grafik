import React, { useState, useMemo, useContext, useCallback } from 'react';
import { AuthContext } from '../App';
import { Role, Shift, Leave, LeaveType } from '../types';
import ShiftModal from './ShiftModal';
import LeaveModal from './LeaveModal';

type ViewMode = 'week' | 'month';

// FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
const LeaveTypeDetails: { [key in LeaveType]: {bgColor: string, borderColor: string, textColor: string, icon: React.ReactElement} } = {
    [LeaveType.Wypoczynkowy]: { 
        bgColor: 'bg-green-100', borderColor: 'border-green-500', textColor: 'text-green-900',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    },
    [LeaveType.L4]: { 
        bgColor: 'bg-orange-100', borderColor: 'border-orange-500', textColor: 'text-orange-900',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    [LeaveType.NaZadanie]: { 
        bgColor: 'bg-yellow-100', borderColor: 'border-yellow-500', textColor: 'text-yellow-900',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
    [LeaveType.Okolicznosciowy]: { 
        bgColor: 'bg-purple-100', borderColor: 'border-purple-500', textColor: 'text-purple-900',
        icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    },
};

const ScheduleView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const auth = useContext(AuthContext);

  // Shift Modal State
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const handleOpenShiftModalForNew = (date: Date) => {
    setShiftToEdit(null);
    setSelectedDate(date);
    setIsShiftModalOpen(true);
  };

  const handleOpenShiftModalForEdit = (shift: Shift) => {
    setShiftToEdit(shift);
    setSelectedDate(shift.startTime);
    setIsShiftModalOpen(true);
  };

  const handleCloseShiftModal = () => {
    setIsShiftModalOpen(false);
    setShiftToEdit(null);
  };

  const handleSubmitShift = (shiftData: Omit<Shift, 'id'> | Shift) => {
    if ('id' in shiftData) {
        auth?.updateShift(shiftData);
    } else {
        auth?.addShift(shiftData);
    }
    handleCloseShiftModal();
  };

  const handleOpenLeaveModal = (date: Date) => {
    setSelectedDate(date);
    setIsLeaveModalOpen(true);
  };

  const handleCloseLeaveModal = () => {
    setIsLeaveModalOpen(false);
  };

  const handleSubmitLeave = (leaveData: Omit<Leave, 'id' | 'overtimeCorrection'>) => {
    auth?.addLeave(leaveData);
    handleCloseLeaveModal();
  };

  const handleDeleteShift = (shiftId: number) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę zmianę?')) {
        auth?.deleteShift(shiftId);
    }
  };

  const handleDeleteLeave = (leaveId: number) => {
    if (window.confirm('Czy na pewno chcesz cofnąć tę nieobecność?')) {
        auth?.deleteLeave(leaveId);
    }
  };
  
  const getUserForShift = (userId: number) => {
    return auth?.allUsers.find(u => u.id === userId);
  }

  const isAdmin = auth?.currentUser?.role === Role.Admin;

  const navigateDate = (amount: number) => {
    setCurrentDate(prev => {
        const newDate = new Date(prev);
        if (viewMode === 'week') {
            newDate.setDate(prev.getDate() + amount * 7);
        } else {
            newDate.setMonth(prev.getMonth() + amount);
        }
        return newDate;
    });
  };

  const renderWeeklyView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return date;
    });

    const formatTime = (date: Date) => date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="grid flex-1 grid-cols-7">
            {weekDays.map(day => {
                 const shiftsForDay = auth?.shifts.filter(shift => shift.startTime.toDateString() === day.toDateString()) || [];
                 const leavesForDay = auth?.leaves.filter(leave => new Date(leave.date).toDateString() === day.toDateString()) || [];

                return (
                <div key={day.toISOString()} className="flex flex-col border-r last:border-r-0">
                    <div className="p-3 text-center border-b">
                        <p className="text-sm font-medium text-gray-500 uppercase">{day.toLocaleDateString('pl-PL', { weekday: 'short' })}</p>
                        <p className={`text-xl font-semibold mt-1 ${new Date().toDateString() === day.toDateString() ? 'text-primary' : 'text-gray-800'}`}>
                            {day.getDate()}
                        </p>
                    </div>
                    <div className="flex-1 p-2 space-y-2 overflow-y-auto bg-gray-50">
                        {leavesForDay.map(leave => {
                             const user = getUserForShift(leave.userId);
                             const details = LeaveTypeDetails[leave.type];
                             return (
                                <div key={`leave-${leave.id}`} className={`relative p-3 ${details.bgColor} border-l-4 ${details.borderColor} rounded-lg group`}>
                                     {isAdmin && (
                                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleDeleteLeave(leave.id)} className="p-1 bg-gray-100 rounded-full hover:bg-red-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-center space-x-2">
                                        <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className={`text-sm font-semibold ${details.textColor}`}>{user?.name}</p>
                                            <p className={`text-xs font-bold ${details.textColor} uppercase opacity-80`}>{leave.type}</p>
                                        </div>
                                    </div>
                                </div>
                             )
                        })}
                        {shiftsForDay
                            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                            .map(shift => {
                                const user = getUserForShift(shift.userId);
                                return (
                                    <div key={shift.id} className="relative p-3 bg-white rounded-lg shadow-sm group">
                                        {isAdmin && (
                                            <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleOpenShiftModalForEdit(shift)} className="p-1 bg-gray-100 rounded-full hover:bg-blue-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => handleDeleteShift(shift.id)} className="p-1 bg-gray-100 rounded-full hover:bg-red-100">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        )}
                                        {shift.overtimeHours > 0 && <div className="absolute top-2 left-2 px-1.5 py-0.5 text-xs font-semibold text-red-700 bg-red-100 rounded-full">+{shift.overtimeHours}h OT</div>}
                                        <div className="flex items-center space-x-2">
                                            <img src={user?.avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full" />
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                                <p className="text-xs text-gray-500">{shift.position}</p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-center text-primary">
                                            {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                        </p>
                                    </div>
                                );
                            })}
                        {isAdmin && (
                            <div className="pt-2 space-y-2">
                                <button onClick={() => handleOpenShiftModalForNew(day)} className="flex items-center justify-center w-full p-2 text-sm text-gray-500 border-2 border-dashed rounded-lg hover:bg-gray-100 hover:text-primary hover:border-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Zmiana
                                </button>
                                <button onClick={() => handleOpenLeaveModal(day)} className="flex items-center justify-center w-full p-2 text-sm text-gray-500 border-2 border-dashed rounded-lg hover:bg-gray-100 hover:text-green-600 hover:border-green-600">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    Nieobecność
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )})}
        </div>
    );
  };

  const renderMonthlyView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const startDay = new Date(startOfMonth);
    const dayOfWeek = startDay.getDay(); // 0=Sun, 1=Mon, ...
    const diff = startDay.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    startDay.setDate(diff);

    const calendarDays = Array.from({length: 42}).map((_, i) => {
        const day = new Date(startDay);
        day.setDate(startDay.getDate() + i);
        return day;
    });

    return (
        <div className="flex flex-col flex-1">
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600 border-b border-t">
                {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(day => (
                    <div key={day} className="py-3 border-r last:border-r-0">{day}</div>
                ))}
            </div>
            <div className="grid flex-1 grid-cols-7 grid-rows-6">
                {calendarDays.map((day, index) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                    const shiftsForDay = auth?.shifts.filter(s => s.startTime.toDateString() === day.toDateString()) || [];
                    const leavesForDay = auth?.leaves.filter(l => new Date(l.date).toDateString() === day.toDateString()) || [];
                    const overtimeForDay = shiftsForDay.reduce((acc, shift) => acc + shift.overtimeHours, 0);

                    return (
                        <div key={index} className={`relative p-2 border-r border-b flex flex-col ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'} ${isToday ? 'bg-blue-50' : ''} group`}>
                            <time dateTime={day.toISOString()} className={`font-semibold ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'} ${isToday ? 'bg-primary text-white rounded-full flex items-center justify-center w-7 h-7' : ''}`}>
                                {day.getDate()}
                            </time>
                            <div className="flex-1 mt-2 space-y-1 overflow-hidden">
                                {shiftsForDay.length > 0 && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        <span>{shiftsForDay.length}</span>
                                    </div>
                                )}
                                {overtimeForDay > 0 && (
                                    <div className={`flex items-center space-x-1 text-xs font-semibold text-red-600`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <span>{overtimeForDay}h</span>
                                    </div>
                                )}
                                 {leavesForDay.length > 0 && (
                                    <div className="flex items-center space-x-1 text-xs text-green-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                        <span>{leavesForDay.length}</span>
                                    </div>
                                )}
                            </div>
                            {isAdmin && (
                                <button onClick={() => handleOpenShiftModalForNew(day)} className="absolute bottom-1 right-1 w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 hover:bg-primary hover:text-white transition-all duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    )
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white rounded-lg shadow">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center">
            <h2 className="text-lg font-semibold capitalize">
                {currentDate.toLocaleDateString('pl-PL', { 
                    month: 'long', 
                    year: 'numeric',
                    ...(viewMode === 'week' && { day: 'numeric' })
                })}
            </h2>
            <div className="flex items-center ml-6 space-x-2">
                <button onClick={() => navigateDate(-1)} className="p-2 rounded-md hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-4 py-2 text-sm font-medium border rounded-md hover:bg-gray-100">
                Dzisiaj
                </button>
                <button onClick={() => navigateDate(1)} className="p-2 rounded-md hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
            </div>
          </div>
          <div className="flex p-1 space-x-1 bg-gray-100 rounded-lg">
             <button 
                onClick={() => setViewMode('week')} 
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'week' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
             >
                Tydzień
             </button>
             <button 
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'month' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:bg-gray-200'}`}
             >
                Miesiąc
             </button>
          </div>
        </div>
        {viewMode === 'week' ? renderWeeklyView() : renderMonthlyView()}
      </div>
      <ShiftModal 
        isOpen={isShiftModalOpen}
        onClose={handleCloseShiftModal}
        onSubmit={handleSubmitShift}
        shiftToEdit={shiftToEdit}
        selectedDate={selectedDate}
      />
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={handleCloseLeaveModal}
        onSubmit={handleSubmitLeave}
        selectedDate={selectedDate}
      />
    </>
  );
};

export default ScheduleView;