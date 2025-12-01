import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import DescriptionIcon from '@mui/icons-material/Description';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
const CHAPTERS_PER_PAGE = 5;

const BookDetail = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { openSearch } = useSearch();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedChapters, setBookmarkedChapters] = useState(new Set());
  const [bookmarkLoading, setBookmarkLoading] = useState(null);

  useEffect(() => {
    fetchData();
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [bookRes, chaptersRes] = await Promise.all([
        axios.get(`${API_URL}/api/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/chapters?bookId=${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setBook(bookRes.data);
      setChapters(chaptersRes.data.chapters);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bookmarks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const bookmarkedIds = new Set(response.data.map(b => b.chapterId));
      setBookmarkedChapters(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const toggleBookmark = async (e, chapterId) => {
    e.stopPropagation();
    setBookmarkLoading(chapterId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/bookmarks/toggle/${chapterId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBookmarkedChapters(prev => {
        const newSet = new Set(prev);
        if (response.data.isBookmarked) {
          newSet.add(chapterId);
        } else {
          newSet.delete(chapterId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(null);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(chapters.length / CHAPTERS_PER_PAGE);
  const startIndex = (currentPage - 1) * CHAPTERS_PER_PAGE;
  const endIndex = startIndex + CHAPTERS_PER_PAGE;
  const currentChapters = chapters.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    // Scroll to chapters section
    document.getElementById('chapters-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const breadcrumbItems = [
    { label: 'Browse', href: '/browse' },
    { label: `Class ${book.class}`, href: `/browse/${book.class}` },
    { label: book.subject?.name, href: `/browse/${book.class}/${book.subjectId}` },
    { label: book.title }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      <Navbar onSearchClick={openSearch} subtitle={book?.subject?.name || 'Book Details'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        {/* Book Header */}
        <div className="bg-gradient-to-br from-primary-600 to-orange-800 rounded-3xl shadow-2xl shadow-primary-900/20 p-8 md:p-12 mb-16 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-10">
            {book.coverImage && (
              <div className="shrink-0 mx-auto md:mx-0">
                <img 
                  src={book.coverImage} 
                  alt={book.title} 
                  className="w-56 h-auto object-cover rounded-2xl shadow-2xl transform md:rotate-3 hover:rotate-0 transition-transform duration-500 border-4 border-white/20" 
                />
              </div>
            )}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4 text-sm font-medium text-primary-100">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">{book.publisher}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-300"></span>
                <span>{book.edition || 'Latest Edition'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary-300"></span>
                <span>{book.year || '2024'}</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight">{book.title}</h1>
              
              {book.description && (
                <p className="text-primary-50 text-lg mb-8 leading-relaxed max-w-3xl">
                  {book.description}
                </p>
              )}
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold">
                <span className="bg-white text-primary-700 px-5 py-2.5 rounded-full shadow-lg">
                  Class {book.class}
                </span>
                <span className="bg-black/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/10">
                  {book.subject?.name}
                </span>
                <span className="bg-black/20 backdrop-blur-md text-white px-5 py-2.5 rounded-full border border-white/10">
                  {chapters.length} Chapters
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="max-w-5xl mx-auto" id="chapters-section">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Table of Contents</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {chapters.length} chapters
            </span>
          </div>
          
          {chapters.length === 0 ? (
            <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-16 text-center">
              <div className="mb-6 text-gray-300">
                <DescriptionIcon sx={{ fontSize: 64 }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Chapters Yet</h3>
              <p className="text-gray-600">Content is being updated. Check back soon!</p>
            </div>
          ) : (
            <>
              {/* Page info */}
              {totalPages > 1 && (
                <div className="mb-4 text-sm text-gray-500">
                  Showing {startIndex + 1}-{Math.min(endIndex, chapters.length)} of {chapters.length} chapters
                </div>
              )}

              <div className="space-y-4">
                {currentChapters.map((chapter, index) => (
                  <div
                    key={chapter.id}
                    onClick={() => navigate(`/chapter/${chapter.id}`)}
                    className="w-full group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all p-6 text-left border border-gray-100 hover:border-primary-200 relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gray-200 group-hover:bg-primary-500 transition-colors"></div>
                    <div className="flex items-center gap-6 pl-4">
                      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 group-hover:bg-primary-50 text-gray-400 group-hover:text-primary-600 font-bold text-xl transition-colors">
                        {chapter.chapterNumber}
                      </div>
                      
                      {chapter.chapterImage && (
                        <img src={chapter.chapterImage} alt={chapter.title} className="w-20 h-20 object-cover rounded-lg shadow-sm hidden sm:block" />
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                            {chapter.title}
                          </h3>
                          {chapter.pageRange && (
                            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                              pp. {chapter.pageRange}
                            </span>
                          )}
                        </div>
                        {chapter.description && (
                          <p className="text-gray-500 text-sm line-clamp-1">{chapter.description}</p>
                        )}
                      </div>
                      
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={(e) => toggleBookmark(e, chapter.id)}
                          disabled={bookmarkLoading === chapter.id}
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            bookmarkedChapters.has(chapter.id)
                              ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                          } ${bookmarkLoading === chapter.id ? 'opacity-50' : ''}`}
                          title={bookmarkedChapters.has(chapter.id) ? 'Remove bookmark' : 'Add bookmark'}
                        >
                          {bookmarkLoading === chapter.id ? (
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill={bookmarkedChapters.has(chapter.id) ? 'currentColor' : 'none'}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          )}
                        </button>
                        <span className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-primary-600 flex items-center justify-center text-gray-400 group-hover:text-white transition-all transform group-hover:rotate-45">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl border transition-all ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                          currentPage === page
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl border transition-all ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
