
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import ScheduleView from './ScheduleView';
import EmployeeManagement from './EmployeeManagement';
import { Page } from '../types';


const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Schedule);

  const renderContent = () => {
    switch (currentPage) {
      case Page.Schedule:
        return <ScheduleView />;
      case Page.Employees:
        return <EmployeeManagement />;
      default:
        return <ScheduleView />;
    }
  };

  return (
    <div className="flex h-screen bg-secondary">
      <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-1">
        <Header currentPage={currentPage} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
