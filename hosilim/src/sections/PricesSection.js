import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import Table from '../components/Table';
import AddPriceModal from '../components/AddPriceModal';
import API_BASE_URL from "../config";

const PricesSection = () => {
  const [prices, setPrices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/prices`, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Narxlarni olishda xato');
        const data = await response.json();
        setPrices(data.prices || [
          { id: 1, type: 'Olma', quality: '1-sifat', pricePerKg: 5000 },
          { id: 2, type: 'Olma', quality: '2-sifat', pricePerKg: 3000 },
          { id: 3, type: 'O\'rik', quality: '1-sifat', pricePerKg: 6000 },
          { id: 4, type: 'O\'rik', quality: '2-sifat', pricePerKg: 4000 },
          { id: 5, type: 'Shaftoli', quality: '1-sifat', pricePerKg: 7500 },
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_BASE_URL}/prices/${id}`, { method: 'DELETE' });
      setPrices(prices.filter(p => p.id !== id));
    } catch (err) {
      setError('O\'chirishda xato');
    }
  };

  if (loading) return <div className="text-center py-10">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <Panel
        title="Narxlar ro'yxati"
        headerButton={
          <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Yangi narx qo'shish
          </button>
        }
      >
        <Table
          headers={['ID', 'Meva turi', 'Sifat', 'Narx (so\'m/kg)', 'Amallar']}
          rows={prices.map(p => [
            p.id,
            p.type,
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${p.quality === '1-sifat' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {p.quality}
            </span>,
            p.pricePerKg.toLocaleString(),
            <div className="flex space-x-2">
              <button className="p-1 rounded-md text-blue-600 hover:bg-blue-100">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button onClick={() => handleDelete(p.id)} className="p-1 rounded-md text-red-600 hover:bg-red-100">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>,
          ])}
        />
      </Panel>
      <AddPriceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default React.memo(PricesSection);