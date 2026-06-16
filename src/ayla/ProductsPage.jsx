import React, { useState, useEffect, useCallback } from 'react';
import productService from './productService'; 

const INITIAL_FORM_STATE = { name: '', description: '', unit: 'LITR', imageUrl: '' };

const ProductsPage = () => {
    // Ma'lumotlar va Pagination holati
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchQuery, setActiveSearchQuery] = useState(''); // Haqiqiy qidiruv uchun alohida state
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); // Bitta sahifada 10 ta mahsulot chiqadi
    
    // Forma holati
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);

    // Ma'lumotlarni yuklash funksiyasini useCallback bilan o'rab barqaror qilamiz
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            // productService orqali pagedata keladi
            const data = await productService.getAllProducts(page, pageSize, activeSearchQuery);
            setProducts(data.content); // Spring Page'dagi ro'yxat
            setTotalPages(data.totalPages); // Jami sahifalar soni
        } catch (error) {
            alert("Mahsulotlarni yuklashda xatolik yuz berdi!");
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, activeSearchQuery]); // Ushbu qiymatlar o'zgargandagina funksiya yangilanadi

    // Sahifa yoki qidiruv matni o'zgarganda ma'lumotni yangilash
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]); // Endi ESLint sizdan xatolik topmaydi

    // Qidiruv uchun alohida funksiya
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(0); // Qidiruv bo'lganda doim 1-sahifaga qaytamiz
        setActiveSearchQuery(searchQuery); // Faqat tugma bosilganda qidiruvni ishga tushiradi
    };

    // Forma logikasi
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

    // Saqlash (Yaratish yoki Yangilash)
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
            fetchProducts(); // Ro'yxatni yangilaymiz
        } catch (error) {
            alert("Saqlashda xatolik yuz berdi!");
        } finally {
            setSaving(false);
        }
    };

    // O'chirish (Soft delete)
    const handleDelete = async (id) => {
        if (!window.confirm("Bu mahsulotni o'chirishga ishonchingiz komilmi? (Katalogdan yashiriladi)")) return;
        
        try {
            await productService.deleteProduct(id);
            // Sahifadagi yagona mahsulot o'chib ketsa va sahifa 0 dan katta bo'lsa, oldingi sahifaga qaytamiz
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
        <div style={{ padding: '24px', backgroundColor: '#0f172a', minHeight: '100vh', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
            
            {/* ─── Header qismi ─── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>📚 Mahsulotlar Katalogi</h2>
                
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="text" 
                        placeholder="🔍 Nomi bo'yicha qidirish..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#1e293b', color: 'white', width: '250px' }}
                    />
                    <button type="submit" style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Qidirish
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleOpenForm()}
                        style={{ backgroundColor: '#ccff00', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginLeft: '15px' }}
                    >
                        ➕ Yangi qo'shish
                    </button>
                </form>
            </div>

            {/* ─── Tahrirlash / Qo'shish Formasi ─── */}
            {showForm && (
                <form onSubmit={handleSubmit} style={{ backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #334155', display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px' }}>Mahsulot nomi <span style={{color: '#ef4444'}}>*</span></label>
                        <input 
                            type="text" required
                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="Sut 3.2%"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px' }}>O'lchov birligi <span style={{color: '#ef4444'}}>*</span></label>
                        <select 
                            value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}
                        >
                            <option value="LITR">Litr</option>
                            <option value="KG">Kilogramm</option>
                            <option value="DONA">Dona / Quti</option>
                            <option value="METR">Metr</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px' }}>Rasm URL manzili</label>
                        <input 
                            type="text"
                            value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                            placeholder="https://..."
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontSize: '14px' }}>Qisqacha ta'rif</label>
                        <textarea 
                            value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="Mahsulot haqida ma'lumot..."
                            rows="2"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '10px', gridColumn: '1 / -1' }}>
                        <button type="submit" disabled={saving} style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer' }}>
                            {saving ? 'Saqlanmoqda...' : (editingId ? "💾 O'zgarishlarni saqlash" : "➕ Katalogga qo'shish")}
                        </button>
                        <button type="button" onClick={handleCloseForm} style={{ flex: 1, backgroundColor: '#334155', color: '#cbd5e1', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Bekor qilish
                        </button>
                    </div>
                </form>
            )}

            {/* ─── Jadval (Table) Qismi ─── */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>⏳ Yuklanmoqda...</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600' }}>Rasm</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600' }}>Mahsulot nomi</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600' }}>O'lchov</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600' }}>Ta'rif</th>
                                <th style={{ padding: '16px', color: '#94a3b8', fontWeight: '600', textAlign: 'right' }}>Harakatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                        Katalogda mahsulot topilmadi
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product.id} style={{ borderBottom: '1px solid #334155' }}>
                                        <td style={{ padding: '12px 16px' }}>
                                            {product.imageUrl ? (
                                                <img src={product.imageUrl} alt={product.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px' }}>Rasm yo'q</div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: '500' }}>{product.name}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ backgroundColor: '#334155', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                                                {product.unit}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px', color: '#94a3b8', fontSize: '14px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {product.description || "—"}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right' }}>
                                            <button 
                                                onClick={() => handleOpenForm(product)} 
                                                style={{ background: 'transparent', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '16px', marginRight: '15px' }}
                                                title="Tahrirlash"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)} 
                                                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}
                                                title="O'chirish"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ─── Pagination Qismi ─── */}
            {!loading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                    <button 
                        disabled={page === 0}
                        onClick={() => setPage(page - 1)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: page === 0 ? '#334155' : '#3b82f6', color: page === 0 ? '#94a3b8' : 'white', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        ◀ Oldingi
                    </button>
                    <span style={{ color: '#cbd5e1' }}>
                        Sahifa {page + 1} / {totalPages}
                    </span>
                    <button 
                        disabled={page === totalPages - 1}
                        onClick={() => setPage(page + 1)}
                        style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: page === totalPages - 1 ? '#334155' : '#3b82f6', color: page === totalPages - 1 ? '#94a3b8' : 'white', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Keyingi ▶
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;