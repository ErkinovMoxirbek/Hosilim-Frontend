import React, { useState, useEffect } from 'react';
import {
  Apple, ShoppingCart, DollarSign, Package, Plus,
  Star, Check, X, TrendingUp, TrendingDown, Eye, AlertCircle,
  Bell, MapPin, Calendar, Users, Truck, CloudRain,
  BarChart3, Phone, Clock, Award, Info
} from 'lucide-react';
import API_BASE_URL from "../../config";
import { format } from "date-fns";
import { uz } from "date-fns/locale";




// AddProductModal komponenti (o'zgarishsiz)
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
    { value: 'TONNA', label: 'Tonna' },
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

  // Yangi state lar
  const [marketPrices, setMarketPrices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [topBrokers, setTopBrokers] = useState([]);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [seasonalTips, setSeasonalTips] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);

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

      // Statistika (mavjud)
      const statsResponse = await fetch(`${API_BASE_URL}/farmer/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data || stats);
      }

      // YANGI API lar
      // 1. Bozor narxlari
      const marketResponse = await fetch(`${API_BASE_URL}/farmer/market-prices/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (marketResponse.ok) {
        const marketData = await marketResponse.json();
        setMarketPrices(marketData.data || []);
      }

      // 2. Xabarnomalar
      const notificationsResponse = await fetch(`${API_BASE_URL}/farmer/notifications?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.data || []);
      }

      // 3. Top brokerlar
      const brokersResponse = await fetch(`${API_BASE_URL}/farmer/top-brokers?limit=3`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (brokersResponse.ok) {
        const brokersData = await brokersResponse.json();
        setTopBrokers(brokersData.data || []);
      }

      // 4. Ob-havo ogohlantirishi
      const weatherResponse = await fetch(`${API_BASE_URL}/farmer/weather-alert`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        setWeatherAlert(weatherData.data || null);
      }

      // 5. Mavsumiy tavsiyalar
      const tipsResponse = await fetch(`${API_BASE_URL}/farmer/seasonal-tips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (tipsResponse.ok) {
        const tipsData = await tipsResponse.json();
        setSeasonalTips(tipsData.data || []);
      }

      // 6. Trending mahsulotlar
      const trendingResponse = await fetch(`${API_BASE_URL}/farmer/trending-products?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (trendingResponse.ok) {
        const trendingData = await trendingResponse.json();
        setTrendingProducts(trendingData.data || []);
      }

      // Mahsulotlar (mavjud)
      const productsResponse = await fetch(`${API_BASE_URL}/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.data || []);
      }

      // Takliflar (mavjud)
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
        {/* Header */}
        <div className="mb-4 lg:mb-8">
          <h1 className="text-xl lg:text-3xl font-bold text-gray-900">Fermer Dashboard</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            {format(new Date(), "EEEE, d MMMM yyyy", { locale: uz })}
          </p>
        </div>

        {/* Ob-havo ogohlantirishi */}
        {weatherAlert && (
          <div className={`p-4 rounded-lg border-l-4 ${weatherAlert.severity === 'high' ? 'bg-red-50 border-red-500' :
            weatherAlert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
              'bg-blue-50 border-blue-500'
            }`}>
            <div className="flex items-start">
              <CloudRain className={`w-5 h-5 mt-0.5 mr-3 ${weatherAlert.severity === 'high' ? 'text-red-600' :
                weatherAlert.severity === 'medium' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
              <div>
                <h4 className="font-semibold text-sm lg:text-base">{weatherAlert.title}</h4>
                <p className="text-xs lg:text-sm mt-1">{weatherAlert.description}</p>
                <p className="text-xs text-gray-600 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {weatherAlert.validUntil}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistika cards */}
        <div className="grid grid-cols-2 gap-3 lg:gap-6 mb-4 lg:mb-8">
          <div className="bg-white rounded-lg lg:rounded-xl p-3 lg:p-6 border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 lg:p-3 bg-green-100 rounded-lg">
                <Apple className="h-4 w-4 lg:h-6 lg:w-6 text-green-600" />
              </div>
              <div className="ml-2 lg:ml-4 min-w-0 flex-1">
                <p className="text-xs lg:text-sm text-gray-600 truncate">Mavjud mahsulot</p>
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
                <p className="text-xs lg:text-sm text-gray-600 truncate">Bu oy daromad</p>
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
                <p className="text-xs lg:text-sm text-gray-600 truncate">Faol e'lonlar</p>
                <p className="text-sm lg:text-2xl font-bold text-gray-900">{stats.activeListings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bugungi bozor narxlari */}
        <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200 mb-4 lg:mb-6">
          <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Bugungi Bozor Narxlari</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {marketPrices.map((price) => (
                <div key={price.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm lg:text-base">{price.productName}</p>
                      <p className="text-xs text-gray-600">{price.quality}</p>
                    </div>
                    <div className={`flex items-center text-xs ${price.trend === 'up' ? 'text-green-600' :
                      price.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                      {price.trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> :
                        price.trend === 'down' ? <TrendingDown className="w-3 h-3 mr-1" /> : null}
                      {price.change}%
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600">
                    {price.currentPrice?.toLocaleString()} so'm/kg
                  </p>
                  <p className="text-xs text-gray-500">
                    Kecha: {price.yesterdayPrice?.toLocaleString()} so'm/kg
                  </p>
                </div>
              ))}
            </div>

            {marketPrices.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Bozor narxlari yuklanmoqda...</p>
              </div>
            )}
          </div>
        </div>

        {/* Trending mahsulotlar va Xabarnomalar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Trending mahsulotlar */}
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200">
            <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Eng Ko'p Sotilayotgan</h3>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="p-3 lg:p-6">
              <div className="space-y-3">
                {trendingProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-50 text-gray-500'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-600">{product.totalSold} kg sotilgan</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-green-600">
                        {product.avgPrice?.toLocaleString()} so'm/kg
                      </p>
                      <p className="text-xs text-gray-500">o'rtacha narx</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Xabarnomalar */}
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200">
            <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm lg:text-lg font-semibold text-gray-900">So'ngi Yangiliklar</h3>
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="p-3 lg:p-6">
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${notification.type === 'price_alert' ? 'bg-green-50 border-green-500' :
                    notification.type === 'broker_offer' ? 'bg-blue-50 border-blue-500' :
                      notification.type === 'weather' ? 'bg-yellow-50 border-yellow-500' :
                        'bg-gray-50 border-gray-500'
                    }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {notification.createdAt}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {notifications.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Yangi xabarnomalar yo'q</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top brokerlar */}
        <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200 mb-4 lg:mb-6">
          <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Ishonchli Brokerlar</h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {topBrokers.map((broker) => (
                <div key={broker.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-medium text-sm lg:text-base">{broker.name}</p>
                      <div className="flex items-center mt-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{broker.rating}</span>
                        <span className="text-xs text-gray-500 ml-1">({broker.reviewCount} sharh)</span>
                      </div>
                    </div>
                    <Award className={`w-5 h-5 ${broker.badge === 'gold' ? 'text-yellow-500' :
                      broker.badge === 'silver' ? 'text-gray-400' :
                        'text-orange-500'
                      }`} />
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">To'lov tezligi:</span>
                      <span className="font-medium">{broker.paymentSpeed} kun</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Umumiy sotib oldi:</span>
                      <span className="font-medium">{broker.totalPurchased} tonna</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Joylashuv:</span>
                      <span className="font-medium">{broker.location}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-xs hover:bg-blue-700">
                      <Phone className="w-3 h-3 inline mr-1" />
                      Aloqa
                    </button>
                    <button className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs hover:bg-gray-200">
                      <Info className="w-3 h-3 inline mr-1" />
                      Profil
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {topBrokers.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Broker ma'lumotlari yuklanmoqda...</p>
              </div>
            )}
          </div>
        </div>

        {/* Mavsumiy tavsiyalar */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg lg:rounded-xl border border-green-200 mb-4 lg:mb-6">
          <div className="p-3 lg:p-6 border-b border-green-200 flex justify-between items-center">
            <h3 className="text-sm lg:text-lg font-semibold text-green-800">Mavsumiy Tavsiyalar</h3>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="p-3 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {seasonalTips.map((tip) => (
                <div key={tip.id} className="bg-white p-4 rounded-lg border border-green-100">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-3 ${tip.type === 'planting' ? 'bg-green-100 text-green-600' :
                      tip.type === 'harvest' ? 'bg-yellow-100 text-yellow-600' :
                        tip.type === 'market' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                      }`}>
                      {tip.type === 'planting' ? <Calendar className="w-4 h-4" /> :
                        tip.type === 'harvest' ? <Apple className="w-4 h-4" /> :
                          tip.type === 'market' ? <TrendingUp className="w-4 h-4" /> :
                            <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm lg:text-base text-gray-900">{tip.title}</h4>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">{tip.description}</p>
                      <p className="text-xs text-green-600 mt-2 font-medium">{tip.timeframe}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {seasonalTips.length === 0 && (
              <div className="text-center py-6 text-green-600">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Mavsumiy tavsiyalar yuklanmoqda...</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Mahsulotlar */}
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200">
            <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Mening Mahsulotlarim</h3>
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
                  <div key={product.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="min-w-0 flex-1 mr-3">
                        <p className="font-medium text-sm lg:text-base text-gray-900 truncate">
                          {product.fruitName}
                        </p>
                        <div className="text-xs lg:text-sm text-gray-600 space-y-0.5">
                          <div className="flex justify-between">
                            <span>Miqdor:</span>
                            <span className="font-medium">{product.quantity} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sifat:</span>
                            <span className="font-medium">{product.quality}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Narx:</span>
                            <span className="font-medium text-green-600">
                              {product.pricePerKg?.toLocaleString()} so'm/kg
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium whitespace-nowrap ${!product.isSold ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                          {!product.isSold ? 'Mavjud' : 'Sotildi'}
                        </span>
                        <div className="flex space-x-1">
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
                    </div>

                    {/* Ko'rishlar soni va qiziquvchilar */}
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      <span>
                        <Eye className="w-3 h-3 inline mr-1" />
                        {product.viewCount || 0} marta ko'rildi
                      </span>
                      <span>
                        <Users className="w-3 h-3 inline mr-1" />
                        {product.interestedBrokers || 0} broker qiziqdi
                      </span>
                    </div>
                  </div>
                ))}

                {products.length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <Apple className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-2 lg:mb-4 opacity-50" />
                    <p className="text-sm">Hozircha mahsulotlar yo'q</p>
                    <p className="text-xs mt-1">Birinchi mahsulotingizni qo'shing</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Takliflar - yaxshilangan */}
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200">
            <div className="p-3 lg:p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-sm lg:text-lg font-semibold text-gray-900">Yangi Takliflar</h3>
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                {offers.length} yangi
              </span>
            </div>
            <div className="p-3 lg:p-6">
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div key={offer.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-sm lg:text-base text-gray-900 truncate">
                            {offer.broker?.name || offer.broker?.phone}
                          </p>
                          <div className="flex items-center">
                            <Star className="w-3 h-3 lg:w-4 lg:h-4 text-yellow-400 fill-current" />
                            <span className="text-xs lg:text-sm text-gray-600 ml-1">{offer.broker?.rating || 4.5}</span>
                          </div>
                        </div>

                        <div className="text-xs lg:text-sm text-gray-600 space-y-1">
                          <div className="flex justify-between">
                            <span>Mahsulot:</span>
                            <span className="font-medium">{offer.fruitType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Miqdor:</span>
                            <span className="font-medium">{offer.quantity}kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Taklif narx:</span>
                            <span className="font-medium text-blue-600">
                              {offer.pricePerKg?.toLocaleString()} so'm/kg
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Umumiy summa:</span>
                            <span className="font-medium text-green-600">
                              {(offer.pricePerKg * offer.quantity)?.toLocaleString()} so'm
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {offer.createdAt}
                          </span>
                          <span>
                            <MapPin className="w-3 h-3 inline mr-1" />
                            {offer.broker?.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptOffer(offer.id)}
                        className="bg-green-600 text-white px-2 py-1.5 rounded-md text-xs flex-1 hover:bg-green-700 transition-colors flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                        <span className="hidden sm:inline">Qabul qilish</span>
                        <span className="sm:hidden">Qabul</span>
                      </button>
                      <button
                        onClick={() => handleRejectOffer(offer.id)}
                        className="bg-gray-100 text-gray-700 px-2 py-1.5 rounded-md text-xs flex-1 hover:bg-gray-200 transition-colors flex items-center justify-center"
                      >
                        <X className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                        <span className="hidden sm:inline">Rad etish</span>
                        <span className="sm:hidden">Rad</span>
                      </button>
                    </div>
                  </div>
                ))}

                {offers.length === 0 && (
                  <div className="text-center py-6 lg:py-8 text-gray-500">
                    <ShoppingCart className="w-8 lg:w-12 h-8 lg:h-12 mx-auto mb-2 lg:mb-4 opacity-50" />
                    <p className="text-sm">Yangi takliflar yo'q</p>
                    <p className="text-xs mt-1">Mahsulot qo'shganingizdan so'ng takliflar keladi</p>
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