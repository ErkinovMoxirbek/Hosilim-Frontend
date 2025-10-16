import React, { useState } from 'react';

const NewSalePage = () => {
  const [formData, setFormData] = useState({
    farmer: '',
    product: '',
    quantity: '',
    price: '',
    payment: '',
    delivery: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // API so'rovi yuborish yoki ma'lumotlarni saqlash
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-base font-medium">Yangi sotuv formasi</p>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-50 rounded border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Fermer</label>
          <select
            name="farmer"
            value={formData.farmer}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">Fermer tanlang</option>
            <option value="farmer1">Fermer 1</option>
            <option value="farmer2">Fermer 2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mahsulot</label>
          <input
            type="text"
            name="product"
            value={formData.product}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Mahsulot nomini kiriting"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Miqdor</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Miqdor (kg)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Narx</label>
          <input
            type="text"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Narx (so‘m)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">To‘lov usuli</label>
          <select
            name="payment"
            value={formData.payment}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="">To‘lov usulini tanlang</option>
            <option value="cash">Naqd</option>
            <option value="card">Karta</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Yetkazish ma’lumotlari</label>
          <input
            type="text"
            name="delivery"
            value={formData.delivery}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            placeholder="Yetkazish manzili"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Saqlash
        </button>
      </form>
    </div>
  );
};

export default NewSalePage;