import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomeMenu = () => {
    const navigate = useNavigate();

    // Tizimdagi asosiy bo'limlar ro'yxati
    const sections = [
        { id: 1, title: "Do'konlar Xaritasi", icon: "🗺️", path: "/ayla/map", color: "#3b82f6" },
        { id: 2, title: "Mahsulotlar", icon: "📦", path: "/ayla/products", color: "#f59e0b" },
        { id: 3, title: "Narx Belgilash", icon: "💰", path: "/ayla/pricing", color: "#10b981" },
        { id: 4, title: "Yuk Ortish (Sklad)", icon: "🚚", path: "/ayla/loadout", color: "#8b5cf6" },
        { id: 5, title: "Statistika", icon: "📊", path: "/ayla/statistics", color: "#ef4444" },
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#0f172a', minHeight: '100%', color: 'white' }}>
            <h2 style={{ marginBottom: '5px' }}>Ayla Distribution</h2>
            <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Kerakli bo'limni tanlang:</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                {sections.map(section => (
                    <div 
                        key={section.id} 
                        onClick={() => navigate(section.path)}
                        style={{ 
                            backgroundColor: '#1e293b', 
                            border: `1px solid ${section.color}`,
                            borderRadius: '12px', 
                            padding: '20px', 
                            textAlign: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>{section.icon}</div>
                        <h3 style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{section.title}</h3>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomeMenu;