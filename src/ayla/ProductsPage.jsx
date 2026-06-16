import React, { useState, useEffect, useCallback } from 'react';
import productService from './productService'; 

const INITIAL_FORM_STATE = { name: '', description: '', unit: 'LITR', imageUrl: '' };

const ProductsPage = () => {
    // Ma'lumotlar va Pagination holati
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState('');
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); 
    
    // Forma holati
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await productService.getAllProducts(page, pageSize, activeSearchQuery);
            setProducts(data.content); 
            setTotalPages(data.totalPages); 
        } catch (error) {
            alert("Mahsulotlarni yuklashda xatolik yuz berdi!");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, activeSearchQuery]); 

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); 

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); 
        setActiveSearchQuery(searchQuery); 
    };

    const handleOpenForm = (product = null) => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description || '',
                unit: product.unit,
                imageUrl: product.imageUrl || ''
            });
            setEditingId(product.id);
        } else {
            setFormData(INITIAL_FORM_STATE);
            setEditingId(null);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setFormData(INITIAL_FORM_STATE);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            alert("Mahsulot nomi to'ldirilishi shart!");
            return;
        }

        setSaving(true);
        try {
            if (editingId) {
                await productService.updateProduct(editingId, formData);
            } else {
                await productService.createProduct(formData);
            }
            handleCloseForm();
            fetchProducts(); 
        } catch (error) {
            alert("Saqlashda xatolik yuz berdi!");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bu mahsulotni o'chirishga ishonchingiz komilmi?")) return;
        
        try {
            await productService.deleteProduct(id);
            if (products.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                fetchProducts();
            }
        } catch (error) {
            alert("O'chirishda xatolik yuz berdi!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* ─── Header va Qidiruv qismi ─── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">Katalog</h2>
                    
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                        <input 
                            type="text" 
                            placeholder="Qidirish..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full sm:w-64 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                        />
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button 
                                type="submit" 
                                className="w-full sm:w-auto px-5 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Izlash
                            </button>
                            <button 
                                type="button"
                                onClick={() => handleOpenForm()}
                                className="w-full sm:w-auto px-5 py-2 bg-white border border-gray-300 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                            >
                                + Yangi
                            </button>
                        </div>
                    </form>
                </div>

                {/* ─── Tahrirlash / Qo'shish Formasi ─── */}
                {showForm && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-sm">
                        <h3 className="text-lg font-medium mb-4">{editingId ? "Tahrirlash" : "Yangi mahsulot"}</h3>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">Nomi *</label>
                                <input 
                                    type="text" required
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-500 uppercase">O'lchov *</label>
                                <select 
                                    value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                                >
                                    <option value="LITR">Litr</option>
                                    <option value="KG">Kilogramm</option>
                                    <option value="DONA">Dona</option>
                                    <option value="METR">Metr</option>
                                </select>
                            </div>
                            <div className="space-y-1 sm:col-span-2 lg:col-span-2">
                                <label className="text-xs font-medium text-gray-500 uppercase">Rasm URL</label>
                                <input 
                                    type="text"
                                    value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                                />
                            </div>
                            <div className="space-y-1 sm:col-span-2 lg:col-span-4">
                                <label className="text-xs font-medium text-gray-500 uppercase">Ta'rif</label>
                                <textarea 
                                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="1"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black resize-y"
                                />
                            </div>
                            <div className="flex gap-3 sm:col-span-2 lg:col-span-4 justify-end mt-2">
                                <button type="button" onClick={handleCloseForm} className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                                    Bekor qilish
                                </button>
                                <button type="submit" disabled={saving} className="px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors">
                                    {saving ? 'Saqlanmoqda...' : 'Saqlash'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* ─── Jadval Qismi (Mobil uchun overflow bilan) ─── */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-sm text-gray-500">Yuklanmoqda...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse whitespace-nowrap">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 font-medium">Rasm</th>
                                        <th className="px-6 py-4 font-medium">Nomi</th>
                                        <th className="px-6 py-4 font-medium">O'lchov</th>
                                        <th className="px-6 py-4 font-medium">Ta'rif</th>
                                        <th className="px-6 py-4 font-medium text-right">Amallar</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 text-sm">
                                    {products.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                                Hech narsa topilmadi.
                                            </td>
                                        </tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-3">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt={product.name} className="w-10 h-10 rounded-md object-cover border border-gray-200" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-400 text-xs border border-gray-200">Yo'q</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{product.name}</td>
                                                <td className="px-6 py-3">
                                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                                        {product.unit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-500 max-w-[200px] truncate">
                                                    {product.description || "—"}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <button onClick={() => handleOpenForm(product)} className="text-gray-400 hover:text-black transition-colors px-2">
                                                        Tahrirlash
                                                    </button>
                                                    <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-600 transition-colors px-2 ml-2">
                                                        O'chirish
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* ─── Pagination Qismi ─── */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
                        <button 
                            disabled={page === 0}
                            onClick={() => setPage(page - 1)}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            Ortga
                        </button>
                        <span className="text-sm text-gray-500 font-medium">
                            {page + 1} / {totalPages}
                        </span>
                        <button 
                            disabled={page === totalPages - 1}
                            onClick={() => setPage(page + 1)}
                            className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                        >
                            Keyingisi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsPage;