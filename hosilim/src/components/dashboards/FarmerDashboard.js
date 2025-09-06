import React, { useState, useEffect } from 'react';
import { 
  Apple, ShoppingCart, DollarSign, Package, Plus, 
  Star, Check, X, TrendingUp, Eye 
} from 'lucide-react';
import API_BASE_URL from "../../config";

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

  useEffect(() => {
    fetchFarmerData();
  }, []);

  const fetchFarmerData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      
      // Farmer statistikasi
      const statsResponse = await fetch(`${API_BASE_URL}/farmer/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Mening mahsulotlarim
      const productsResponse = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.data);
      }

      // Brokerlardan takliflar
      const offersResponse = await fetch(`${API_BASE_URL}/farmer/offers?status=pending&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (offersResponse.ok) {
        const offersData = await offersResponse.json();
        setOffers(offersData.data);
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
        fetchFarmerData(); // Ma'lumotlarni yangilash
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
    <div className="p-4 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
        <p className="text-gray-600 mt-1">Mahsulotlar va sotuvlar boshqaruvi</p>
      </div>

      {/* Statistika */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
              <Apple className="h-5 w-5 lg:h-6 lg:w-6 text-green-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Mavjud Mahsulot</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.availableProducts} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Sotilgan</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.soldProducts} kg</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-5 w-5 lg:h-6 lg:w-6 text-purple-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Umumiy Daromad</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.totalIncome?.toLocaleString()} so'm</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 lg:p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
              <Package className="h-5 w-5 lg:h-6 lg:w-6 text-yellow-600" />
            </div>
            <div className="ml-3 lg:ml-4">
              <p className="text-xs lg:text-sm text-gray-600">Faol E'lonlar</p>
              <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.activeListings}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mening mahsulotlarim */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Mening Mahsulotlarim</h3>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center text-sm">
              <Plus className="w-4 h-4 mr-2" />
              Qo'shish
            </button>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{product.fruitType}</p>
                      <p className="text-sm text-gray-600">Miqdor: {product.quantity} kg</p>
                      <p className="text-sm text-gray-600">Sifat: {product.quality}</p>
                      <p className="text-sm text-gray-600">Narx: {product.pricePerKg?.toLocaleString()} so'm/kg</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        product.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                        product.status === 'SOLD' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {product.status === 'AVAILABLE' ? 'Mavjud' :
                         product.status === 'SOLD' ? 'Sotildi' : 'Noaniq'}
                      </span>
                    </div>
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
                <div className="text-center py-8 text-gray-500">
                  <Apple className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Hozircha mahsulotlar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Brokerlardan takliflar */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Brokerlardan Takliflar</h3>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              {offers.length} yangi
            </span>
          </div>
          <div className="p-4 lg:p-6">
            <div className="space-y-4">
              {offers.map((offer) => (
                <div key={offer.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{offer.broker?.name || offer.broker?.phone}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{offer.broker?.rating || 4.5}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{offer.fruitType} - {offer.quantity}kg</p>
                      <p className="text-sm text-gray-600">Taklif narx: {offer.pricePerKg?.toLocaleString()} so'm/kg</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleAcceptOffer(offer.id)}
                      className="bg-green-600 text-white px-3 py-2 rounded-md text-sm flex-1 hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Qabul qilish
                    </button>
                    <button 
                      onClick={() => handleRejectOffer(offer.id)}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm flex-1 hover:bg-gray-200 transition-colors flex items-center justify-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rad etish
                    </button>
                  </div>
                </div>
              ))}
              
              {offers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Yangi takliflar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;