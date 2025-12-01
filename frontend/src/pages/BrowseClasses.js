import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

const BrowseClasses = () => {
  const navigate = useNavigate();
  const { openSearch } = useSearch();

  const breadcrumbItems = [
    { label: 'Browse Classes' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      <Navbar onSearchClick={openSearch} subtitle="Select Class" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">
            Choose Your Class
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a class to explore our comprehensive collection of NCERT textbooks and study materials
          </p>
        </div>

        {/* Class Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {[...Array(12)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => navigate(`/browse/${i + 1}`)}
              className="group bg-white rounded-3xl shadow-lg shadow-orange-100/50 hover:shadow-2xl hover:shadow-primary-500/20 p-8 transition-all transform hover:-translate-y-2 border-2 border-transparent hover:border-primary-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary-50 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary-100"></div>
              <div className="relative z-10">
                <div className="text-6xl font-black text-gray-900 group-hover:text-primary-600 transition-colors mb-2">
                  {i + 1}
                </div>
                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider group-hover:text-primary-600">
                  Class
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-3xl p-10 shadow-xl border border-orange-100 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>
          <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <AutoStoriesIcon className="text-primary-600" /> Complete NCERT Collection
          </h3>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg leading-relaxed">
            Access all NCERT textbooks from Class 1 to Class 12. Each book is meticulously organized
            into chapters for easy navigation and a superior learning experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrowseClasses;
