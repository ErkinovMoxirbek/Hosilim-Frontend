import React, { useState, useEffect } from 'react';
import Panel from '../components/Panel';
import Table from '../components/Table';
import StatCard from '../components/StatCard';

const ReportsSection = () => {
  const [reportForm, setReportForm] = useState({ type: 'daily', date: '', farmer: '', fruitType: '' });
  const [savedReports, setSavedReports] = useState([]);
  const [reportResult, setReportResult] = useState({ stats: { totalWeight: 0, totalSum: 0, farmersCount: 0 }, data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.hosilim.uz/reports', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Hisobotlarni olishda xato');
        const data = await response.json();
        setSavedReports(data.savedReports || [
          { id: 1, farmer: 'Ali Valiyev', date: '2025-07-30', totalWeight: '50.00 kg', totalSum: '250,000 so\'m' },
          { id: 2, farmer: 'Sitora Ahmedova', date: '2025-07-30', totalWeight: '30.50 kg', totalSum: '91,500 so\'m' },
          { id: 3, farmer: 'Barcha dehqonlar', date: '2025-07-30', totalWeight: '156.00 kg', totalSum: '1,250,000 so\'m' },
        ]);
        setReportResult(data.reportResult || {
          stats: { totalWeight: 156.00, totalSum: 1250000, farmersCount: 4 },
          data: [
            { farmer: 'Ali Valiyev', type: 'Olma', weight: 50.00, quality: '1-sifat', price: '250,000 so\'m' },
            { farmer: 'Sitora Ahmedova', type: 'O\'rik', weight: 30.50, quality: '2-sifat', price: '91,500 so\'m' },
            { farmer: 'Bobur Karimov', type: 'Shaftoli', weight: 45.25, quality: '1-sifat', price: '339,375 so\'m' },
            { farmer: 'Gulnora Azizova', type: 'Olcha', weight: 20.00, quality: '1-sifat', price: '160,000 so\'m' },
            { farmer: 'Gulnora Azizova', type: 'Gilos', weight: 10.25, quality: '1-sifat', price: '123,000 so\'m' },
          ],
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    try {
      const response = await fetch('https://api.hosilim.uz/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportForm),
      });
      if (!response.ok) throw new Error('Hisobot yaratishda xato');
      const data = await response.json();
      setReportResult(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDownloadReport = async (id) => {
    try {
      const response = await fetch(`https://api.hosilim.uz/reports/download/${id}`);
      // Handle file download (e.g., create a blob and trigger download)
    } catch (err) {
      setError('Yuklab olishda xato');
    }
  };

  if (loading) return <div className="text-center py-10">Yuklanmoqda...</div>;
  if (error) return <div className="text-red-600 text-center py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Hisobot yaratish">
          <form>
            <div className="form-group">
              <label className="form-label">Hisobot turi</label>
              <select
                value={reportForm.type}
                onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}
                className="form-control"
              >
                <option value="daily">Kunlik</option>
                <option value="weekly">Haftalik</option>
                <option value="monthly">Oylik</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sana</label>
              <input
                type="date"
                value={reportForm.date}
                onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Dehqon (ixtiyoriy)</label>
              <select
                value={reportForm.farmer}
                onChange={(e) => setReportForm({ ...reportForm, farmer: e.target.value })}
                className="form-control"
              >
                <option value="">Barcha dehqonlar</option>
                <option value="1">Ali Valiyev</option>
                <option value="2">Sitora Ahmedova</option>
                <option value="3">Bobur Karimov</option>
                <option value="4">Gulnora Azizova</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Meva turi (ixtiyoriy)</label>
              <select
                value={reportForm.fruitType}
                onChange={(e) => setReportForm({ ...reportForm, fruitType: e.target.value })}
                className="form-control"
              >
                <option value="">Barcha meva turlari</option>
                <option value="apple">Olma</option>
                <option value="apricot">O'rik</option>
                <option value="peach">Shaftoli</option>
                <option value="cherry">Olcha</option>
                <option value="sweet_cherry">Gilos</option>
              </select>
            </div>
            <button type="button" onClick={handleGenerateReport} className="btn btn-primary w-full flex items-center justify-center">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Hisobot yaratish
            </button>
          </form>
        </Panel>
        <Panel title="Saqlangan hisobotlar">
          <Table
            headers={['ID', 'Dehqon', 'Sana', 'Jami og\'irlik', 'Jami summa', 'Amallar']}
            rows={savedReports.map(r => [
              r.id,
              r.farmer,
              r.date,
              r.totalWeight,
              r.totalSum,
              <div className="flex space-x-2">
                <button className="p-1 rounded-md text-blue-600 hover:bg-blue-100">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button onClick={() => handleDownloadReport(r.id)} className="p-1 rounded-md text-green-600 hover:bg-green-100">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
              </div>,
            ])}
          />
        </Panel>
      </div>
      <Panel title="Hisobot natijasi">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Jami og'irlik" value={`${reportResult.stats.totalWeight} kg`} color="bg-indigo-100 text-indigo-600" />
          <StatCard title="Jami summa" value={`${reportResult.stats.totalSum.toLocaleString()} so'm`} color="bg-green-100 text-green-600" />
          <StatCard title="Dehqonlar soni" value={reportResult.stats.farmersCount} color="bg-yellow-100 text-yellow-600" />
        </div>
        <Table
          headers={['Dehqon', 'Meva turi', 'Og\'irlik (kg)', 'Sifat', 'Narx']}
          rows={reportResult.data.map(r => [
            r.farmer,
            r.type,
            r.weight,
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${r.quality === '1-sifat' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {r.quality}
            </span>,
            r.price,
          ])}
        />
        <div className="mt-6 flex justify-end">
          <button className="btn btn-primary flex items-center bg-green-600 hover:bg-green-700">
            <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Hisobotni yuklab olish
          </button>
        </div>
      </Panel>
    </div>
  );
};

export default React.memo(ReportsSection);