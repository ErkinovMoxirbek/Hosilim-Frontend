import React from 'react';

const StatCard = ({ icon, title, value, color }) => {
  return (
    <div className="stat-card">
      <div className="flex items-center">
        <div className={`stat-icon ${color} text-white`}>
          {icon}
        </div>
        <div className="ml-5">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;