import React, { useState, useEffect } from 'react';
import priceService from '../../services/priceService';
import fruitTypeService from '../../services/fruitTypeService';
import {
  Tags,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Apple,
  Plus
} from 'lucide-react';

export default function PriceManagerPage() {
  const [activePrices, setActivePrices] = useState([]);
  const [globalFruitTypes, setGlobalFruitTypes] = useState([]); // Admin kiritgan aktiv mevalar
  const [qualityMap, setQualityMap] = useState({}); // Navlarni chiroyli ko'rsatish uchun
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Forma datasi
  const [formData, setFormData] = useState({
    fruitTypeId: '',
    collectionPointId: 1, // DIQQAT: Buni tizimga kirgan brokerning aktiv punkti IDsiga almashtirasiz
    amount: ''
  });

  // Sahifa yuklanganda kerakli ma'lumotlarni parallel tortamiz
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setErrorMessage(null); // Har ehtimolga qarshi eski xatoni tozalaymiz

    try {
      const [pricesData, fruitsData, qualitiesData] = await Promise.all([

        // 1. Narxlarni tortish
        priceService.getActivePrices().catch(err => {
          console.error("🔴 Narxlarni tortishda xatolik:", err.response || err);
          return []; // Qulasa, dastur to'xtab qolmasligi uchun bo'sh massiv beramiz
        }),

        // 2. Mevalarni tortish
        fruitTypeService.getAllFruitTypes().catch(err => {
          console.error("🔴 Mevalarni tortishda xatolik:", err.response || err);
          return [];
        }),

        // 3. Navlarni tortish
        fruitTypeService.getQualities().catch(err => {
          console.error("🔴 Navlarni tortishda xatolik:", err.response || err);
          return [];
        })

      ]);

      // Endi bittasi qulasa ham, ishlayotganlari state'ga yozilaveradi
      setActivePrices(Array.isArray(pricesData) ? pricesData : []);
      setGlobalFruitTypes(Array.isArray(fruitsData) ? fruitsData : []);

      // Navlarni chiroyli formatda saqlab qo'yamiz
      const qMap = {};
      if (Array.isArray(qualitiesData)) {
        qualitiesData.forEach(q => {
          qMap[q.key] = q.label;
        });
      }
      setQualityMap(qMap);

      // Agar mevalar kela olmasa ekranga ogohlantirish chiqaramiz, lekin dastur qulamaydi
      if (fruitsData.length === 0) {
        console.warn("Eslatma: Meva turlari serverdan kelmadi.");
      }

    } catch (error) {
      // Bu catch faqat favqulodda JS xatoligi bo'lsagina ishlaydi
      console.error("Kutilmagan xatolik:", error);
      setErrorMessage("Ma'lumotlarni yuklashda tarmoq xatoligi yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  // Yangi narx belgilash
  const handleSetPrice = async (e) => {
    e.preventDefault();
    if (!formData.fruitTypeId || !formData.amount) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        fruitTypeId: parseInt(formData.fruitTypeId),
        collectionPointId: formData.collectionPointId,
        amount: parseFloat(formData.amount)
      };

      const response = await priceService.setPrice(payload);

      setSuccessMessage(response.message || "Yangi narx muvaffaqiyatli o'rnatildi!");

      // Yangi narxlar ro'yxatini qayta tortib kelamiz (mevalarni tortish shart emas)
      const updatedPrices = await priceService.getActivePrices();
      setActivePrices(Array.isArray(updatedPrices) ? updatedPrices : []);

      setIsModalOpen(false);
      setFormData({ ...formData, fruitTypeId: '', amount: '' });

      // 3 soniyadan keyin xabarni yo'qotish
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Narx belgilashda xatolik yuz berdi!");
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kartochkadagi "Narxni yangilash" tugmasi bosilganda
  const openEditModal = (fruitTypeId, currentAmount) => {
    setFormData({
      ...formData,
      fruitTypeId: fruitTypeId,
      amount: currentAmount
    });
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shadow-sm">
            <Tags size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Preyskurant (Narxlar)</h1>
            <p className="text-sm text-gray-500 mt-1">Qabul punktidagi joriy tasdiqlangan narxlar</p>
          </div>
        </div>

        <button
          onClick={() => {
            setFormData({ ...formData, fruitTypeId: '', amount: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-sm active:scale-95"
        >
          <Plus size={20} />
          <span>Yangi narx belgilash</span>
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <p className="font-medium">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={24} />
          <p className="font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
          <p className="text-gray-500 font-medium">Narxlar yuklanmoqda...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Active Prices Cards */}
          {activePrices.map((price) => (
            <div key={price.priceId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50 text-orange-500 rounded-xl">
                      <Apple size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{price.fruitTypeName}</h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md tracking-wide mt-1 inline-block uppercase">
                        {/* Jackson orqali to'g'ri kelgan matn, yoki qiyin enum kelsa map orqali oladi */}
                        {qualityMap[price.quality] || price.quality}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 mb-6">
                  <p className="text-sm text-gray-500 font-medium mb-1">Joriy tasdiqlangan narx:</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">
                      {price.amount.toLocaleString()}
                    </span>
                    <span className="text-gray-500 font-bold">UZS</span>
                    <span className="text-gray-400 text-sm">/kg</span>
                  </div>
                </div>

                <button
                  onClick={() => openEditModal(price.fruitTypeId || price.id, price.amount)}
                  className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition-colors flex justify-center items-center gap-2"
                >
                  <TrendingUp size={18} /> Narxni yangilash
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {activePrices.length === 0 && (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
              <AlertCircle size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-1">Narxlar belgilanmagan</h3>
              <p className="text-gray-500">Hozircha hech qanday meva uchun narx o'rnatilmagan.</p>
            </div>
          )}

        </div>
      )}

      {/* MODAL: Narx O'rnatish */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Narxni O'rnatish</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSetPrice} className="p-6">
              <div className="space-y-5">

                {/* Meva Turi Dropdown (Global Katalogdan) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Meva turi va Navi <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.fruitTypeId}
                    onChange={e => setFormData({ ...formData, fruitTypeId: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-gray-900"
                    disabled={isSubmitting}
                  >
                    <option value="">-- Katalogdan tanlang --</option>
                    {globalFruitTypes.map(ft => (
                      <option key={ft.id} value={ft.id}>
                        {ft.name} — {qualityMap[ft.quality] || ft.quality}
                      </option>
                    ))}
                  </select>
                  {globalFruitTypes.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">Katalog bo'sh. Admin meva qo'shishi kerak.</p>
                  )}
                </div>

                {/* Yangi Narx Kiritish */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Yangi Narx (1 kg uchun) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.amount}
                      onChange={e => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full pl-4 pr-16 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xl font-bold text-gray-900 transition-all"
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">UZS</span>
                  </div>

                  {/* Arxitektura eslatmasi */}
                  <div className="mt-3 p-3 bg-amber-50 rounded-lg flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-700 leading-tight">
                      <strong>Eslatma:</strong> Eski narx avtomatik tarzda arxivlanadi va oldingi tranzaksiyalarga (qabul qilingan hosillarga) ta'sir qilmaydi.
                    </p>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || globalFruitTypes.length === 0}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Saqlanmoqda...</>
                  ) : (
                    <><CheckCircle2 size={18} /> Tasdiqlash</>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}