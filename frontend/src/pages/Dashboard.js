import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    fetchSubjects();
    fetchBooks();
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSubject, searchQuery]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { class: selectedClass },
      });
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/books`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          class: selectedClass,
          subjectId: selectedSubject,
          search: searchQuery,
        },
      });
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchNotes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/notes`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          class: selectedClass,
          subjectId: selectedSubject,
          search: searchQuery,
        },
      });
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
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
            <div className="flex gap-3">
              {user?.role === 'admin' && (
                <button
                  onClick={handleAdminPanel}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition-all"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 shadow-lg transition-all"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t-2 border-gray-200 pt-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Browse Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
                <select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubject('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Classes</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      Class {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('books')}
                  className={`${
                    activeTab === 'books'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Books ({books.length})
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`${
                    activeTab === 'notes'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                >
                  Notes ({notes.length})
                </button>
              </nav>
            </div>

            {/* Content */}
            {activeTab === 'books' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-8">No books found</p>
                ) : (
                  books.map((book) => (
                    <div key={book.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{book.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{book.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>Class {book.class}</span>
                        <span>{book.subject?.name}</span>
                      </div>
                      <a
                        href={book.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        View PDF
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notes.length === 0 ? (
                  <p className="col-span-full text-center text-gray-500 py-8">No notes found</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full capitalize">
                          {note.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{note.description}</p>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                        <span>Class {note.class}</span>
                        <span>{note.subject?.name}</span>
                      </div>
                      {note.book && (
                        <p className="text-xs text-gray-500 mb-3">Related: {note.book.title}</p>
                      )}
                      <a
                        href={note.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        View PDF
                      </a>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
