import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalculateIcon from '@mui/icons-material/Calculate';
import ScienceIcon from '@mui/icons-material/Science';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import TranslateIcon from '@mui/icons-material/Translate';
import PublicIcon from '@mui/icons-material/Public';
import BiotechIcon from '@mui/icons-material/Biotech';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DescriptionIcon from '@mui/icons-material/Description';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      fetchSubjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchBooks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (selectedBook) {
      fetchChapters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/subjects?class=${selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/books?class=${selectedClass}&subjectId=${selectedSubject}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chapters?bookId=${selectedBook.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters(response.data.chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAdminPanel = () => {
    navigate('/admin');
  };

  const handleClassSelect = (classNum) => {
    setSelectedClass(classNum);
    setSelectedSubject('');
    setSelectedBook(null);
    setBooks([]);
    setChapters([]);
  };

  const handleSubjectSelect = (subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedBook(null);
    setChapters([]);
  };

  const handleBookSelect = (book) => {
    setSelectedBook(book);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                <MenuBookIcon className="text-blue-600" /> EduStore
              </h1>
              <p className="text-sm text-gray-600 mt-1">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-3">
              {user?.role === 'admin' && (
                <button
                  onClick={handleAdminPanel}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm">
          <button
            onClick={() => {
              setSelectedClass('');
              setSelectedSubject('');
              setSelectedBook(null);
            }}
            className="text-blue-600 hover:text-blue-800"
          >
            Home
          </button>
          {selectedClass && (
            <>
              <span className="text-gray-400">→</span>
              <button
                onClick={() => {
                  setSelectedSubject('');
                  setSelectedBook(null);
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Class {selectedClass}
              </button>
            </>
          )}
          {selectedSubject && (
            <>
              <span className="text-gray-400">→</span>
              <button
                onClick={() => setSelectedBook(null)}
                className="text-blue-600 hover:text-blue-800"
              >
                {subjects.find((s) => s.id === selectedSubject)?.name}
              </button>
            </>
          )}
          {selectedBook && (
            <>
              <span className="text-gray-400">→</span>
              <span className="text-gray-700 font-medium">{selectedBook.title}</span>
            </>
          )}
        </div>

        {/* Class Selection */}
        {!selectedClass && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Your Class</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handleClassSelect(i + 1)}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 border-transparent hover:border-blue-500"
                >
                  <div className="text-4xl font-bold text-blue-600 mb-2">{i + 1}</div>
                  <div className="text-sm text-gray-600">Class {i + 1}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subject Selection */}
        {selectedClass && !selectedSubject && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Select Subject for Class {selectedClass}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject.id)}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 text-left border-2 border-transparent hover:border-indigo-500"
                >
                  <div className="text-2xl mb-2 text-indigo-600">
                    {subject.name === 'Mathematics' && <CalculateIcon />}
                    {subject.name === 'Science' && <ScienceIcon />}
                    {subject.name === 'English' && <AutoStoriesIcon />}
                    {subject.name === 'Hindi' && <TranslateIcon />}
                    {subject.name === 'Social Science' && <PublicIcon />}
                    {subject.name === 'Physics' && <ScienceIcon />}
                    {subject.name === 'Chemistry' && <BiotechIcon />}
                    {subject.name === 'Biology' && <BiotechIcon />}
                    {!['Mathematics', 'Science', 'English', 'Hindi', 'Social Science', 'Physics', 'Chemistry', 'Biology'].includes(subject.name) && <LibraryBooksIcon />}
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{subject.name}</div>
                  <div className="text-sm text-gray-500 mt-2">
                    {subject._count?.books || 0} books available
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Book Selection */}
        {selectedSubject && !selectedBook && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Book</h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading books...</p>
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="mb-4 text-gray-300">
                  <LibraryBooksIcon sx={{ fontSize: 64 }} />
                </div>
                <p className="text-gray-600">No books available for this subject yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => handleBookSelect(book)}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 overflow-hidden text-left border-2 border-transparent hover:border-purple-500"
                  >
                    {book.coverImage && (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-6">
                      <div className="text-xs text-indigo-600 font-semibold mb-2">
                        {book.publisher} • {book.edition || 'Latest Edition'}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{book.title}</h3>
                      {book.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{book.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-500">
                          {book._count?.chapters || 0} chapters
                        </span>
                      </div>
                      <div className="text-purple-600 font-medium text-sm">View Chapters →</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Chapter List */}
        {selectedBook && (
          <div>
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl shadow-lg p-6 mb-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{selectedBook.title}</h2>
              <p className="text-purple-100">
                {selectedBook.publisher} • Class {selectedBook.class} • {selectedBook.subject?.name}
              </p>
              {selectedBook.description && (
                <p className="text-purple-100 mt-2">{selectedBook.description}</p>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading chapters...</p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="mb-4 text-gray-300">
                  <DescriptionIcon sx={{ fontSize: 64 }} />
                </div>
                <p className="text-gray-600">No chapters available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-l-4 border-purple-500"
                  >
                    <div className="flex items-start">
                      {chapter.chapterImage && (
                        <img
                          src={chapter.chapterImage}
                          alt={chapter.title}
                          className="w-32 h-32 object-cover"
                        />
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                            Chapter {chapter.chapterNumber}
                          </span>
                          {chapter.pageRange && (
                            <span className="text-sm text-gray-500">Pages: {chapter.pageRange}</span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{chapter.title}</h3>
                        {chapter.description && (
                          <p className="text-gray-600 mb-4">{chapter.description}</p>
                        )}
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => navigate(`/chapter/${chapter.id}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            <DescriptionIcon sx={{ fontSize: 18 }} /> Read Chapter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
