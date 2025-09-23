import React, { useContext, useState } from 'react';
import { AuthContext } from '../App';
import { Role, User } from '../types';
import EmployeeModal from './EmployeeModal';

const EmployeeManagement: React.FC = () => {
  const auth = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);


  if (auth?.currentUser?.role !== Role.Admin) {
    return <div className="p-8 text-center text-red-500 bg-red-100 rounded-lg">Brak uprawnień do wyświetlenia tej strony.</div>;
  }

  const handleRoleChange = (userId: number, newRole: Role) => {
    if (auth.currentUser?.id === userId) {
        alert("Nie można zmienić własnej roli.");
        return;
    }
    auth.updateUserRole(userId, newRole);
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveChanges = (updatedUser: User) => {
    if (!auth) return;
    auth.updateUser(updatedUser);
    handleCloseModal();
  };

  return (
    <>
        <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="mb-6 text-2xl font-semibold text-gray-800">Zarządzanie Pracownikami</h2>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                <tr>
                <th scope="col" className="px-6 py-3">Pracownik</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Saldo Nadgodzin</th>
                <th scope="col" className="px-6 py-3">Rola</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Akcje</span></th>
                </tr>
            </thead>
            <tbody>
                {auth.allUsers.map(user => (
                <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                    <img className="w-10 h-10 rounded-full" src={user.avatarUrl} alt={`${user.name} avatar`} />
                    <div className="pl-3">
                        <div className="text-base font-semibold">{user.name}</div>
                    </div>
                    </th>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${user.overtimeBalance > 0 ? 'text-red-700 bg-red-100' : user.overtimeBalance < 0 ? 'text-blue-700 bg-blue-100' : 'text-green-700 bg-green-100'}`}>
                            {user.overtimeBalance > 0 ? '+' : ''}{user.overtimeBalance}h
                        </span>
                    </td>
                    <td className="px-6 py-4">
                    <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                        disabled={auth.currentUser?.id === user.id}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value={Role.Admin}>{Role.Admin}</option>
                        <option value={Role.Employee}>{Role.Employee}</option>
                    </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                    <button onClick={() => handleEditClick(user)} className="font-medium text-primary hover:underline">Edytuj</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        </div>
        {selectedUser && (
            <EmployeeModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSaveChanges}
                employeeToEdit={selectedUser}
            />
        )}
    </>
  );
};

export default EmployeeManagement;