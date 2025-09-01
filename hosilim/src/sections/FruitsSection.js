import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import Table from '../components/Table';
import AddFruitModal from '../components/AddFruitModal';
import API_BASE_URL from "../config";

const FruitsSection = () => {
  const [fruits, setFruits] = useState([]);
  const [filters, setFilters] = useState({ search: '', type: '', quality: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFruits = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams({ ...filters, page }).toString();
        const response = await fetch(`${API_BASE_URL}/fruits?${query}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Mevalarni olishda xato');
        const data = await response.json();
        setFruits(data.fruits || [
          { id: 1, farmer: 'Ali Valiyev', type: 'Olma', weight: 50.00, quality: '1-sifat', date: '2025-07-30', price: '250,000 so\'m' },
          { id: 2, farmer: 'Sitora Ahmedova', type: 'O\'rik', weight: 30.50, quality: '2-sifat', date: '2025-07-30', price: '91,500 so\'m' },
          { id: 3, farmer: 'Bobur Karimov', type: 'Shaftoli', weight: 45.25, quality: '1-sifat', date: '2025-07-30', price: '339,375 so\'m' },
          { id: 4, farmer: 'Gulnora Azizova', type: 'Olcha', weight: 20.00, quality: '1-sifat', date: '2025-07-30', price: '160,000 so\'m' },
        ]);
        setTotalPages(data.totalPages || 3);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFruits();
  }, [filters, page]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/fruits/${id}`, { method: 'DELETE' });
      setFruits(fruits.filter(f => f.id !== id));
    } catch (err) {
      setError('O\'chirishda xato');
    }
  };

  if (loading) return <div className="text-center py-10">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <Panel
        title="Mevalar ro'yxati"
        headerButton={
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yangi meva qo'shish
          </button>
        }
      >
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Qidirish..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="form-control"
          >
            <option value="">Barcha meva turlari</option>
            <option value="apple">Olma</option>
            <option value="apricot">O'rik</option>
            <option value="peach">Shaftoli</option>
            <option value="cherry">Olcha</option>
            <option value="sweet_cherry">Gilos</option>
          </select>
          <select
            value={filters.quality}
            onChange={(e) => setFilters({ ...filters, quality: e.target.value })}
            className="form-control"
          >
            <option value="">Barcha sifatlar</option>
            <option value="1">1-sifat</option>
            <option value="2">2-sifat</option>
            <option value="3">3-sifat</option>
          </select>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="form-control"
          />
        </div>
        <Table
          headers={['ID', 'Dehqon', 'Meva turi', 'Og\'irlik (kg)', 'Sifat', 'Sana', 'Narx', 'Amallar']}
          rows={fruits.map(f => [
            f.id,
            f.farmer,
            f.type,
            f.weight,
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${f.quality === '1-sifat' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {f.quality}
            </span>,
            f.date,
            f.price,
            <div className="flex space-x-2">
              <button className="p-1 rounded-md text-blue-600 hover:bg-blue-100">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(f.id)} className="p-1 rounded-md text-red-600 hover:bg-red-100">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>,
          ])}
        />
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">Jami: <span className="font-medium">{fruits.reduce((sum, f) => sum + f.weight, 0)} kg</span> meva</div>
          <div className="flex space-x-1">
            <button onClick={() => setPage(p => Math.max(p - 1, 1))} className="pagination-item border border-gray-300 text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`pagination-item ${page === i + 1 ? 'active' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} className="pagination-item border border-gray-300 text-gray-700 hover:bg-gray-50">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </Panel>
      <AddFruitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default React.memo(FruitsSection);