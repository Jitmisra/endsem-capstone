import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import BrowseClasses from './pages/BrowseClasses';
import BrowseSubjects from './pages/BrowseSubjects';
import BrowseBooks from './pages/BrowseBooks';
import BookDetail from './pages/BookDetail';
import ChapterView from './pages/ChapterView';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import GlobalSearch from './components/GlobalSearch';
import { AuthProvider, useAuth } from './context/AuthContext';

// Search Context for global search state
export const SearchContext = createContext();
export const useSearch = () => useContext(SearchContext);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return user ? <Navigate to="/" /> : children;
};

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);

  return (
    <AuthProvider>
      <SearchContext.Provider value={{ isSearchOpen, openSearch, closeSearch }}>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <GlobalSearch isOpen={isSearchOpen} onClose={closeSearch} />
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/browse" element={<ProtectedRoute><BrowseClasses /></ProtectedRoute>} />
            <Route path="/browse/:classNum" element={<ProtectedRoute><BrowseSubjects /></ProtectedRoute>} />
            <Route path="/browse/:classNum/:subjectId" element={<ProtectedRoute><BrowseBooks /></ProtectedRoute>} />
            <Route path="/book/:bookId" element={<ProtectedRoute><BookDetail /></ProtectedRoute>} />
            <Route path="/chapter/:chapterId" element={<ProtectedRoute><ChapterView /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </SearchContext.Provider>
    </AuthProvider>
  );
}

export default App;
