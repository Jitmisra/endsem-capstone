import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-xl rounded-2xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Welcome to EduStore</h1>
              <p className="text-gray-600 mt-2">Your NCERT Books & Notes Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-lg hover:shadow-xl transition-all"
            >
              Logout
            </button>
          </div>

          <div className="border-t-2 border-gray-200 pt-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                <p className="text-sm text-gray-600 mb-2">Name</p>
                <p className="text-xl font-semibold text-gray-900">{user?.name}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                <p className="text-sm text-gray-600 mb-2">Email</p>
                <p className="text-xl font-semibold text-gray-900">{user?.email}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-100">
                <p className="text-sm text-gray-600 mb-2">Role</p>
                <p className="text-lg font-semibold text-gray-900 capitalize">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    user?.role === 'admin' 
                      ? 'bg-orange-200 text-orange-800 border-2 border-orange-300' 
                      : 'bg-amber-200 text-amber-800 border-2 border-amber-300'
                  }`}>
                    {user?.role}
                  </span>
                </p>
              </div>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
