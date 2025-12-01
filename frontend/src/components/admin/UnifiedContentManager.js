import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ClassIcon from '@mui/icons-material/Class';
import SubjectIcon from '@mui/icons-material/Subject';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const UnifiedContentManager = () => {
  // State management
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const [subjects, setSubjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [subjectForm, setSubjectForm] = useState({ name: '', class: '' });
  const [bookForm, setBookForm] = useState({
    title: '',
    description: '',
    publisher: 'NCERT',
    edition: '',
    year: '',
  });
  const [chapterForm, setChapterForm] = useState({
    chapterNumber: '',
    title: '',
    description: '',
    pageRange: '',
  });
  
  const [coverImage, setCoverImage] = useState(null);
  const [chapterImage, setChapterImage] = useState(null);
  const [chapterPdf, setChapterPdf] = useState(null);

  const [editingSubject, setEditingSubject] = useState(null);
  const [editingBook, setEditingBook] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

  // Fetch data based on selections
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

  // API calls
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
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/api/books?class=${selectedClass}&subjectId=${selectedSubject.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chapters?bookId=${selectedBook.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters(response.data.chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  // Subject CRUD
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const data = { ...subjectForm, class: parseInt(selectedClass) };
      
      if (editingSubject) {
        await axios.put(`${API_URL}/api/subjects/${editingSubject.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/api/subjects`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      setSubjectForm({ name: '', class: '' });
      setEditingSubject(null);
      setShowSubjectForm(false);
      fetchSubjects();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm('Delete this subject? All books and chapters will be deleted!')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/subjects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubjects();
      if (selectedSubject?.id === id) {
        setSelectedSubject(null);
        setBooks([]);
        setChapters([]);
      }
    } catch (error) {
      alert('Failed to delete subject');
    }
  };

  // Book CRUD
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingBook && !coverImage) {
      alert('Cover image is required!');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', bookForm.title);
      formData.append('description', bookForm.description);
      formData.append('class', selectedClass);
      formData.append('subjectId', selectedSubject.id);
      formData.append('publisher', bookForm.publisher);
      formData.append('edition', bookForm.edition);
      formData.append('year', bookForm.year);
      if (coverImage) formData.append('coverImage', coverImage);

      if (editingBook) {
        await axios.put(`${API_URL}/api/books/${editingBook.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axios.post(`${API_URL}/api/books`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      }
      
      setBookForm({ title: '', description: '', publisher: 'NCERT', edition: '', year: '' });
      setCoverImage(null);
      setEditingBook(null);
      setShowBookForm(false);
      fetchBooks();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (!window.confirm('Delete this book? All chapters will be deleted!')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/books/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBooks();
      if (selectedBook?.id === id) {
        setSelectedBook(null);
        setChapters([]);
      }
    } catch (error) {
      alert('Failed to delete book');
    }
  };

  // Chapter CRUD
  const handleChapterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress(0);
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('bookId', selectedBook.id);
      formData.append('chapterNumber', chapterForm.chapterNumber);
      formData.append('title', chapterForm.title);
      formData.append('description', chapterForm.description);
      formData.append('pageRange', chapterForm.pageRange);
      if (chapterPdf) formData.append('pdf', chapterPdf);
      if (chapterImage) formData.append('chapterImage', chapterImage);

      if (editingChapter) {
        await axios.put(`${API_URL}/api/chapters/${editingChapter.id}`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });
      } else {
        await axios.post(`${API_URL}/api/chapters`, formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
        });
      }
      
      setChapterForm({ chapterNumber: '', title: '', description: '', pageRange: '' });
      setChapterPdf(null);
      setChapterImage(null);
      setEditingChapter(null);
      setShowChapterForm(false);
      setUploadProgress(0);
      fetchChapters();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save chapter');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!window.confirm('Delete this chapter?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/chapters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChapters();
    } catch (error) {
      alert('Failed to delete chapter');
    }
  };

  // Edit handlers
  const handleEditSubject = (subject) => {
    setEditingSubject(subject);
    setSubjectForm({ name: subject.name, class: subject.class });
    setShowSubjectForm(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setBookForm({
      title: book.title,
      description: book.description || '',
      publisher: book.publisher || 'NCERT',
      edition: book.edition || '',
      year: book.year || '',
    });
    setShowBookForm(true);
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      description: chapter.description || '',
      pageRange: chapter.pageRange || '',
    });
    setShowChapterForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Class Selection */}
      <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 flex-shrink-0">
            <ClassIcon />
          </div>
          <h2 className="text-base sm:text-xl font-bold text-gray-900">Step 1: Select Class</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 sm:gap-3">
          {[...Array(12)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => {
                setSelectedClass(i + 1);
                setSelectedSubject(null);
                setSelectedBook(null);
              }}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all ${
                selectedClass === i + 1
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-primary-50 hover:text-primary-700 border border-gray-100'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Management */}
      {selectedClass && (
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                <SubjectIcon />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                Step 2: Select Subject <span className="text-primary-600">(Class {selectedClass})</span>
              </h2>
            </div>
            <button
              onClick={() => {
                setShowSubjectForm(!showSubjectForm);
                setEditingSubject(null);
                setSubjectForm({ name: '', class: selectedClass });
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                showSubjectForm 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
              }`}
            >
              {showSubjectForm ? 'Cancel' : <><AddIcon sx={{ fontSize: 18 }} /> Add Subject</>}
            </button>
          </div>

          {showSubjectForm && (
            <form onSubmit={handleSubjectSubmit} className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-primary-50 to-orange-50 rounded-2xl border border-primary-100">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Subject name (e.g., Mathematics)"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-sm sm:text-base"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:bg-gray-400 transition-all shadow-lg text-sm sm:text-base"
                >
                  {loading ? 'Saving...' : editingSubject ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedSubject?.id === subject.id
                    ? 'border-primary-500 bg-primary-50 shadow-lg'
                    : 'border-gray-100 hover:border-primary-300 hover:shadow-md bg-white'
                }`}
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedBook(null);
                }}
              >
                <div className="font-bold text-gray-900 text-base sm:text-lg">{subject.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {subject._count?.books || 0} books
                </div>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSubject(subject);
                    }}
                    className="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                  >
                    <EditIcon sx={{ fontSize: 14 }} /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubject(subject.id);
                    }}
                    className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <DeleteIcon sx={{ fontSize: 14 }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Book Management */}
      {selectedSubject && (
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <MenuBookIcon />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                Step 3: Select Book <span className="text-primary-600">({selectedSubject.name})</span>
              </h2>
            </div>
            <button
              onClick={() => {
                setShowBookForm(!showBookForm);
                setEditingBook(null);
                setBookForm({ title: '', description: '', publisher: 'NCERT', edition: '', year: '' });
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                showBookForm 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
              }`}
            >
              {showBookForm ? 'Cancel' : <><AddIcon sx={{ fontSize: 18 }} /> Add Book</>}
            </button>
          </div>

          {showBookForm && (
            <form onSubmit={handleBookSubmit} className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-primary-50 to-orange-50 rounded-2xl border border-primary-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="Book title"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                  required
                />
                <input
                  type="text"
                  placeholder="Publisher (e.g., NCERT)"
                  value={bookForm.publisher}
                  onChange={(e) => setBookForm({ ...bookForm, publisher: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                />
                <input
                  type="text"
                  placeholder="Edition"
                  value={bookForm.edition}
                  onChange={(e) => setBookForm({ ...bookForm, edition: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={bookForm.year}
                  onChange={(e) => setBookForm({ ...bookForm, year: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                />
              </div>
              <textarea
                placeholder="Description"
                value={bookForm.description}
                onChange={(e) => setBookForm({ ...bookForm, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                rows="2"
              />
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Cover Image * {editingBook && '(optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverImage(e.target.files[0])}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                  required={!editingBook}
                />
                <p className="text-xs text-gray-500 mt-2">JPG, PNG, WebP (max 10MB)</p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:bg-gray-400 transition-all shadow-lg"
              >
                {loading ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {books.map((book) => (
              <div
                key={book.id}
                className={`rounded-2xl border-2 cursor-pointer transition-all overflow-hidden ${
                  selectedBook?.id === book.id
                    ? 'border-primary-500 shadow-xl shadow-primary-500/20'
                    : 'border-gray-100 hover:border-primary-300 hover:shadow-lg'
                }`}
                onClick={() => setSelectedBook(book)}
              >
                {book.coverImage && (
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                )}
                <div className="p-3 sm:p-4">
                  <div className="font-bold text-gray-900 text-sm sm:text-base">{book.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {book.publisher} • {book.edition || 'Latest'}
                  </div>
                  <div className="text-xs sm:text-sm text-primary-600 font-medium mt-2">
                    {book._count?.chapters || 0} chapters
                  </div>
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditBook(book);
                      }}
                      className="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                    >
                      <EditIcon sx={{ fontSize: 14 }} /> Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBook(book.id);
                      }}
                      className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <DeleteIcon sx={{ fontSize: 14 }} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter Management */}
      {selectedBook && (
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                <ArticleIcon />
              </div>
              <h2 className="text-base sm:text-xl font-bold text-gray-900">
                Step 4: Manage Chapters <span className="text-primary-600 block sm:inline">({selectedBook.title})</span>
              </h2>
            </div>
            <button
              onClick={() => {
                setShowChapterForm(!showChapterForm);
                setEditingChapter(null);
                setChapterForm({ chapterNumber: '', title: '', description: '', pageRange: '' });
              }}
              className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-medium transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                showChapterForm 
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                  : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30'
              }`}
            >
              {showChapterForm ? 'Cancel' : <><AddIcon sx={{ fontSize: 18 }} /> Add Chapter</>}
            </button>
          </div>

          {showChapterForm && (
            <form onSubmit={handleChapterSubmit} className="mb-6 p-4 sm:p-5 bg-gradient-to-r from-primary-50 to-orange-50 rounded-2xl border border-primary-100 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="number"
                  placeholder="Chapter number"
                  value={chapterForm.chapterNumber}
                  onChange={(e) => setChapterForm({ ...chapterForm, chapterNumber: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                  required
                  min="1"
                />
                <input
                  type="text"
                  placeholder="Page range (e.g., 1-25)"
                  value={chapterForm.pageRange}
                  onChange={(e) => setChapterForm({ ...chapterForm, pageRange: e.target.value })}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                />
              </div>
              <input
                type="text"
                placeholder="Chapter title"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                required
              />
              <textarea
                placeholder="Description"
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm sm:text-base"
                rows="2"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Chapter Image (optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setChapterImage(e.target.files[0])}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Chapter PDF {editingChapter && '(optional)'}
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setChapterPdf(e.target.files[0])}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl bg-white text-sm"
                    required={!editingChapter}
                  />
                </div>
              </div>
              
              {uploadProgress > 0 && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 font-medium">{uploadProgress}% uploaded</p>
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:bg-gray-400 transition-all shadow-lg"
              >
                {loading ? 'Uploading...' : editingChapter ? 'Update Chapter' : 'Add Chapter'}
              </button>
            </form>
          )}

          <div className="space-y-3 sm:space-y-4">
            {chapters.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-2xl">
                <ArticleIcon sx={{ fontSize: 48 }} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium text-sm sm:text-base">No chapters yet. Click "Add Chapter" to get started.</p>
              </div>
            ) : (
              chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="p-4 sm:p-5 border-2 border-gray-100 rounded-2xl hover:border-primary-300 hover:shadow-md transition-all bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                        <span className="bg-primary-100 text-primary-700 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold">
                          Chapter {chapter.chapterNumber}
                        </span>
                        {chapter.pageRange && (
                          <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">Pages: {chapter.pageRange}</span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">{chapter.title}</h3>
                      {chapter.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-2">{chapter.description}</p>
                      )}
                      <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4">
                        {chapter.pdfUrl && (
                          <a
                            href={chapter.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                          >
                            <PictureAsPdfIcon sx={{ fontSize: 16 }} /> View PDF
                          </a>
                        )}
                        <button
                          onClick={() => handleEditChapter(chapter)}
                          className="text-xs sm:text-sm text-primary-600 hover:text-primary-800 font-medium flex items-center gap-1"
                        >
                          <EditIcon sx={{ fontSize: 14 }} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(chapter.id)}
                          className="text-xs sm:text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                        >
                          <DeleteIcon sx={{ fontSize: 14 }} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedContentManager;
