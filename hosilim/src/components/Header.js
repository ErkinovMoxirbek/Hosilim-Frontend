import React from 'react';

const Header = ({ userType, userName }) => {
  return (
    <header className="header">
      <div className="logo">Meva Tizimi</div>
      <div className="user-info">
        <span>Foydalanuvchi turi: {userType}</span>
        <div className="user-profile">
          <span>A</span>
          <div>
            <p>{userName}</p>
            <p>Punktchi</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;