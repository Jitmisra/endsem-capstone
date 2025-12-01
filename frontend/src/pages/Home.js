import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { openSearch } = useSearch();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans text-gray-900">
      <Navbar onSearchClick={openSearch} />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center mb-20 max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            Master Your <span className="text-primary-600 relative inline-block">
              Studies
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed">
            Your comprehensive digital library for NCERT textbooks, detailed chapters, and premium study materials for Class 1-12.
          </p>
          
          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/browse')}
              className="px-10 py-5 bg-primary-600 text-white text-xl font-bold rounded-full hover:bg-primary-700 transform hover:scale-105 transition-all shadow-xl hover:shadow-primary-500/30 flex items-center gap-3"
            >
              Start Learning Now
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button className="px-10 py-5 bg-white text-gray-700 text-xl font-bold rounded-full hover:bg-gray-50 border-2 border-gray-100 transition-all">
              Learn More
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-10 text-center border border-orange-50 hover:border-primary-200 transition-all group">
            <div className="mb-6 bg-primary-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-primary-600">
              <AutoStoriesIcon sx={{ fontSize: 48 }} />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2">12</h3>
            <p className="text-gray-500 font-medium uppercase tracking-wide">Classes Covered</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-10 text-center border border-orange-50 hover:border-primary-200 transition-all group">
            <div className="mb-6 bg-primary-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-primary-600">
              <LibraryBooksIcon sx={{ fontSize: 48 }} />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2">100+</h3>
            <p className="text-gray-500 font-medium uppercase tracking-wide">Subjects Available</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl shadow-orange-100/50 p-10 text-center border border-orange-50 hover:border-primary-200 transition-all group">
            <div className="mb-6 bg-primary-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform text-primary-600">
              <RocketLaunchIcon sx={{ fontSize: 48 }} />
            </div>
            <h3 className="text-4xl font-black text-gray-900 mb-2">Free</h3>
            <p className="text-gray-500 font-medium uppercase tracking-wide">Unlimited Access</p>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: <GpsFixedIcon sx={{ fontSize: 36 }} />, title: 'Focused Learning', desc: 'Distraction-free interface designed for deep study sessions.' },
            { icon: <PhoneIphoneIcon sx={{ fontSize: 36 }} />, title: 'Mobile First', desc: 'Study on the go with our fully responsive mobile design.' },
            { icon: <BoltIcon sx={{ fontSize: 36 }} />, title: 'Lightning Fast', desc: 'Optimized performance for quick access to heavy PDFs.' },
            { icon: <LockIcon sx={{ fontSize: 36 }} />, title: 'Secure Platform', desc: 'Enterprise-grade security to keep your data safe.' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white shadow-lg hover:shadow-xl transition-all">
              <div className="mb-4 text-primary-600">{feature.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
              <p className="text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-orange-100 mt-20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-primary-600">
            <MenuBookIcon />
            <span className="font-bold text-xl text-gray-900">EduStore</span>
          </div>
          <p className="text-gray-500 font-medium">
            © 2024 EduStore. Built for the future of education.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
