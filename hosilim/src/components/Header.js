import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const Header = ({ setMobileMenuOpen }) => {
  const [currentDate, setCurrentDate] = useState('');
  const location = useLocation();

  // Map routes to page titles
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'Bosh sahifa';
    if (path === '/dashboard/farmers') return 'Dehqonlar';
    if (path === '/dashboard/fruits') return 'Mevalar';
    if (path === '/dashboard/prices') return 'Narxlar';
    if (path === '/dashboard/reports') return 'Hisobotlar';
    return 'Bosh sahifa'; // Default
  };

  useEffect(() => {
    // Set current date in Uzbek format
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(today.toLocaleDateString('uz-UZ', options));
  }, []);

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10 md:flex items-center justify-between hidden h-16 px-6">
      <div className="flex items-center">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-800" id="page-title">
          {getPageTitle()}
        </h2>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <button className="flex items-center text-gray-500 hover:text-gray-700 focus:outline-none">
            <span className="mr-2 text-sm">Bugun: {currentDate}</span>
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;