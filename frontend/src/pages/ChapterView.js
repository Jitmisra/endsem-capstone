import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import NCERTMasterBot from '../components/NCERTMasterBot';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DescriptionIcon from '@mui/icons-material/Description';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const ChapterView = () => {
  const { chapterId } = useParams();
  const { openSearch } = useSearch();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    fetchChapter();
    checkBookmark();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const fetchChapter = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chapters/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapter(response.data);
    } catch (error) {
      console.error('Error fetching chapter:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkBookmark = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/bookmarks/check/${chapterId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const toggleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/bookmarks/toggle/${chapterId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
          <p className="text-gray-600 font-medium">Loading chapter content...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-10 rounded-3xl shadow-xl border border-orange-100">
          <p className="text-gray-600 mb-6 text-lg">Chapter not found</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-all"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Browse', href: '/browse' },
    { label: `Class ${chapter.book?.class}`, href: `/browse/${chapter.book?.class}` },
    { label: chapter.book?.subject?.name, href: `/browse/${chapter.book?.class}/${chapter.book?.subjectId}` },
    { label: chapter.book?.title, href: `/book/${chapter.book?.id}` },
    { label: `Ch. ${chapter.chapterNumber}: ${chapter.title}` }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      <Navbar onSearchClick={openSearch} subtitle="Reader Mode" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />

        {/* Chapter Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start gap-8">
            {chapter.chapterImage && (
              <img
                src={chapter.chapterImage}
                alt={chapter.title}
                className="w-32 h-32 object-cover rounded-2xl shadow-lg border-2 border-white"
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide">
                  Chapter {chapter.chapterNumber}
                </span>
                {chapter.pageRange && (
                  <span className="bg-gray-100 text-gray-600 px-4 py-1.5 rounded-full text-sm font-medium">
                    Pages: {chapter.pageRange}
                  </span>
                )}
                <button
                  onClick={toggleBookmark}
                  disabled={bookmarkLoading}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isBookmarked
                      ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  } ${bookmarkLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                >
                  {bookmarkLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill={isBookmarked ? 'currentColor' : 'none'}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  )}
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </button>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">{chapter.title}</h1>
              {chapter.description && (
                <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">{chapter.description}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-2 mt-6 text-sm font-medium text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
                  {chapter.book?.title}
                </span>
                <span className="text-gray-300">•</span>
                <span>Class {chapter.book?.class}</span>
                <span className="text-gray-300">•</span>
                <span>{chapter.book?.subject?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer Section */}
        {chapter.pdfUrl ? (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-gray-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Document Viewer
              </h2>
              <a
                href={chapter.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open in New Tab
              </a>
            </div>
            
            {/* PDF Embed */}
            <div className="relative bg-gray-100" style={{ height: '850px' }}>
              <iframe
                src={`${chapter.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                className="w-full h-full"
                title={chapter.title}
                style={{ border: 'none' }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-orange-100 p-16 text-center">
            <div className="mb-6 text-gray-300">
              <DescriptionIcon sx={{ fontSize: 64 }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No PDF Available</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              The PDF document for this chapter hasn't been uploaded yet. Please check back later or contact the administrator.
            </p>
            <button
              onClick={handleBack}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition-all shadow-lg"
            >
              Back to Chapters
            </button>
          </div>
        )}

        {/* Chapter Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="mb-3 bg-blue-50 w-12 h-12 flex items-center justify-center rounded-xl text-blue-600">
              <AutoStoriesIcon />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Book Details</h3>
            <p className="text-gray-600 font-medium">{chapter.book?.title}</p>
            <p className="text-sm text-gray-400 mt-1">
              {chapter.book?.publisher} • {chapter.book?.edition || 'Latest'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="mb-3 bg-purple-50 w-12 h-12 flex items-center justify-center rounded-xl text-purple-600">
              <LibraryBooksIcon />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Subject Info</h3>
            <p className="text-gray-600 font-medium">{chapter.book?.subject?.name}</p>
            <p className="text-sm text-gray-400 mt-1">Class {chapter.book?.class}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all">
            <div className="mb-3 bg-green-50 w-12 h-12 flex items-center justify-center rounded-xl text-green-600">
              <InsertDriveFileIcon />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">File Stats</h3>
            <p className="text-gray-600 font-medium">{chapter.pageRange || 'Pages not specified'}</p>
            {chapter.fileSize && (
              <p className="text-sm text-gray-400 mt-1">
                Size: {(chapter.fileSize / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
        </div>
      </div>

      {/* NCERT Master Bot */}
      <NCERTMasterBot 
        chapterId={chapterId}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapterNumber}
      />
    </div>
  );
};

export default ChapterView;
