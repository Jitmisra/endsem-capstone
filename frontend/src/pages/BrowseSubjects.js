import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useSearch } from '../App';
import Navbar from '../components/Navbar';
import Breadcrumb from '../components/Breadcrumb';
import CalculateIcon from '@mui/icons-material/Calculate';
import ScienceIcon from '@mui/icons-material/Science';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TranslateIcon from '@mui/icons-material/Translate';
import PublicIcon from '@mui/icons-material/Public';
import BiotechIcon from '@mui/icons-material/Biotech';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import MapIcon from '@mui/icons-material/Map';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';

const BrowseSubjects = () => {
  const { classNum } = useParams();
  const navigate = useNavigate();
  const { openSearch } = useSearch();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classNum]);

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/subjects?class=${classNum}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectIcon = (name) => {
    const icons = {
      Mathematics: <CalculateIcon sx={{ fontSize: 48 }} />,
      Science: <ScienceIcon sx={{ fontSize: 48 }} />,
      English: <MenuBookIcon sx={{ fontSize: 48 }} />,
      Hindi: <TranslateIcon sx={{ fontSize: 48 }} />,
      'Social Science': <PublicIcon sx={{ fontSize: 48 }} />,
      Physics: <ScienceIcon sx={{ fontSize: 48 }} />,
      Chemistry: <BiotechIcon sx={{ fontSize: 48 }} />,
      Biology: <BiotechIcon sx={{ fontSize: 48 }} />,
      History: <HistoryEduIcon sx={{ fontSize: 48 }} />,
      Geography: <MapIcon sx={{ fontSize: 48 }} />,
      Economics: <AccountBalanceIcon sx={{ fontSize: 48 }} />,
      'Political Science': <AccountBalanceIcon sx={{ fontSize: 48 }} />,
    };
    return icons[name] || <LibraryBooksIcon sx={{ fontSize: 48 }} />;
  };

  const breadcrumbItems = [
    { label: 'Browse', href: '/browse' },
    { label: `Class ${classNum}` }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 font-sans">
      <Navbar onSearchClick={openSearch} subtitle={`Class ${classNum} • Subjects`} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-6"></div>
            <p className="text-gray-600 font-medium">Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-xl border border-orange-100 p-12">
            <div className="mb-6 text-gray-300">
              <LibraryBooksIcon sx={{ fontSize: 64 }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Subjects Found</h3>
            <p className="text-gray-600 text-lg">There are no subjects available for Class {classNum} yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => navigate(`/browse/${classNum}/${subject.id}`)}
                className="group bg-white rounded-3xl shadow-lg shadow-orange-100/50 hover:shadow-2xl hover:shadow-primary-500/20 p-8 transition-all transform hover:-translate-y-2 text-left border-2 border-transparent hover:border-primary-500 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-50 rounded-bl-full -mr-12 -mt-12 transition-all group-hover:bg-primary-100"></div>
                <div className="relative z-10">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform origin-left text-primary-600">{getSubjectIcon(subject.name)}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors">{subject.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded-lg group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                      {subject._count?.books || 0} Books
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

export default BrowseSubjects;
