import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Panel from '../components/Panel';
import Table from '../components/Table';
import AddFruitModal from '../components/AddFruitModal';
import API_BASE_URL from "../config";


const DashboardSection = () => {
  const [stats, setStats] = useState({
    farmers: 0,
    fruitsToday: 0,
    sumToday: 0,
    fruitTypes: 0,
  });
  const [fruitsToday, setFruitsToday] = useState([]);
  const [recentFruits, setRecentFruits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Ma\'lumotlarni olishda xato');
        const data = await response.json();
        setStats({
          farmers: data.farmers || 24,
          fruitsToday: data.fruitsToday || 156,
          sumToday: data.sumToday || 1250000,
          fruitTypes: data.fruitTypes || 5,
        });
        setFruitsToday(data.fruitsTodayData || [
          { type: 'Olma', weight: 50.00, price: '5,000 so\'m/kg' },
          { type: 'O\'rik', weight: 30.50, price: '6,000 so\'m/kg' },
          { type: 'Shaftoli', weight: 45.25, price: '7,500 so\'m/kg' },
          { type: 'Olcha', weight: 20.00, price: '8,000 so\'m/kg' },
          { type: 'Gilos', weight: 10.25, price: '12,000 so\'m/kg' },
        ]);
        setRecentFruits(data.recentFruits || [
          { farmer: 'Ali Valiyev', type: 'Olma', weight: '50.00 kg', quality: '1-sifat', price: '250,000 so\'m' },
          { farmer: 'Sitora Ahmedova', type: 'O\'rik', weight: '30.50 kg', quality: '2-sifat', price: '91,500 so\'m' },
          { farmer: 'Bobur Karimov', type: 'Shaftoli', weight: '45.25 kg', quality: '1-sifat', price: '339,375 so\'m' },
          { farmer: 'Gulnora Azizova', type: 'Olcha', weight: '20.00 kg', quality: '1-sifat', price: '160,000 so\'m' },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-10">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>}
          title="Dehqonlar"
          value={stats.farmers}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>}
          title="Bugungi mevalar"
          value={`${stats.fruitsToday} kg`}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          title="Bugungi summa"
          value={`${stats.sumToday.toLocaleString()} so'm`}
          color="bg-yellow-100 text-yellow-600"
        />
        <StatCard
          icon={<svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>}
          title="Meva turlari"
          value={stats.fruitTypes}
          color="bg-red-100 text-red-600"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title="Bugungi mevalar">
          <Table
            headers={['Meva turi', 'Miqdori (kg)', 'O\'rtacha narx']}
            rows={fruitsToday.map(f => [f.type, f.weight, f.price])}
          />
        </Panel>
        <Panel
          title="So'nggi qabul qilingan mevalar"
          headerButton={
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Yangi meva qo'shish
            </button>
          }
        >
          <Table
            headers={['Dehqon', 'Meva turi', 'Og\'irlik', 'Sifat', 'Narx']}
            rows={recentFruits.map(f => [
              f.farmer,
              f.type,
              f.weight,
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${f.quality === '1-sifat' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {f.quality}
              </span>,
              f.price,
            ])}
          />
        </Panel>
      </div>
      <AddFruitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default React.memo(DashboardSection);