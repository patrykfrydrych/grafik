import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { User, Role, Shift, Leave, LeaveType } from './types';
import { supabase } from './supabaseClient'; // Import Supabase client
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

// Create a context to hold authentication state and data
export const AuthContext = React.createContext<{
  currentUser: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  updateUserRole: (userId: number, newRole: Role) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  allUsers: User[];
  shifts: Shift[];
  leaves: Leave[];
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (shift: Shift) => Promise<void>;
  deleteShift: (shiftId: number) => Promise<void>;
  addLeave: (leaveData: Omit<Leave, 'id' | 'overtimeCorrection'>) => Promise<void>;
  deleteLeave: (leaveId: number) => Promise<void>;
} | null>(null);


const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: usersData, error: usersError } = await supabase.from('users').select('*').order('id');
        const { data: shiftsData, error: shiftsError } = await supabase.from('shifts').select('*');
        const { data: leavesData, error: leavesError } = await supabase.from('leaves').select('*');

        if (usersError) throw new Error(`Users Error: ${usersError.message}`);
        if (shiftsError) throw new Error(`Shifts Error: ${shiftsError.message}`);
        if (leavesError) throw new Error(`Leaves Error: ${leavesError.message}`);

        // Map raw user data from Supabase to the app's User type, casting the 'role' string to the Role enum.
        setUsers((usersData || []).map(u => ({ ...u, role: u.role as Role })));
        setShifts((shiftsData || []).map(s => ({ ...s, startTime: new Date(s.startTime), endTime: new Date(s.endTime) })));
        // Map raw leave data from Supabase to the app's Leave type.
        // In Supabase, a 'date' column without timezone becomes 'YYYY-MM-DD'. Appending T00:00:00 prevents timezone issues.
        setLeaves((leavesData || []).map(l => ({ ...l, date: new Date(`${l.date}T00:00:00`), type: l.type as LeaveType })));

      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);


  const login = useCallback((email: string, pass: string): boolean => {
    const user = users.find(u => u.email === email);
    // In a real app, you'd use Supabase Auth. For now, we keep the simple password check.
    if (user && pass === 'password') {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateUser = async (updatedUser: User) => {
    const { data, error } = await supabase
      .from('users')
      .update({ name: updatedUser.name, email: updatedUser.email })
      .eq('id', updatedUser.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user:", error);
      return;
    }
    
    if (data) {
        // Map the returned user data from Supabase to correctly handle the 'role' enum before updating state.
        const mappedData = { ...data, role: data.role as Role };
        setUsers(prevUsers => prevUsers.map(user => user.id === mappedData.id ? mappedData : user));
        if (currentUser?.id === mappedData.id) {
            setCurrentUser(mappedData);
        }
    }
  };

  const updateUserRole = async (userId: number, newRole: Role) => {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
        console.error("Error updating role:", error);
        return;
    }
    
    if (data) {
      // Map the returned user data from Supabase to correctly handle the 'role' enum before updating state.
      const mappedData = { ...data, role: data.role as Role };
      setUsers(prevUsers => prevUsers.map(user => user.id === userId ? mappedData : user));
    }
  };

  const addShift = async (shiftData: Omit<Shift, 'id'>) => {
    // 1. Update user's overtime balance
    const user = users.find(u => u.id === shiftData.userId);
    if (!user) return;

    const newOvertimeBalance = user.overtimeBalance + shiftData.overtimeHours;
    const { data: updatedUser, error: userError } = await supabase
        .from('users')
        .update({ overtimeBalance: newOvertimeBalance })
        .eq('id', shiftData.userId)
        .select()
        .single();
    
    if (userError) { console.error("Error updating user balance:", userError); return; }

    // 2. Add the new shift
    // Convert Date objects to ISO strings before sending to Supabase.
    const { data: newShift, error: shiftError } = await supabase
      .from('shifts')
      .insert({ ...shiftData, startTime: shiftData.startTime.toISOString(), endTime: shiftData.endTime.toISOString() })
      .select()
      .single();

    if (shiftError) { console.error("Error adding shift:", shiftError); return; }
    
    if (newShift && updatedUser) {
      setShifts(prev => [...prev, { ...newShift, startTime: new Date(newShift.startTime), endTime: new Date(newShift.endTime) }]);
      // Map the returned user data from Supabase to correctly handle the 'role' enum before updating state.
      const mappedUser = { ...updatedUser, role: updatedUser.role as Role };
      setUsers(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
    }
  };

  const updateShift = async (updatedShift: Shift) => {
      const oldShift = shifts.find(s => s.id === updatedShift.id);
      if (!oldShift) return;
      
      const { id, ...updatePayload } = updatedShift;
      const { data: newShiftData, error: shiftError } = await supabase
        .from('shifts')
        .update({ 
            ...updatePayload, 
            startTime: updatedShift.startTime.toISOString(),
            endTime: updatedShift.endTime.toISOString(),
         })
        .eq('id', updatedShift.id)
        .select()
        .single();

      if (shiftError) { console.error("Error updating shift:", shiftError); return; }
      if (!newShiftData) return;

      const overtimeDifference = updatedShift.overtimeHours - oldShift.overtimeHours;
      
      // If user is the same, just adjust their balance
      if (oldShift.userId === updatedShift.userId) {
          const user = users.find(u => u.id === updatedShift.userId);
          if (user) {
              const { data: updatedUser, error } = await supabase
                  .from('users')
                  .update({ overtimeBalance: user.overtimeBalance + overtimeDifference })
                  .eq('id', user.id)
                  .select().single();
              if (!error && updatedUser) {
                  const mappedUser = { ...updatedUser, role: updatedUser.role as Role };
                  setUsers(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
              }
          }
      } else { // Users are different, adjust both
          const oldUser = users.find(u => u.id === oldShift.userId);
          const newUser = users.find(u => u.id === updatedShift.userId);
          if(oldUser) {
              await supabase.from('users').update({ overtimeBalance: oldUser.overtimeBalance - oldShift.overtimeHours }).eq('id', oldUser.id);
          }
           if(newUser) {
              await supabase.from('users').update({ overtimeBalance: newUser.overtimeBalance + updatedShift.overtimeHours }).eq('id', newUser.id);
          }
          // Refetch all users to ensure consistency
          const { data: allUsers } = await supabase.from('users').select('*').order('id');
          if (allUsers) setUsers(allUsers.map(u => ({ ...u, role: u.role as Role })));
      }
      
      setShifts(prevShifts => prevShifts.map(shift =>
          shift.id === updatedShift.id ? { ...newShiftData, startTime: new Date(newShiftData.startTime), endTime: new Date(newShiftData.endTime) } : shift
      ));
  };


  const deleteShift = async (shiftId: number) => {
      const shiftToDelete = shifts.find(s => s.id === shiftId);
      if (!shiftToDelete) return;

      const { error: deleteError } = await supabase.from('shifts').delete().eq('id', shiftId);
      if (deleteError) { console.error("Error deleting shift:", deleteError); return; }

      const user = users.find(u => u.id === shiftToDelete.userId);
      if (user && shiftToDelete.overtimeHours !== 0) {
        const { data: updatedUser, error: userError } = await supabase
          .from('users')
          .update({ overtimeBalance: user.overtimeBalance - shiftToDelete.overtimeHours })
          .eq('id', user.id)
          .select().single();
        if (!userError && updatedUser) {
          const mappedUser = { ...updatedUser, role: updatedUser.role as Role };
          setUsers(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
        }
      }
      
      setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
  };


  const addLeave = async (leaveData: Omit<Leave, 'id' | 'overtimeCorrection'>) => {
    const { userId, date, type } = leaveData;

    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 6 || dayOfWeek === 0;

    const shiftsToDelete = shifts.filter(s =>
        s.userId === userId &&
        s.startTime.toDateString() === date.toDateString()
    );

    let overtimeAdjustment = 0;
    if (type === LeaveType.Wypoczynkowy && !isWeekend && shiftsToDelete.length > 0) {
        const totalShiftDuration = shiftsToDelete.reduce((acc, shift) => acc + (shift.endTime.getTime() - shift.startTime.getTime()) / (1000 * 60 * 60), 0);
        const totalOvertimeInShifts = shiftsToDelete.reduce((acc, shift) => acc + shift.overtimeHours, 0);
        const normalHoursInShift = totalShiftDuration - totalOvertimeInShifts;
        overtimeAdjustment = (normalHoursInShift - 8) - totalOvertimeInShifts;
    } else { // For other leave types or weekends, just remove overtime from planned shifts
        overtimeAdjustment = -shiftsToDelete.reduce((acc, shift) => acc + shift.overtimeHours, 0);
    }

    if (shiftsToDelete.length > 0) {
        const shiftIdsToDelete = shiftsToDelete.map(s => s.id);
        const { error } = await supabase.from('shifts').delete().in('id', shiftIdsToDelete);
        if (error) { console.error("Error deleting shifts for leave:", error); return; }
        setShifts(prevShifts => prevShifts.filter(shift => !shiftIdsToDelete.includes(shift.id)));
    }
    
    if (overtimeAdjustment !== 0) {
        const user = users.find(u => u.id === userId);
        if (user) {
            const { data: updatedUser, error } = await supabase
              .from('users')
              .update({ overtimeBalance: user.overtimeBalance + overtimeAdjustment })
              .eq('id', userId)
              .select().single();
            if (!error && updatedUser) {
              const mappedUser = { ...updatedUser, role: updatedUser.role as Role };
              setUsers(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
            }
        }
    }

    const { data: newLeave, error } = await supabase
      .from('leaves')
      .insert({ ...leaveData, overtimeCorrection: overtimeAdjustment, date: date.toISOString().split('T')[0] })
      .select()
      .single();

    if (!error && newLeave) {
        setLeaves(prev => [...prev, { ...newLeave, date: new Date(`${newLeave.date}T00:00:00`), type: newLeave.type as LeaveType }]);
    }
  };

  const deleteLeave = async (leaveId: number) => {
    const leaveToDelete = leaves.find(l => l.id === leaveId);
    if (!leaveToDelete) return;

    const { error: deleteError } = await supabase.from('leaves').delete().eq('id', leaveId);
    if(deleteError) { console.error("Error deleting leave:", deleteError); return; }

    if (leaveToDelete.overtimeCorrection !== 0) {
        const user = users.find(u => u.id === leaveToDelete.userId);
        if(user) {
            const { data: updatedUser, error } = await supabase
              .from('users')
              .update({ overtimeBalance: user.overtimeBalance - leaveToDelete.overtimeCorrection })
              .eq('id', user.id)
              .select().single();
            if(!error && updatedUser) {
                const mappedUser = { ...updatedUser, role: updatedUser.role as Role };
                setUsers(prev => prev.map(u => u.id === mappedUser.id ? mappedUser : u));
            }
        }
    }
    
    setLeaves(prevLeaves => prevLeaves.filter(l => l.id !== leaveId));
  };

  const authContextValue = useMemo(() => ({
    currentUser, login, logout, updateUserRole, updateUser, allUsers: users, shifts, leaves,
    addShift, updateShift, deleteShift, addLeave, deleteLeave,
  }), [currentUser, users, shifts, leaves, login, logout, updateUserRole, updateUser, addShift, updateShift, deleteShift, addLeave, deleteLeave]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="p-8 text-center text-red-700 bg-red-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold">Wystąpił błąd</h2>
            <p className="mt-2">Nie można załadować danych aplikacji. Sprawdź, czy poprawnie wklejono klucze w pliku `supabaseCredentials.ts`.</p>
            <p className="mt-4 p-2 font-mono text-sm text-left bg-red-200 rounded">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <div className="min-h-screen bg-background text-text-primary">
        {currentUser ? <Dashboard /> : <LoginPage />}
      </div>
    </AuthContext.Provider>
  );
};

export default App;
