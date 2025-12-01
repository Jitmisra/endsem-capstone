import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-sm font-medium mb-6 flex-wrap">
      <Link 
        to="/" 
        className="flex items-center gap-1.5 text-gray-500 hover:text-primary-600 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span>Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          
          {item.href ? (
            <Link 
              to={item.href}
              className="text-gray-500 hover:text-primary-600 transition-colors flex items-center gap-1.5"
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className="max-w-[150px] truncate">{item.label}</span>
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span className="max-w-[200px] truncate">{item.label}</span>
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
