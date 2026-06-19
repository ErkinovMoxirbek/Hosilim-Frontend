import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeMenu = () => {
    const navigate = useNavigate();
    const [hoveredId, setHoveredId] = useState(null);

    const sections = [
        { id: 1, title: "Do'konlar", subtitle: "Filiallar va xarita", icon: "🏪", path: "/ayla/map", color: "#1d4ed8", glow: "rgba(29, 78, 216, 0.12)" },
        { id: 2, title: "Mahsulotlar", subtitle: "Katalog boshqaruvi", icon: "📦", path: "/ayla/products", color: "#10b981", glow: "rgba(16, 185, 129, 0.12)" },
        { id: 3, title: "Narxlar", subtitle: "Tovar narxi boshqaruvi", icon: "💳", path: "/ayla/pricing", color: "#f97316", glow: "rgba(249, 115, 22, 0.12)" },
        { id: 4, title: "Yuk Tashish", subtitle: "Sklad va logistika", icon: "🚚", path: "/ayla/loadout", color: "#8b5cf6", glow: "rgba(139, 92, 246, 0.12)" },
    ];

    return (
        <div style={{ 
            backgroundColor: '#f8fafc',
            minHeight: '100vh', 
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            paddingBottom: '90px' // Pastki menyu uchun joy
        }}>
            
            {/* CSS xususiyatlari - Ekran o'lchamiga qarab o'zgarishi uchun */}
            <style>
                {`
                    .main-container {
                        width: 100%;
                        max-width: 450px; /* Telefonda */
                        padding: 24px;
                        box-sizing: border-box;
                        transition: max-width 0.3s ease;
                    }
                    .grid-menu {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr); /* Telefonda 2 ta ustun */
                        gap: 16px;
                    }
                    .bottom-nav {
                        max-width: 450px;
                    }

                    /* Kompyuter va planshetlar uchun (kengligi 768px dan katta bo'lsa) */
                    @media (min-width: 768px) {
                        .main-container {
                            max-width: 900px; /* Kompyuterda kengayadi */
                        }
                        .grid-menu {
                            grid-template-columns: repeat(4, 1fr); /* Kompyuterda 4 ta ustun */
                            gap: 24px;
                        }
                        .bottom-nav {
                            max-width: 900px;
                            border-radius: 20px 20px 0 0; /* Kompyuterda chetlari yassilanadi */
                        }
                    }
                `}
            </style>

            {/* Asosiy kontent qismi */}
            <div className="main-container">
                
                {/* Sarlavha */}
                <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '40px' }}>
                    <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: '#0f172a' }}>
                        Ayla Distribution
                    </h1>
                </div>

                {/* Moslashuvchan Grid Menyular */}
                <div className="grid-menu">
                    {sections.map(section => {
                        const isHovered = hoveredId === section.id;
                        return (
                            <div 
                                key={section.id} 
                                onClick={() => navigate(section.path)}
                                onMouseEnter={() => setHoveredId(section.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{ 
                                    backgroundColor: '#ffffff', 
                                    borderRadius: '20px', 
                                    padding: '28px 16px', 
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: isHovered 
                                        ? `0 15px 25px ${section.glow}` 
                                        : `0 8px 16px ${section.glow}, 0 2px 4px rgba(0,0,0,0.02)`,
                                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ 
                                    width: '64px', 
                                    height: '64px', 
                                    borderRadius: '18px', 
                                    backgroundColor: `${section.color}15`, 
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '28px',
                                    marginBottom: '20px'
                                }}>
                                    {section.icon}
                                </div>
                                <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', fontWeight: '700', color: '#0f172a' }}>
                                    {section.title}
                                </h3>
                                <p style={{ fontSize: '13px', margin: 0, color: '#64748b', lineHeight: '16px' }}>
                                    {section.subtitle}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Statistika Kartasi */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    marginTop: '32px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                }}>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Bugungi Statistika</span>
                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>Faollik: Yuqori darajada</span>
                </div>
            </div>

            {/* --- BOTTOM NAVIGATION (Pastki menyu) --- */}
            <div className="bottom-nav" style={{
                position: 'fixed',
                bottom: 0,
                width: '100%',
                backgroundColor: '#ffffff',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '12px 0',
                boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
                zIndex: 100
            }}>
                {/* 1. Asosiy (Aktiv holat) */}
                <div 
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}
                >
                    <div style={{ 
                        backgroundColor: '#f3e8ff', 
                        padding: '6px 24px', 
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '20px', color: '#8b5cf6' }}>🏠</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#8b5cf6' }}>Asosiy</span>
                </div>

                {/* 2. Savdo tarixi (Passiv holat) */}
                <div 
                    onClick={() => navigate('/ayla/history')}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', gap: '4px' }}
                >
                    <div style={{ 
                        padding: '6px 24px', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <span style={{ fontSize: '20px', color: '#64748b' }}>🕒</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b' }}>Savdo tarixi</span>
                </div>
            </div>

        </div>
    );
};

export default HomeMenu;