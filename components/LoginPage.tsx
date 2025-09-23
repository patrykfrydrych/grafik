
import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { Role } from '../types';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (auth?.login(email, password)) {
      setError('');
    } else {
      setError('Nieprawidłowy email lub hasło.');
    }
  };
  
  const handleDemoLogin = (role: Role) => {
    // Find a demo user from the data fetched from Supabase
    const demoUser = auth?.allUsers.find(u => u.role === role);
    
    if (demoUser) {
      // In a real app, you'd use Supabase Auth. For this demo, we assume the password is 'password'.
      auth?.login(demoUser.email, 'password');
    } else {
        setError(`Nie znaleziono w bazie użytkownika demonstracyjnego o roli: ${role}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Zaloguj się do Grafiku
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Wprowadź swoje dane, aby kontynuować
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Adres email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Adres email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Hasło</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Hasło"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="submit"
              className="relative flex justify-center w-full px-4 py-3 text-sm font-medium text-white border border-transparent rounded-md bg-primary group hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Zaloguj się
            </button>
          </div>
        </form>
        <div className="pt-4 mt-6 border-t">
          <p className="mb-4 text-sm text-center text-gray-600">Lub zaloguj się jako użytkownik demonstracyjny:</p>
          <div className="flex space-x-4">
            <button onClick={() => handleDemoLogin(Role.Admin)} className="flex-1 px-4 py-2 text-sm font-medium text-primary bg-blue-100 rounded-md hover:bg-blue-200 transition-colors">Admin</button>
            <button onClick={() => handleDemoLogin(Role.Employee)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors">Pracownik</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
