import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import Table from '../components/Table';
import AddFarmerModal from '../components/AddFarmerModal';
import API_BASE_URL from "../config";

const FarmersSection = () => {
  const [farmers, setFarmers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/farmers?page=${page}&search=${search}`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Dehqonlarni olishda xato');
        const data = await response.json();
        setFarmers(data.farmers || [
          { id: 1, name: 'Ali Valiyev', phone: '+998901234567', village: 'Qo\'qon', createdAt: '2025-07-30' },
          { id: 2, name: 'Sitora Ahmedova', phone: '+998909876543', village: 'Marg\'ilon', createdAt: '2025-07-30' },
          { id: 3, name: 'Bobur Karimov', phone: '+998912345678', village: 'Andijon', createdAt: '2025-07-29' },
          { id: 4, name: 'Gulnora Azizova', phone: '+998987654321', village: 'Namangan', createdAt: '2025-07-28' },
        ]);
        setTotalPages(data.totalPages || 3);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFarmers();
  }, [page, search]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/farmers/${id}`, { method: 'DELETE' });
      setFarmers(farmers.filter(f => f.id !== id));
    } catch (err) {
      setError('O\'chirishda xato');
    }
  };

  if (loading) return <div className="text-center py-10">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <Panel
        title="Dehqonlar ro'yxati"
        headerButton={
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yangi dehqon qo'shish
          </button>
        }
      >
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-1/3 pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <Table
          headers={['ID', 'Ism', 'Telefon', 'Qishloq', 'Ro\'yxatdan o\'tgan sana', 'Amallar']}
          rows={farmers.map(f => [
            f.id,
            f.name,
            f.phone,
            f.village,
            f.createdAt,
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
          <div className="text-sm text-gray-700">Jami: <span className="font-medium">{farmers.length}</span> ta dehqon</div>
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
      <AddFarmerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default React.memo(FarmersSection);