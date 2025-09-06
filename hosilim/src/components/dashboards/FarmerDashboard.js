import React, { useState, useEffect } from 'react';
import { 
  Apple, ShoppingCart, DollarSign, Package, Plus, 
  Star, Check, X, TrendingUp, Eye, AlertCircle
} from 'lucide-react';
import API_BASE_URL from "../../config";

// AddProductModal komponenti
const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [formData, setFormData] = useState({
    fruitName: '',
    fruitDescription: '',
    price: '',
    quantityUnit: 'KG',
    quantity: '',
    productQuality: 'FIRST'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const productQualityOptions = [
    { value: 'FIRST', label: '1-sifat' },
    { value: 'SECOND', label: '2-sifat' },
    { value: 'THIRD', label: '3-sifat' }
  ];

  const quantityUnitOptions = [
    { value: 'KG', label: 'Kilogram' },
    { value: 'TON', label: 'Tonna' },
    { value: 'PIECE', label: 'Dona' }
  ];

  const fruitOptions = [
    'Olma', 'O\'rik', 'Shaftoli', 'Olcha', 'Gilos', 'Uzum', 
    'Nok', 'Behi', 'Anjir', 'Pomidor', 'Bodring', 'Karam'
  ];

  const resetForm = () => {
    setFormData({
      fruitName: '',
      fruitDescription: '',
      price: '',
      quantityUnit: 'KG',
      quantity: '',
      productQuality: 'FIRST'
    });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.fruitName.trim() || !formData.price || !formData.quantity) {
      setError('Barcha majburiy maydonlarni to\'ldiring');
      setLoading(false);
      return;
    }

    if (parseFloat(formData.price) <= 0 || parseFloat(formData.quantity) <= 0) {
      setError('Narx va miqdor musbat son bo\'lishi kerak');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          quantity: parseFloat(formData.quantity)
        })
      });

      if (response.ok) {
        alert('Mahsulot muvaffaqiyatli qo\'shildi!');
        onProductAdded && onProductAdded();
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Product creation error:', error);
      setError('Tarmoq xatosi yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Yangi Mahsulot</h3>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 lg:p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Meva turi *</label>
              <select
                value={formData.fruitName}
                onChange={(e) => setFormData(prev => ({ ...prev, fruitName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Tanlang</option>
                {fruitOptions.map((fruit) => (
                  <option key={fruit} value={fruit}>{fruit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tavsif</label>
              <textarea
                value={formData.fruitDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, fruitDescription: e.target.value }))}
                placeholder="Qisqacha tavsif..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Miqdor *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birlik</label>
                <select
                  value={formData.quantityUnit}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantityUnit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {quantityUnitOptions.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Narx (so'm/kg) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0"
                step="100"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sifat</label>
              <select
                value={formData.productQuality}
                onChange={(e) => setFormData(prev => ({ ...prev, productQuality: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {productQualityOptions.map((quality) => (
                  <option key={quality.value} value={quality.value}>{quality.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={loading}
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Qo'shilmoqda...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Qo'shish
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Asosiy FarmerDashboard komponenti
const FarmerDashboard = () => {
  const [stats, setStats] = useState({
    availableProducts: 0,
    soldProducts: 0,
    totalIncome: 0,
    activeListings: 0
  });
  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Statistika
      const statsResponse = await fetch(`${API_BASE_URL}/farmer/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // Mahsulotlar
      const productsResponse = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.data || []);
      }

      // Takliflar
      const offersResponse = await fetch(`${API_BASE_URL}/farmer/offers?status=pending&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        setOffers(offersData.data || []);
      }

    } catch (error) {
      console.error('Farmer data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/farmer/offers/${offerId}/accept`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setOffers(offers.filter(offer => offer.id !== offerId));
        alert('Taklif qabul qilindi!');
        fetchFarmerData();
      }
    } catch (error) {
      console.error('Accept offer error:', error);
    }
  };

  const handleRejectOffer = async (offerId) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/farmer/offers/${offerId}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setOffers(offers.filter(offer => offer.id !== offerId));
        alert('Taklif rad etildi');
      }
    } catch (error) {
      console.error('Reject offer error:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Mahsulotni o\'chirishga ishonchingiz komilmi?')) return;
    
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        setProducts(products.filter(product => product.id !== productId));
        alert('Mahsulot muvaffaqiyatli o\'chirildi');
      }
    } catch (error) {
      console.error('Delete product error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        {/* Header - telefon uchun kichikroq */}
        <div className="mb-4 lg:mb-8">
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">Mahsulotlar va sotuvlar boshqaruvi</p>
        </div>

        {/* Statistika - telefon uchun 2x2 grid */}
        <div className="grid grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-8">
          <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 lg:p-3 bg-green-100 rounded-lg">
                <Apple className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-2 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Mavjud</p>
                <p className="text-sm lg:text-2xl font-bold text-gray-900">{stats.availableProducts} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 lg:p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-4 w-4 lg:h-6 lg:w-6 text-blue-600" />
              </div>
              <div className="ml-2 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Sotilgan</p>
                <p className="text-sm lg:text-2xl font-bold text-gray-900">{stats.soldProducts} kg</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 lg:p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-4 w-4 lg:h-6 lg:w-6 text-purple-600" />
              </div>
              <div className="ml-2 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Daromad</p>
                <p className="text-sm lg:text-2xl font-bold text-gray-900">
                  {stats.totalIncome > 1000000 
                    ? `${(stats.totalIncome / 1000000).toFixed(1)}M` 
                    : stats.totalIncome > 1000
                    ? `${(stats.totalIncome / 1000).toFixed(0)}k`
                    : stats.totalIncome?.toLocaleString()
                  } so'm
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 lg:p-3 bg-yellow-100 rounded-lg">
                <Package className="h-4 w-4 lg:h-6 lg:w-6 text-yellow-600" />
              </div>
              <div className="ml-2 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">E'lonlar</p>
                <p className="text-sm lg:text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Mahsulotlar - telefon uchun optimallashtirilgan */}
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200">
            <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Mahsulotlarim</h3>
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-green-600 text-white px-2 lg:px-4 py-1.5 lg:py-2 rounded-lg flex items-center text-xs lg:text-sm hover:bg-green-700 transition-colors"
              >
                <Plus className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                <span className="hidden sm:inline">Qo'shish</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>
            <div className="p-3 lg:p-6">
              <div className="space-y-3">
                {products.map((product) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-medium text-sm lg:text-base text-gray-900 truncate">
                          {product.fruitName}
                        </p>
                        <div className="text-xs lg:text-sm text-gray-600 space-y-0.5">
                          <p>{product.quantity} kg - {product.quality}</p>
                          <p className="font-medium text-gray-900">
                            {product.pricePerKg?.toLocaleString()} so'm/kg
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${
                        !product.isSold ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {!product.isSold ? 'Mavjud' : 'Sotildi'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 p-1">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {products.length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <Apple className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-2 lg:mb-4 opacity-50" />
                    <p className="text-sm">Hozircha mahsulotlar yo'q</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Takliflar - telefon uchun optimallashtirilgan */}
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200">
            <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Takliflar</h3>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {offers.length} yangi
              </span>
            </div>
            <div className="p-3 lg:p-6">
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-medium text-sm lg:text-base text-gray-900 truncate">
                          {offer.broker?.name || offer.broker?.phone}
                        </p>
                        <div className="flex items-center mt-1">
                          <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-current" />
                          <span className="text-xs lg:text-sm text-gray-600 ml-1">{offer.broker?.rating || 4.5}</span>
                        </div>
                        <div className="text-xs lg:text-sm text-gray-600 mt-1 space-y-0.5">
                          <p>{offer.fruitType} - {offer.quantity}kg</p>
                          <p className="font-medium text-gray-900">
                            {offer.pricePerKg?.toLocaleString()} so'm/kg
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="bg-green-600 text-white px-2 py-1.5 rounded-md text-xs flex-1 hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                        <span className="hidden sm:inline">Qabul</span>
                        <span className="sm:hidden">✓</span>
                      </button>
                      <button 
                        onClick={() => handleRejectOffer(offer.id)}
                        className="bg-gray-100 text-gray-700 px-2 py-1.5 rounded-md text-xs flex-1 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <X className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                        <span className="hidden sm:inline">Rad</span>
                        <span className="sm:hidden">✕</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {offers.length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <ShoppingCart className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-2 lg:mb-4 opacity-50" />
                    <p className="text-sm">Yangi takliflar yo'q</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        onProductAdded={fetchFarmerData}
      />
    </>
  );
};

export default FarmerDashboard;