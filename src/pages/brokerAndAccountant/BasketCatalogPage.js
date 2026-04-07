import React, { useState, useEffect } from 'react';
import basketService from '../../services/basketService';
import { useAuth } from '../../hooks/useAuth'; 
import { 
  Package, Plus, Scale, CheckCircle2, 
  XCircle, Edit2, Trash2, X, Loader2, ArrowDownToLine, Layers
} from 'lucide-react';

export default function BasketCatalogPage() {
  const [baskets, setBaskets] = useState([]);
  const [materials, setMaterials] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  const isBroker = Array.isArray(user?.role) ? user.role.includes('BROKER') : user?.role === 'BROKER';

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isStockModalOpen, setIsStockModalOpen] = useState(false); 
  const [editingId, setEditingId] = useState(null); 
  const [selectedBasketForStock, setSelectedBasketForStock] = useState(null);
  
  const [newBasket, setNewBasket] = useState({
    name: '', material: '', weight: '', dimensions: '', description: '', quantity: '', price: ''     
  });
  const [stockForm, setStockForm] = useState({ quantity: '', price: '' });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [basketsData, materialsData] = await Promise.all([
        basketService.getBaskets(),
        basketService.getMaterials()
      ]);
      setBaskets(Array.isArray(basketsData?.content) ? basketsData.content : []);
      const materialsArray = Array.isArray(materialsData) ? materialsData : [];
      setMaterials(materialsArray);
      
      if (materialsArray.length > 0) {
        setNewBasket(prev => ({ ...prev, material: materialsArray[0].code }));
      }
    } catch (error) {
      alert("Ma'lumotlarni yuklashda xatolik yuz berdi!");
    } finally {
      setIsLoading(false);
    }
  };

  const getMaterialLabel = (code) => {
    const mat = materials.find(m => m.code === code);
    return mat ? mat.label : code;
  };

  const handleAddNewClick = () => {
    setEditingId(null);
    setNewBasket({ name: '', material: materials.length > 0 ? materials[0].code : '', weight: '', dimensions: '', description: '', quantity: '', price: '' });
    setIsModalOpen(true);
  };

  const handleEditClick = (basket) => {
    setEditingId(basket.id);
    setNewBasket({ ...basket, dimensions: basket.dimensions || '', description: basket.description || '' });
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Bu savatni butunlay o'chirib tashlaysizmi?")) {
      try {
        await basketService.deleteBasket(id);
        setBaskets(prev => prev.filter(b => b.id !== id)); 
      } catch (error) { alert("O'chirishda xatolik yuz berdi!"); }
    }
  };

  const handleStockClick = (basket) => {
    setSelectedBasketForStock(basket);
    setStockForm({ quantity: '', price: '' });
    setIsStockModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const updatedBasket = await basketService.updateBasket(editingId, newBasket);
        setBaskets(prev => prev.map(b => b.id === editingId ? updatedBasket : b));
      } else {
        const createdBasket = await basketService.createBasket(newBasket);
        setBaskets(prev => [createdBasket, ...prev]);
      }
      setIsModalOpen(false);
    } catch (error) { alert("Saqlashda xatolik."); } 
    finally { setIsSubmitting(false); }
  };

  const handleAddStockSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updatedBasket = await basketService.addStock(selectedBasketForStock.id, stockForm);
      setBaskets(prev => prev.map(b => b.id === selectedBasketForStock.id ? updatedBasket : b));
      setIsStockModalOpen(false);
    } catch (error) { alert("Kirim qilishda xatolik."); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans text-slate-800">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-600">
              <Layers size={26} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Savatlar Ombori</h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Tara va yashiklarning joriy qoldig'i hamda nazorati</p>
            </div>
          </div>
          
          {isBroker && (
            <button 
              onClick={handleAddNewClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
            >
              <Plus size={18} strokeWidth={2.5} />
              Yangi savat
            </button>
          )}
        </div>

        {/* TABLE SECTION */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
            <p className="text-sm text-slate-500 font-medium">Ma'lumotlar yuklanmoqda...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] uppercase tracking-widest text-slate-500 font-bold">
                    <th className="px-6 py-4">Nomi & Materiali</th>
                    <th className="px-6 py-4 text-center">Soni</th>
                    <th className="px-6 py-4 text-right">Dona Narxi</th>
                    <th className="px-6 py-4 text-right">Jami Summa</th>
                    <th className="px-6 py-4 text-center">Tara Og'irligi</th>
                    <th className="px-6 py-4 text-center">Holati</th>
                    <th className="px-6 py-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[14px]">
                  {baskets.map((basket) => (
                    <tr key={basket.id} className="hover:bg-slate-50/50 transition-colors duration-200 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100/80 flex items-center justify-center text-slate-500 border border-slate-200/60">
                            <Package size={20} strokeWidth={1.5} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{basket.name}</span>
                            <span className="text-[12px] text-slate-500 mt-0.5">{getMaterialLabel(basket.material)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-full border border-slate-200/60 text-[13px]">
                          {basket.quantity || 0} ta
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="font-bold text-slate-700">
                          {Number(basket.price || 0).toLocaleString('ru-RU')} <span className="text-slate-400 font-medium ml-0.5">UZS</span>
                        </span>
                      </td>

                      {/* 🚀 BU YERDA BACKENDDAN KELGAN totalPrice ISHLATILYAPTI */}
                      <td className="px-6 py-4 text-right">
                        <span className="font-extrabold text-emerald-600">
                          {Number(basket.totalPrice || 0).toLocaleString('ru-RU')} <span className="text-slate-400 font-medium ml-0.5">UZS</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-600 rounded-full font-medium border border-slate-100 text-[13px]">
                          <Scale size={14} className="text-slate-400" />
                          {basket.weight} kg
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {basket.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[12px] font-bold border border-emerald-200/50">
                            <CheckCircle2 size={14} /> Faol
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-[12px] font-bold border border-red-200/50">
                            <XCircle size={14} /> Nofaol
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5 items-center">
                          <button 
                            onClick={() => handleStockClick(basket)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-[13px] rounded-lg hover:bg-emerald-100 border border-emerald-200/50 transition-all active:scale-95"
                          >
                            <ArrowDownToLine size={16} strokeWidth={2.5}/> Kirim
                          </button>

                          {isBroker && (
                            <>
                              <div className="w-px h-5 bg-slate-200 mx-1"></div>
                              <button onClick={() => handleEditClick(basket)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Tahrirlash">
                                <Edit2 size={18} strokeWidth={2} />
                              </button>
                              <button onClick={() => handleDeleteClick(basket.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="O'chirish">
                                <Trash2 size={18} strokeWidth={2} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {baskets.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Package size={32} className="text-slate-300" strokeWidth={1.5} />
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mb-1">Ombor hozircha bo'sh</h3>
                          <p className="text-sm text-slate-500 mb-4">Hech qanday savat yoki tara kiritilmagan.</p>
                          {isBroker && (
                            <button onClick={handleAddNewClick} className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">
                              + Birinchi savatni qo'shish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CREATE / EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingId ? "Savatni tahrirlash" : "Yangi savat qo'shish"}
                  </h2>
                  <p className="text-[13px] text-slate-500 font-medium mt-0.5">
                    {editingId ? "Katalogdagi ma'lumotlarni o'zgartirish" : "Yangi turdagi tara ma'lumotlarini kiritish"}
                  </p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  <X size={20} strokeWidth={2}/>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Savat Nomi <span className="text-red-500">*</span></label>
                    <input type="text" required value={newBasket.name} onChange={(e) => setNewBasket({...newBasket, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all" placeholder="Masalan: Qora Plastik Yashik" disabled={isSubmitting}/>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Materiali <span className="text-red-500">*</span></label>
                      <select value={newBasket.material} onChange={(e) => setNewBasket({...newBasket, material: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all appearance-none" disabled={isSubmitting || materials.length === 0}>
                        {materials.map((mat) => (<option key={mat.code} value={mat.code}>{mat.label}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Tara Og'irligi (kg) <span className="text-red-500">*</span></label>
                      <input type="number" step="0.1" required value={newBasket.weight} onChange={(e) => setNewBasket({...newBasket, weight: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all" placeholder="0.0" disabled={isSubmitting}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Korzinka Soni <span className="text-red-500">*</span></label>
                      <input type="number" min="0" required value={newBasket.quantity} onChange={(e) => setNewBasket({...newBasket, quantity: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all" placeholder="Nechta bor?" disabled={isSubmitting}/>
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Bitta Savat Narxi (so'm) <span className="text-red-500">*</span></label>
                      <input type="number" min="0" required value={newBasket.price} onChange={(e) => setNewBasket({...newBasket, price: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all" placeholder="Masalan: 15000" disabled={isSubmitting}/>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">O'lchamlari</label>
                      <input type="text" value={newBasket.dimensions} onChange={(e) => setNewBasket({...newBasket, dimensions: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all" placeholder="Ixtiyoriy (masalan: 60x40x20)" disabled={isSubmitting}/>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Qo'shimcha Izoh</label>
                    <textarea 
                      value={newBasket.description} 
                      onChange={(e) => setNewBasket({...newBasket, description: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium text-[14px] outline-none transition-all resize-none" 
                      placeholder="Savat haqida qo'shimcha ma'lumotlar..." 
                      rows="2"
                      disabled={isSubmitting}
                    />
                  </div>

                </div>

                <div className="flex gap-3 mt-8 pt-5 border-t border-slate-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors" disabled={isSubmitting}>
                    Bekor qilish
                  </button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 disabled:opacity-70 transition-colors">
                    {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Saqlanmoqda...</> : <span>{editingId ? "Tahrirni saqlash" : "Saqlash"}</span>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* KIRIM MODALI */}
        {isStockModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Partiya kirim qilish</h2>
                <button onClick={() => setIsStockModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                  <X size={20} strokeWidth={2}/>
                </button>
              </div>
              
              <form onSubmit={handleAddStockSubmit} className="p-6">
                <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1">Tanlangan Tara:</p>
                  <p className="text-base font-bold text-slate-900">{selectedBasketForStock?.name}</p>
                  <p className="text-sm text-slate-600 font-medium mt-1">Joriy qoldiq: <span className="font-bold">{selectedBasketForStock?.quantity} ta</span></p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Nechta keldi? <span className="text-red-500">*</span></label>
                    <input type="number" required min="1" value={stockForm.quantity} onChange={(e) => setStockForm({...stockForm, quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium outline-none text-base transition-all" placeholder="Masalan: 50" disabled={isSubmitting}/>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-slate-700 uppercase tracking-wider mb-2">Bitta savat narxi (so'm) <span className="text-red-500">*</span></label>
                    <input type="number" required min="0" value={stockForm.price} onChange={(e) => setStockForm({...stockForm, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-medium outline-none text-base transition-all" placeholder="Narxni kiriting" disabled={isSubmitting}/>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full mt-8 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 disabled:opacity-70 flex justify-center items-center gap-2 text-base transition-all active:scale-[0.98]">
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ArrowDownToLine size={18} strokeWidth={2.5} />}
                  Kirimni tasdiqlash
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}