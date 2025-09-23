import React, { useContext } from 'react';
import { AuthContext } from '../App';
import { Page, Role } from '../types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const auth = useContext(AuthContext);

  // FIX: Replaced JSX.Element with React.ReactElement to resolve namespace issue.
  const NavItem = ({ icon, label, page }: { icon: React.ReactElement, label: string, page: Page }) => (
    <button
      onClick={() => setCurrentPage(page)}
      className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
        currentPage === page
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col w-64 p-4 bg-white border-r border-gray-200">
      <div className="flex items-center mb-8">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h1 className="ml-2 text-xl font-bold text-gray-900">Grafik Pracy</h1>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem
          page={Page.Schedule}
          label="Grafik"
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        {auth?.currentUser?.role === Role.Admin && (
          <NavItem
            page={Page.Employees}
            label="Pracownicy"
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
        )}
      </nav>
      <div className="mt-auto">
        <div className="p-4 bg-gray-100 rounded-lg">
            <div className="flex items-center">
                <img src={auth?.currentUser?.avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full" />
                <div className="ml-3">
                    <p className="text-sm font-semibold text-gray-900">{auth?.currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{auth?.currentUser?.role}</p>
                </div>
            </div>
            <button onClick={auth?.logout} className="w-full px-4 py-2 mt-4 text-sm font-medium text-center text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
                Wyloguj
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;