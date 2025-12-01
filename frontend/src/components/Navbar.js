import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import ExploreIcon from '@mui/icons-material/Explore';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const Navbar = ({ onSearchClick, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);
  const profileMenuRef = useRef(null);
  const dropdownRef = useRef(null);

  const classes = Array.from({ length: 12 }, (_, i) => i + 1);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  // Fetch subjects when hovering
  const fetchSubjects = async () => {
    if (subjects.length > 0) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Handle both array and object with subjects property
      const data = Array.isArray(response.data) ? response.data : (response.data.subjects || []);
      setSubjects(data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  // Fetch bookmarks when hovering
  const fetchBookmarks = async () => {
    setLoadingBookmarks(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoadingBookmarks(false);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group subjects by name
  const groupedSubjects = Array.isArray(subjects) ? subjects.reduce((acc, subject) => {
    if (!acc[subject.name]) {
      acc[subject.name] = [];
    }
    acc[subject.name].push(subject);
    return acc;
  }, {}) : {};

  const handleDropdownEnter = (dropdown) => {
    setActiveDropdown(dropdown);
    if (dropdown === 'subjects') fetchSubjects();
    if (dropdown === 'bookmarks') fetchBookmarks();
  };

  return (
    <header className="bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center gap-4">
            {!isHome && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
            <button 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="p-1.5 bg-primary-100 rounded-xl text-primary-600">
                <MenuBookIcon />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">EduStore</h1>
                <p className="text-[10px] font-medium text-primary-600 uppercase tracking-wider">
                  {subtitle || 'NCERT Portal'}
                </p>
              </div>
            </button>
          </div>

          {/* Center - Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1" ref={dropdownRef}>
            {/* Classes Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter('classes')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeDropdown === 'classes' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
                <ClassIcon sx={{ fontSize: 18 }} />
                <span>Classes</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'classes' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'classes' && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="w-64 bg-white rounded-xl shadow-2xl border border-gray-100 p-3">
                    <div className="grid grid-cols-4 gap-2">
                      {classes.map((cls) => (
                        <button
                          key={cls}
                          onClick={() => { navigate(`/browse/${cls}`); setActiveDropdown(null); }}
                          className="p-2 text-center rounded-lg hover:bg-primary-50 hover:text-primary-700 font-medium text-gray-700 transition-all"
                        >
                          {cls}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Subjects Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter('subjects')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeDropdown === 'subjects' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
                <SubjectIcon sx={{ fontSize: 18 }} />
                <span>Subjects</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'subjects' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'subjects' && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div className="w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 max-h-80 overflow-y-auto">
                  {Object.keys(groupedSubjects).length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">Loading...</div>
                  ) : (
                    <div className="space-y-1">
                      {Object.entries(groupedSubjects).map(([name, subs]) => (
                        <div key={name} className="group">
                          <div className="px-3 py-2 font-semibold text-gray-900 text-sm">{name}</div>
                          <div className="pl-3 space-y-0.5">
                            {subs.slice(0, 3).map((sub) => (
                              <button
                                key={sub.id}
                                onClick={() => { navigate(`/browse/${sub.class}/${sub.id}`); setActiveDropdown(null); }}
                                className="w-full px-3 py-1.5 text-left text-sm text-gray-600 hover:bg-primary-50 hover:text-primary-700 rounded-lg transition-all"
                              >
                                Class {sub.class}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  </div>
                </div>
              )}
            </div>

            {/* Bookmarks Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => handleDropdownEnter('bookmarks')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                activeDropdown === 'bookmarks' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'
              }`}>
                <BookmarksIcon sx={{ fontSize: 18 }} />
                <span>Bookmarks</span>
                <svg className={`w-4 h-4 transition-transform ${activeDropdown === 'bookmarks' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {activeDropdown === 'bookmarks' && (
                <div className="absolute top-full right-0 pt-2 z-50">
                  <div className="w-80 bg-white rounded-xl shadow-2xl border border-gray-100">
                    <div className="p-3 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">My Bookmarks</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                    {loadingBookmarks ? (
                      <div className="p-6 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      </div>
                    ) : bookmarks.length === 0 ? (
                      <div className="p-6 text-center">
                        <div className="mb-2 text-gray-400">
                          <BookmarkBorderIcon sx={{ fontSize: 40 }} />
                        </div>
                        <p className="text-gray-500 text-sm">No bookmarks yet</p>
                        <p className="text-gray-400 text-xs mt-1">Bookmark chapters to access them quickly</p>
                      </div>
                    ) : (
                      <div className="p-2">
                        {bookmarks.slice(0, 5).map((bookmark) => (
                          <button
                            key={bookmark.id}
                            onClick={() => { navigate(`/chapter/${bookmark.chapter.id}`); setActiveDropdown(null); }}
                            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg transition-all group"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm shrink-0">
                                {bookmark.chapter.chapterNumber}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate group-hover:text-primary-700">
                                  {bookmark.chapter.title}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {bookmark.chapter.book?.title} • Class {bookmark.chapter.book?.class}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                        {bookmarks.length > 5 && (
                          <div className="p-2 text-center border-t border-gray-100 mt-2">
                            <span className="text-xs text-gray-500">+{bookmarks.length - 5} more bookmarks</span>
                          </div>
                        )}
                      </div>
                    )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Browse Link */}
            <button
              onClick={() => navigate('/browse')}
              className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <ExploreIcon sx={{ fontSize: 18 }} />
              Browse All
            </button>
          </nav>

          {/* Right side - Search and Profile */}
          <div className="flex items-center gap-2">
            {/* Search Button */}
            <button
              onClick={onSearchClick}
              className="p-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-full hover:bg-gray-100 hover:border-gray-300 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Admin Button */}
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden sm:flex px-4 py-2 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-all text-sm"
              >
                Admin
              </button>
            )}

            {/* Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-0.5 rounded-full hover:bg-gray-100 transition-all border-2 border-transparent hover:border-primary-200"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="font-bold text-gray-900 truncate">{user?.name}</div>
                    <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                    <div className="mt-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${
                        user?.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 'bg-primary-100 text-primary-700'
                      }`}>
                        {user?.role === 'admin' ? (
                          <span className="flex items-center gap-1"><AdminPanelSettingsIcon sx={{ fontSize: 14 }} /> Admin</span>
                        ) : (
                          <span className="flex items-center gap-1"><SchoolIcon sx={{ fontSize: 14 }} /> Student</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                      className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">My Profile</span>
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/browse'); }}
                      className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                      <span className="font-medium">Browse Books</span>
                    </button>
                  </div>
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={() => { setShowProfileMenu(false); handleLogout(); }}
                      className="w-full px-4 py-2.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
