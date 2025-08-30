import React from 'react';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({ activeSection, setActiveSection, userRole, setUserRole }) => {
  const navigate = useNavigate();

  const handleSectionChange = (section) => {
    setActiveSection(section);
    navigate(`/dashboard/${section}`);
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-indigo-600">Meva Tizimi</h1>
      </div>
      <div className="overflow-y-auto flex-grow">
        <nav className="px-2 py-4">
          <div className="mb-6 px-4">
            <label className="form-label">Foydalanuvchi turi:</label>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="form-control"
            >
              <option value="farmer">Dehqon</option>
              <option value="collector">Punktchi</option>
              <option value="accountant">Buxgalter</option>
            </select>
          </div>
          <div className="space-y-1">
            <a
              onClick={() => handleSectionChange('')}
              className={`sidebar-item flex items-center px-4 py-3 text-sm font-medium rounded-md ${activeSection === '' ? 'active' : 'text-gray-700 hover:bg-gray-100'}`}
              href="#"
            >
              {/* SVG and text for Bosh sahifa */}
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Bosh sahifa
            </a>
            {/* Similar for other items: farmers, fruits, prices, reports */}
            <a
              onClick={() => handleSectionChange('farmers')}
              className={`sidebar-item flex items-center px-4 py-3 text-sm font-medium rounded-md ${activeSection === 'farmers' ? 'active' : 'text-gray-700 hover:bg-gray-100'}`}
              href="#"
            >
              <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Dehqonlar
            </a>
            {/* Add the other links similarly */}
          </div>
        </nav>
      </div>
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">A</div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Anvar Qodirov</p>
            <p className="text-xs text-gray-500">{userRole === 'farmer' ? 'Dehqon' : (userRole === 'collector' ? 'Punktchi' : 'Buxgalter')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;