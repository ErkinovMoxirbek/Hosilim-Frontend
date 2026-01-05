import React from 'react';

const CancelledSalePage = () => {
  const data = [
    { id: 'S-0991', date: '2025-09-20', reason: 'Xaridor bekor qildi', amount: '7,200,000 so‘m' },
  ];

  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-base font-medium">Bekor qilingan sotuvlar ro‘yxati:</p>
      {data.length === 0 ? (
        <div className="text-gray-600 bg-gray-50 p-4 rounded-lg">
          Hozirda bekor qilingan sotuvlar mavjud emas.
        </div>
      ) : (
        <div className="overflow-auto rounded border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">ID</th>
                <th className="px-3 py-2 text-left font-semibold">Sana</th>
                <th className="px-3 py-2 text-left font-semibold">Sabab</th>
                <th className="px-3 py-2 text-left font-semibold">Summa</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 bg-white">
              {data.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">{r.id}</td>
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{r.reason}</td>
                  <td className="px-3 py-2">{r.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CancelledSalePage;