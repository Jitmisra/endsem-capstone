import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const ChapterManagement = ({ bookId, onBack }) => {
  const [chapters, setChapters] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    chapterNumber: '',
    title: '',
    description: '',
    pageRange: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchBook();
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const fetchBook = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/chapters?bookId=${bookId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChapters(response.data.chapters);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('bookId', bookId);
      formDataToSend.append('chapterNumber', formData.chapterNumber);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('pageRange', formData.pageRange);
      if (pdfFile) {
        formDataToSend.append('pdf', pdfFile);
      }

      if (editingChapter) {
        await axios.put(`${API_URL}/api/chapters/${editingChapter.id}`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });
      } else {
        await axios.post(`${API_URL}/api/chapters`, formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          },
        });
      }

      resetForm();
      fetchChapters();
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert(error.response?.data?.error || 'Failed to save chapter');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/chapters/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Failed to delete chapter');
    }
  };

  const handleEdit = (chapter) => {
    setEditingChapter(chapter);
    setFormData({
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      description: chapter.description || '',
      pageRange: chapter.pageRange || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ chapterNumber: '', title: '', description: '', pageRange: '' });
    setPdfFile(null);
    setEditingChapter(null);
    setShowForm(false);
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← Back to Books
        </button>
        {book && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900">{book.title}</h2>
            <p className="text-gray-600 mt-1">
              Class {book.class} • {book.subject?.name} • {book.publisher}
            </p>
            {book.description && (
              <p className="text-gray-700 mt-2">{book.description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Chapters ({chapters.length})</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : 'Add New Chapter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow mb-6">
          <h4 className="text-lg font-medium mb-4">
            {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Number *
              </label>
              <input
                type="number"
                value={formData.chapterNumber}
                onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Page Range (e.g., 1-25)
              </label>
              <input
                type="text"
                value={formData.pageRange}
                onChange={(e) => setFormData({ ...formData, pageRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="1-25"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Real Numbers"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="2"
                placeholder="Brief description of the chapter..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chapter PDF {editingChapter && '(Leave empty to keep current)'}
              </label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdfFile(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required={!editingChapter}
              />
            </div>
          </div>

          {uploadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : editingChapter ? 'Update Chapter' : 'Add Chapter'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ch #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pages</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PDF</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chapters.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No chapters added yet. Click "Add New Chapter" to get started.
                </td>
              </tr>
            ) : (
              chapters.map((chapter) => (
                <tr key={chapter.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{chapter.chapterNumber}</td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{chapter.title}</div>
                      {chapter.description && (
                        <div className="text-sm text-gray-500">{chapter.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chapter.pageRange || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {chapter.pdfUrl ? (
                      <a
                        href={chapter.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View PDF
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">No PDF</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {chapter._count?.notes || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleEdit(chapter)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(chapter.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChapterManagement;
