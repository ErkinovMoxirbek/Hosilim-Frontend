import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul>
        <li><Link to="/">Bosh sahifa</Link></li>
      </ul>
    </nav>
  );
};

export default Sidebar;