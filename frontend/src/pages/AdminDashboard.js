import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import UnifiedContentManager from '../components/admin/UnifiedContentManager';
import UserManager from '../components/admin/UserManager';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { openSearch } = useSearch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('content');

  if (user?.role !== 'admin') {
    navigate('/dashboard');
    return null;
  }

  const tabs = [
    { id: 'content', label: 'Content', icon: MenuBookIcon },
    { id: 'users', label: 'Users', icon: PeopleIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      <Navbar onSearchClick={openSearch} subtitle="Admin Panel" />

      {/* Welcome Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-gradient-to-r from-primary-600 to-orange-600 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-xl sm:rounded-2xl flex items-center justify-center">
              <AdminPanelSettingsIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />
            </div>
            <div>
              <h2 className="text-xl sm:text-3xl font-black mb-1">Welcome, {user?.name}!</h2>
              <p className="text-white/80 text-sm sm:text-base">Manage your NCERT content library and users.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100'
                }`}
              >
                <Icon sx={{ fontSize: { xs: 18, sm: 20 } }} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {activeTab === 'content' && <UnifiedContentManager />}
        {activeTab === 'users' && <UserManager />}
      </div>
    </div>
  );
};

export default AdminDashboard;
