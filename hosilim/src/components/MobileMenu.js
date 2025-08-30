import React from 'react';
import { useNavigate } from 'react-router-dom';

const MobileMenu = ({ isOpen, setIsOpen, activeSection, setActiveSection, userRole, setUserRole }) => {
  const navigate = useNavigate();

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/dashboard/${section}`);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
        {/* Similar content as Sidebar, with close button */}
        <div className="flex items-center justify-between h-16 border-b px-4">
          <h1 className="text-xl font-bold text-indigo-600">Meva Tizimi</h1>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-600">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Rest similar to Sidebar */}
      </div>
    </div>
  );
};

export default MobileMenu;