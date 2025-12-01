import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const BrowseBooks = () => {
  const { classNum, subjectId } = useParams();
  const navigate = useNavigate();
  const { openSearch } = useSearch();
  const [books, setBooks] = useState([]);
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNum, subjectId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch books
      const booksRes = await axios.get(`${API_URL}/api/books?class=${classNum}&subjectId=${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(booksRes.data.books);
      
      // Get subject info from first book or fetch all subjects
      if (booksRes.data.books.length > 0) {
        setSubject(booksRes.data.books[0].subject);
      } else {
        // Fetch all subjects to find the one we need
        const subjectsRes = await axios.get(`${API_URL}/api/subjects?class=${classNum}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const foundSubject = subjectsRes.data.subjects.find(s => s.id === subjectId);
        setSubject(foundSubject);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const breadcrumbItems = [
    { label: 'Browse', href: '/browse' },
    { label: `Class ${classNum}`, href: `/browse/${classNum}` },
    { label: subject?.name || 'Subject' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      <Navbar onSearchClick={openSearch} subtitle={`Class ${classNum} • ${subject?.name || 'Books'}`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
            <p className="text-gray-600 font-medium">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-orange-100 p-12">
            <div className="mb-6 text-gray-300">
              <AutoStoriesIcon sx={{ fontSize: 64 }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Books Found</h3>
            <p className="text-gray-600 text-lg">There are no books available for this subject yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {books.map((book) => (
              <button
                key={book.id}
                onClick={() => navigate(`/book/${book.id}`)}
                className="group bg-white rounded-3xl shadow-lg shadow-orange-100/50 hover:shadow-2xl hover:shadow-primary-500/20 transition-all transform hover:-translate-y-2 overflow-hidden text-left border border-orange-50 hover:border-primary-500 flex flex-col h-full"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MenuBookIcon sx={{ fontSize: 64 }} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <span className="text-white font-bold text-sm bg-primary-600 px-3 py-1 rounded-full">View Details</span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg uppercase tracking-wide">
                      {book.publisher}
                    </span>
                    {book.edition && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {book.edition}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-primary-700 transition-colors">
                    {book.title}
                  </h3>
                  {book.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed flex-1">
                      {book.description}
                    </p>
                  )}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500 font-medium">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      {book._count?.chapters || 0} Chapters
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseBooks;
