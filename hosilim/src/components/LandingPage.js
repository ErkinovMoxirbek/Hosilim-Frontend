import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-indigo-600 mb-4">Meva Tizimi</h1>
        <p className="text-lg text-gray-600 mb-8">Farg'ona meva tizimi platformasiga xush kelibsiz!</p>
        <button
          onClick={() => navigate('/login')}
          className="btn btn-primary px-6 py-3 text-lg"
        >
          Boshlash
        </button>
      </div>
    </div>
  );
};

export default LandingPage;