import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

// All classes for quick access
const ALL_CLASSES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ books: [], subjects: [], classes: [], chapters: [] });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiAnswer, setShowAiAnswer] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input and clear query when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults({ books: [], subjects: [], classes: [], chapters: [] });
      setSelectedIndex(0);
      setAiAnswer('');
      setShowAiAnswer(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Check if query looks like a question
  const isQuestion = (text) => {
    const questionWords = ['what', 'why', 'how', 'when', 'where', 'who', 'which', 'explain', 'define', 'describe', 'tell', 'can you', 'is', 'are', 'do', 'does', 'will', 'would', 'could', 'should'];
    const lowerText = text.toLowerCase().trim();
    return questionWords.some(word => lowerText.startsWith(word)) || text.includes('?');
  };

  // Fetch AI answer for questions
  const fetchAiAnswer = async (question) => {
    setAiLoading(true);
    setShowAiAnswer(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/chatbot/quick-answer`,
        { question },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAiAnswer(response.data.answer);
    } catch (error) {
      console.error('AI answer error:', error);
      setAiAnswer('');
      setShowAiAnswer(false);
    } finally {
      setAiLoading(false);
    }
  };

  // Search functionality with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults({ books: [], subjects: [], classes: [], chapters: [] });
      setSelectedIndex(0);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const queryLower = query.toLowerCase();
        
        // Search classes by number
        const matchedClasses = ALL_CLASSES.filter(c => 
          `class ${c}`.includes(queryLower) || 
          `${c}`.includes(query) ||
          (queryLower.includes('class') && `${c}`.includes(query.replace(/class\s*/i, '')))
        ).slice(0, 4);

        // Search books
        let books = [];
        try {
          const booksRes = await axios.get(`${API_URL}/api/books?search=${encodeURIComponent(query)}&limit=5`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          books = booksRes.data?.books || [];
        } catch (e) {
          console.log('Books search failed:', e);
        }

        // Search subjects
        let filteredSubjects = [];
        try {
          const subjectsRes = await axios.get(`${API_URL}/api/subjects`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const subjectsData = subjectsRes.data?.subjects || [];
          filteredSubjects = subjectsData.filter(subject => 
            subject.name.toLowerCase().includes(queryLower)
          ).slice(0, 5);
        } catch (e) {
          console.log('Subjects search failed:', e);
        }

        // Search chapters
        let chapters = [];
        try {
          const chaptersRes = await axios.get(`${API_URL}/api/chapters?search=${encodeURIComponent(query)}&limit=6`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          chapters = chaptersRes.data?.chapters || chaptersRes.data || [];
        } catch (e) {
          console.log('Chapters search failed:', e);
        }

        setResults({
          classes: matchedClasses,
          subjects: filteredSubjects,
          books: books,
          chapters: chapters,
        });
        setSelectedIndex(0);

        // If it looks like a question and no results, fetch AI answer
        if (isQuestion(query) && matchedClasses.length === 0 && filteredSubjects.length === 0 && books.length === 0 && chapters.length === 0) {
          fetchAiAnswer(query);
        } else if (isQuestion(query)) {
          // Also show AI for questions even with results
          fetchAiAnswer(query);
        } else {
          setShowAiAnswer(false);
          setAiAnswer('');
        }
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Get all results as a flat array for keyboard navigation
  const getAllResults = () => {
    const all = [];
    results.classes.forEach(c => all.push({ type: 'class', item: c }));
    results.subjects.forEach(s => all.push({ type: 'subject', item: s }));
    results.books.forEach(b => all.push({ type: 'book', item: b }));
    results.chapters.forEach(ch => all.push({ type: 'chapter', item: ch }));
    return all;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      const allResults = getAllResults();
      const totalResults = allResults.length;

      if (totalResults === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalResults);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalResults) % totalResults);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected) {
          handleResultClick(selected.type, selected.item);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, results, onClose]);

  const handleResultClick = (type, item) => {
    setQuery('');
    onClose();
    
    setTimeout(() => {
      if (type === 'book') {
        navigate(`/book/${item.id}`);
      } else if (type === 'subject') {
        navigate(`/browse/${item.class}/${item.id}`);
      } else if (type === 'class') {
        navigate(`/browse/${item}`);
      } else if (type === 'chapter') {
        navigate(`/chapter/${item.id}`);
      }
    }, 100);
  };

  if (!isOpen) return null;

  const allResults = getAllResults();
  const totalResults = allResults.length;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Search Modal */}
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slideDown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            autoFocus
          />
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-600 border-t-transparent"></div>
          )}
          <kbd className="hidden sm:block px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-gray-300">
                <SearchIcon sx={{ fontSize: 48 }} />
              </div>
              <p className="text-gray-600 font-medium">Search or ask anything...</p>
              <p className="text-gray-400 text-sm mt-2">Try "Class 10", "Mathematics", or ask "What is photosynthesis?"</p>
            </div>
          ) : totalResults === 0 && !loading && !showAiAnswer ? (
            <div className="px-6 py-12 text-center">
              <div className="mb-4 text-gray-300">
                <SentimentDissatisfiedIcon sx={{ fontSize: 48 }} />
              </div>
              <p className="text-gray-900 font-bold text-lg mb-1">No results found</p>
              <p className="text-gray-500">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="py-2">
              {/* AI Answer Section */}
              {showAiAnswer && (
                <div className="mb-4 mx-4">
                  <div className="bg-gradient-to-r from-primary-50 to-orange-50 rounded-2xl p-4 border border-primary-100">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-500 rounded-xl flex items-center justify-center text-white shrink-0">
                        <SmartToyIcon sx={{ fontSize: 20 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-gray-900 text-sm">NCERT Master Bot</span>
                          <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AutoAwesomeIcon sx={{ fontSize: 12 }} /> AI Answer
                          </span>
                        </div>
                        {aiLoading ? (
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span>Thinking...</span>
                          </div>
                        ) : (
                          <p className="text-gray-700 text-sm leading-relaxed">{aiAnswer}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Classes Section */}
              {results.classes.length > 0 && (
                <div className="mb-2">
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Classes</h3>
                  </div>
                  {results.classes.map((classNum, index) => {
                    const globalIndex = index;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={classNum}
                        onClick={() => handleResultClick('class', classNum)}
                        className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${
                          isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                          {classNum}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-gray-900">Class {classNum}</div>
                          <div className="text-sm text-gray-500">Browse all subjects</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Subjects Section */}
              {results.subjects.length > 0 && (
                <div className="mb-2">
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Subjects</h3>
                  </div>
                  {results.subjects.map((subject, index) => {
                    const globalIndex = results.classes.length + index;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={subject.id}
                        onClick={() => handleResultClick('subject', subject)}
                        className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${
                          isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {subject.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-bold text-gray-900">{subject.name}</div>
                          <div className="text-sm text-gray-500">Class {subject.class} • {subject._count?.books || 0} books</div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Books Section */}
              {results.books.length > 0 && (
                <div className="mb-2">
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Books</h3>
                  </div>
                  {results.books.map((book, index) => {
                    const globalIndex = results.classes.length + results.subjects.length + index;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={book.id}
                        onClick={() => handleResultClick('book', book)}
                        className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${
                          isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        {book.coverImage ? (
                          <img 
                            src={book.coverImage} 
                            alt={book.title} 
                            className="w-12 h-12 object-cover rounded-xl shrink-0 shadow-md"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shrink-0 flex items-center justify-center text-white shadow-md">
                            <MenuBookIcon />
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-bold text-gray-900 truncate">{book.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>Class {book.class}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <span>{book.subject?.name || 'Unknown Subject'}</span>
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Chapters Section */}
              {results.chapters.length > 0 && (
                <div className="mb-2">
                  <div className="px-6 py-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Chapters</h3>
                  </div>
                  {results.chapters.map((chapter, index) => {
                    const globalIndex = results.classes.length + results.subjects.length + results.books.length + index;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                      <button
                        key={chapter.id}
                        onClick={() => handleResultClick('chapter', chapter)}
                        className={`w-full flex items-center gap-4 px-6 py-3 transition-all ${
                          isSelected ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-gray-50 border-l-4 border-transparent'
                        }`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shrink-0 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                          {chapter.chapterNumber || '#'}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-bold text-gray-900 truncate">{chapter.title}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span>{chapter.book?.title || 'Unknown Book'}</span>
                            {chapter.book?.class && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                <span>Class {chapter.book.class}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSelected ? 'text-primary-600' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white rounded border border-gray-200 font-semibold">↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white rounded border border-gray-200 font-semibold">↵</kbd>
              <span>Open</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-2 py-1 bg-white rounded border border-gray-200 font-semibold">esc</kbd>
              <span>Close</span>
            </div>
          </div>
          {totalResults > 0 && <div className="font-medium text-primary-600">{totalResults} results</div>}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
