import React, { useState, useEffect, useCallback, useRef } from 'react';
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';
import shopService from '../services/shopService';
import SidebarMenuButton from "../components/SidebarMenuButton";

// ─── Utilities ────────────────────────────────────────────────────────────────
const formatSum = (v) => new Intl.NumberFormat('uz-UZ').format(Math.round(v || 0)) + " so'm";

const getCoords = (shop) => {
  if (shop.lat != null && shop.lon != null) return [+shop.lat, +shop.lon];
  if (shop.latitude != null && shop.longitude != null) return [+shop.latitude, +shop.longitude];
  if (shop.location?.y != null && shop.location?.x != null) return [+shop.location.y, +shop.location.x];
  if (Array.isArray(shop.location?.coordinates)) return [shop.location.coordinates[1], shop.location.coordinates[0]];
  return null;
};

const markerPreset = (status, debt) => {
  if (status === 'COMPLETED') return 'islands#blueDotIconWithCaption';
  if (!debt || debt <= 0) return 'islands#greenDotIconWithCaption';
  if (debt >= 2_000_000) return 'islands#redDotIconWithCaption';
  return 'islands#yellowDotIconWithCaption';
};

const TASHKENT = [41.2995, 69.2401];
const EMPTY_FORM = { name: '', phoneNumber: '', viloyat: '', tuman: '' };

// ─── Component ────────────────────────────────────────────────────────────────
const MapPage = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchErr] = useState(null);

  const [selectedShop, setSelected] = useState(null);
  const [isAddMode, setAddMode] = useState(false);
  const [pendingCoords, setPending] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormErr] = useState(null);

  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const skipMapClick = useRef(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchShops = useCallback(async () => {
    setFetchErr(null);
    try {
      const data = await shopService.getAllShops();
      setShops(data);
    } catch (err) {
      setFetchErr("Do'konlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
        (err) => console.warn("GPS aniqlanmadi:", err.message),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const fetchAddressFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=uz`);
      const data = await res.json();
      if (data?.address) {
        const vil = data.address.state || data.address.region || '';
        const tum = data.address.county || data.address.city || data.address.town || data.address.city_district || '';
        setForm(p => ({
          ...p,
          viloyat: vil.replace(' Region', ' viloyati').replace('Republic of ', ''),
          tuman: tum
        }));
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (pendingCoords) {
      setForm(p => ({ ...p, viloyat: 'Aniqlanmoqda...', tuman: 'Aniqlanmoqda...' }));
      fetchAddressFromCoords(pendingCoords[0], pendingCoords[1]);
    }
  }, [pendingCoords]);

  const onMapClick = useCallback((e) => {
    if (skipMapClick.current) { skipMapClick.current = false; return; }
    if (!isAddMode) return;
    setPending(e.get('coords'));
    setAddMode(false);
    setSelected(null);
  }, [isAddMode]);

  const onPlacemarkClick = useCallback((shop) => {
    skipMapClick.current = true;
    setTimeout(() => { skipMapClick.current = false; }, 150);
    setSelected(shop);
    setPending(null);
    setAddMode(false);
  }, []);

  const handleFindMe = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setCenter(userLocation, 16, { duration: 500, timingFunction: 'ease-in-out' });
    }
  };

  const updateShopStatus = async (id, newStatus) => {
    try {
      await shopService.updateStatus(id, newStatus);
      await fetchShops();
      setSelected(null);
    } catch (error) {}
  };

  const cancelAdd = () => {
    setPending(null);
    setForm(EMPTY_FORM);
    setFormErr(null);
  };

  const handleAddToggle = () => {
    if (isAddMode) { setAddMode(false); return; }
    setSelected(null);
    cancelAdd();
    setAddMode(true);
  };

  const saveShop = async () => {
    if (!form.name.trim()) { setFormErr("Do'kon nomini kiriting"); return; }
    if (!form.phoneNumber.trim()) { setFormErr("Telefon raqamini kiriting"); return; }
    setSaving(true);
    setFormErr(null);
    try {
      await shopService.createShop({
        name: form.name,
        phoneNumber: form.phoneNumber,
        viloyat: form.viloyat === 'Aniqlanmoqda...' ? '' : form.viloyat,
        tuman: form.tuman === 'Aniqlanmoqda...' ? '' : form.tuman,
        latitude: pendingCoords[0],
        longitude: pendingCoords[1],
      });
      await fetchShops();
      cancelAdd();
    } catch (err) {
      setFormErr("Saqlashda xatolik yuz berdi.");
    } finally {
      setSaving(false);
    }
  };

  const shopsOnMap = shops.filter(shop => {
    if (getCoords(shop) === null) return false;
    if (statusFilter === 'PENDING' && shop.status !== 'PENDING') return false;
    if (statusFilter === 'COMPLETED' && shop.status !== 'COMPLETED') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const addrMatch = [shop.viloyat, shop.tuman].filter(Boolean).join(' ').toLowerCase().includes(q);
      const phoneMatch = (shop.phoneNumber || '').toLowerCase().includes(q);
      if (!addrMatch && !phoneMatch) return false;
    }
    return true;
  });

  if (loading) return (
    <div className="ayla-root ayla-centered">
      <div className="ayla-spinner" />
    </div>
  );

  if (fetchError) return (
    <div className="ayla-root ayla-centered">
      <div style={{ background: 'rgba(255, 59, 48, 0.1)', padding: '12px 20px', borderRadius: '100px' }}>
        <p style={{ color: '#ff3b30', fontSize: '15px', fontWeight: '500', margin: 0 }}>{fetchError}</p>
      </div>
    </div>
  );

  return (
    <div className="ayla-root">
      <style>{CSS_STYLES}</style>

      {/* ── To'liq ekranli Xarita ────────────────────────────────────────────── */}
      <div className="ayla-map-container" style={{ cursor: isAddMode ? 'crosshair' : 'default' }}>
        <YMaps query={{ lang: 'uz_UZ', load: 'package.full' }}>
          <Map
            instanceRef={mapRef}
            defaultState={{ center: TASHKENT, zoom: 12 }}
            width="100%"
            height="100%"
            onClick={onMapClick}
            options={{ suppressMapOpenBlock: true, yandexMapDisablePoiInteractivity: true }}
          >
            <ZoomControl options={{ position: { right: 16, top: '50%' } }} />
            {shopsOnMap.map(shop => (
              <Placemark
                key={shop.id}
                geometry={getCoords(shop)}
                properties={{ iconCaption: shop.name }}
                options={{
                  preset: markerPreset(shop.status, shop.totalDebt),
                  iconCaptionMaxWidth: 110,
                  zIndex: shop.id === selectedShop?.id ? 1000 : undefined,
                }}
                onClick={() => onPlacemarkClick(shop)}
              />
            ))}
            {pendingCoords && (
              <Placemark geometry={pendingCoords} options={{ preset: 'islands#blueCircleDotIcon' }} />
            )}
            {userLocation && (
              <Placemark
                geometry={userLocation}
                options={{ preset: 'islands#geolocationIcon', zIndex: 2000 }}
              />
            )}
          </Map>
        </YMaps>
      </div>

      {/* ── Floating Header ──────────────────────────────────────────────────── */}
      <header className="ayla-floating-header">
        <div className="ayla-search-island">
          <SidebarMenuButton />
          <input
            className="ayla-search-input"
            placeholder="Qidiruv..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className={`ayla-add-btn ${isAddMode ? 'active' : ''}`} onClick={handleAddToggle}>
            {isAddMode ? '✕' : "+ Qo'shish"}
          </button>
        </div>

        <div className="ayla-filter-chips">
          {[
            { key: 'ALL', label: 'Barchasi' },
            { key: 'PENDING', label: 'Bormaganlarim' },
            { key: 'COMPLETED', label: 'Borganlarim' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`ayla-chip ${statusFilter === key ? 'active' : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* ── Floating Utilities ───────────────────────────────────────────────── */}
      {isAddMode && <div className="ayla-hint-pill">Karta ustiga bosing</div>}

      <button className="ayla-fab-location" onClick={handleFindMe} title="Mening joylashuvim">
        {/* Crosshair icon — more iOS native than arrow */}
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
        </svg>
      </button>

      {/* ── Bottom Sheets ────────────────────────────────────────────────────── */}
      {selectedShop && !pendingCoords && (
        <div className="ayla-glass-sheet ayla-slide-up">
          <div className="ayla-sheet-handle" />

          <div className="ayla-sheet-top">
            <span className={`ayla-status-badge ${selectedShop.status === 'COMPLETED' ? 'good' : 'pending'}`}>
              {selectedShop.status === 'COMPLETED' ? '✓ Borganman' : '○ Bormaganman'}
            </span>
            <button className="ayla-close-btn" onClick={() => setSelected(null)}>✕</button>
          </div>

          <h2 className="ayla-sheet-title">{selectedShop.name}</h2>

          <div className="ayla-info-grid">
            <div className="ayla-info-item">
              <span className="ayla-label">Telefon</span>
              <a className="ayla-value link" href={`tel:${selectedShop.phoneNumber}`}>{selectedShop.phoneNumber}</a>
            </div>
            <div className="ayla-info-item">
              <span className="ayla-label">Manzil</span>
              <span className="ayla-value">{[selectedShop.viloyat, selectedShop.tuman].filter(Boolean).join(', ') || "Noma'lum"}</span>
            </div>
            <div className="ayla-info-item" style={{ borderBottom: 'none' }}>
              <span className="ayla-label">Qarz</span>
              <span className={`ayla-value highlight ${selectedShop.totalDebt > 0 ? 'red' : 'green'}`}>
                {formatSum(selectedShop.totalDebt)}
              </span>
            </div>
          </div>

          <div className="ayla-action-row">
            <button
              className="ayla-btn-icon"
              title="Yo'l ko'rsatish"
              onClick={() => window.open(
                `https://yandex.uz/maps/?rtext=~${getCoords(selectedShop)[0]},${getCoords(selectedShop)[1]}&rtt=auto`,
                '_blank'
              )}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 20l-5.447-2.724A2 2 0 013 15.382V5.618a2 2 0 011.106-1.789L9 4l6 3 5.447-2.724A2 2 0 0122 5.618v9.764a2 2 0 01-1.106 1.789L15 20l-6-3z"/>
                <path d="M9 4v16M15 4v16"/>
              </svg>
            </button>
            {selectedShop.status === 'PENDING' ? (
              <button className="ayla-btn-primary" onClick={() => updateShopStatus(selectedShop.id, 'COMPLETED')}>
                Tashrif buyurildi
              </button>
            ) : (
              <button className="ayla-btn-danger" onClick={() => updateShopStatus(selectedShop.id, 'PENDING')}>
                Bekor qilish
              </button>
            )}
          </div>
        </div>
      )}

      {pendingCoords && !selectedShop && (
        <div className="ayla-glass-sheet ayla-slide-up">
          <div className="ayla-sheet-handle" />
          <h2 className="ayla-sheet-title">Yangi do'kon</h2>
          <p className="ayla-sheet-subtitle">{pendingCoords[0].toFixed(5)}, {pendingCoords[1].toFixed(5)}</p>

          <div className="ayla-form-group">
            <input
              className="ayla-input"
              placeholder="Do'kon nomi"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
            />
            <input
              className="ayla-input"
              placeholder="Telefon raqami"
              type="tel"
              value={form.phoneNumber}
              onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
            />
            <div className="ayla-input-row">
              <input className="ayla-input ayla-input-readonly" value={form.viloyat} readOnly placeholder="Viloyat" />
              <input className="ayla-input ayla-input-readonly" value={form.tuman} readOnly placeholder="Tuman" />
            </div>
          </div>

          {formError && <p className="ayla-error-text">{formError}</p>}

          <div className="ayla-action-row">
            <button className="ayla-btn-secondary" onClick={cancelAdd}>Bekor qilish</button>
            <button
              className={`ayla-btn-primary ${saving ? 'loading' : ''}`}
              onClick={saveShop}
              disabled={saving}
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── iOS 26 Liquid Glass Design ───────────────────────────────────────────────
const CSS_STYLES = `
  * { box-sizing: border-box; }

  .ayla-root {
    position: fixed; inset: 0;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow: hidden;
  }

  /* ── Loading ─────────────────────────────────────────────────── */
  .ayla-centered {
    display: flex; align-items: center; justify-content: center;
    height: 100vh; background: #f2f2f7;
  }
  .ayla-spinner {
    width: 28px; height: 28px;
    border: 2.5px solid rgba(0,0,0,0.1);
    border-top-color: #1c1c1e;
    border-radius: 50%;
    animation: ayla-spin 0.75s linear infinite;
  }
  @keyframes ayla-spin { to { transform: rotate(360deg); } }

  /* ── Map Layer ───────────────────────────────────────────────── */
  .ayla-map-container {
    position: absolute; inset: 0; z-index: 1;
  }

  /* ── Floating Header ─────────────────────────────────────────── */
  .ayla-floating-header {
    position: absolute; top: 0; left: 0; right: 0; z-index: 10;
    padding: 12px 14px;
    padding-top: max(14px, env(safe-area-inset-top));
    pointer-events: none;
  }

  /* Search Island — Liquid Glass pill */
  .ayla-search-island {
    display: flex; align-items: center; gap: 8px;
    background: rgba(255, 255, 255, 0.82);
    backdrop-filter: blur(48px) saturate(200%);
    -webkit-backdrop-filter: blur(48px) saturate(200%);
    border: 0.5px solid rgba(255, 255, 255, 0.9);
    border-radius: 100px;
    padding: 6px 6px 6px 14px;
    pointer-events: auto;
    box-shadow:
      0 2px 8px rgba(0, 0, 0, 0.08),
      0 8px 32px rgba(0, 0, 0, 0.10),
      inset 0 0.5px 0 rgba(255,255,255,0.6);
  }

  .ayla-search-input {
    flex: 1; min-width: 0;
    background: transparent; border: none;
    color: #1c1c1e; font-size: 16px; font-weight: 400;
    outline: none; -webkit-appearance: none;
  }
  .ayla-search-input::placeholder { color: rgba(60, 60, 67, 0.4); }

  .ayla-add-btn {
    background: #1c1c1e; color: #fff;
    border: none; border-radius: 100px;
    padding: 9px 18px;
    font-size: 14px; font-weight: 600;
    letter-spacing: -0.2px;
    cursor: pointer;
    flex-shrink: 0;
    transition: opacity 0.2s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-add-btn:active { opacity: 0.75; transform: scale(0.96); }
  .ayla-add-btn.active {
    background: rgba(0, 0, 0, 0.08); color: #1c1c1e;
  }

  /* ── Filter Chips ────────────────────────────────────────────── */
  .ayla-filter-chips {
    display: flex; gap: 8px;
    margin-top: 10px;
    overflow-x: auto; padding-bottom: 2px;
    pointer-events: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x mandatory;
  }
  .ayla-filter-chips::-webkit-scrollbar { display: none; }

  .ayla-chip {
    background: rgba(255, 255, 255, 0.80);
    backdrop-filter: blur(32px) saturate(180%);
    -webkit-backdrop-filter: blur(32px) saturate(180%);
    border: 0.5px solid rgba(255, 255, 255, 0.75);
    color: rgba(60, 60, 67, 0.75);
    padding: 8px 16px; border-radius: 100px;
    font-size: 13px; font-weight: 500;
    cursor: pointer; white-space: nowrap;
    transition: all 0.22s ease;
    scroll-snap-align: start;
    box-shadow: 0 1px 6px rgba(0,0,0,0.07), inset 0 0.5px 0 rgba(255,255,255,0.5);
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-chip:active { transform: scale(0.95); }
  .ayla-chip.active {
    background: #1c1c1e;
    border-color: transparent;
    color: #fff;
    box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  }

  /* ── FAB — Location ──────────────────────────────────────────── */
  .ayla-fab-location {
    position: absolute; right: 14px;
    bottom: max(140px, calc(env(safe-area-inset-bottom) + 130px));
    width: 44px; height: 44px; border-radius: 22px;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(32px) saturate(180%);
    -webkit-backdrop-filter: blur(32px) saturate(180%);
    border: 0.5px solid rgba(255,255,255,0.85);
    color: #1c1c1e;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.10), 0 4px 20px rgba(0,0,0,0.10);
    transition: transform 0.15s, opacity 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-fab-location:active { transform: scale(0.92); opacity: 0.8; }

  /* ── Hint Pill ───────────────────────────────────────────────── */
  .ayla-hint-pill {
    position: absolute; top: 130px;
    left: 50%; transform: translateX(-50%); z-index: 10;
    background: #1c1c1e; color: #fff;
    padding: 8px 20px; border-radius: 100px;
    font-size: 13px; font-weight: 600;
    box-shadow: 0 4px 20px rgba(0,0,0,0.22);
    pointer-events: none;
    animation: ayla-pulse 2s ease-in-out infinite;
    white-space: nowrap;
  }
  @keyframes ayla-pulse {
    0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
    50%       { opacity: 0.85; transform: translateX(-50%) scale(0.97); }
  }

  /* ── Bottom Sheet — Liquid Glass ─────────────────────────────── */
  .ayla-glass-sheet {
    position: absolute; bottom: 10px; left: 10px; right: 10px; z-index: 100;
    background: rgba(255, 255, 255, 0.86);
    backdrop-filter: blur(60px) saturate(200%);
    -webkit-backdrop-filter: blur(60px) saturate(200%);
    border: 0.5px solid rgba(255, 255, 255, 0.9);
    border-radius: 30px;
    padding: 14px 20px 28px;
    box-shadow:
      0 8px 40px rgba(0,0,0,0.12),
      0 2px 8px rgba(0,0,0,0.06),
      inset 0 0.5px 0 rgba(255,255,255,0.7);
  }
  .ayla-slide-up { animation: ayla-slideUp 0.38s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
  @keyframes ayla-slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0);    opacity: 1; }
  }

  .ayla-sheet-handle {
    width: 36px; height: 4px;
    background: rgba(0, 0, 0, 0.15);
    border-radius: 10px; margin: 0 auto 14px;
  }

  /* Sheet Top Row */
  .ayla-sheet-top {
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 6px;
  }
  .ayla-status-badge {
    font-size: 12px; font-weight: 600;
    padding: 4px 10px; border-radius: 100px;
    letter-spacing: -0.1px;
  }
  .ayla-status-badge.good {
    background: rgba(52, 199, 89, 0.12);
    color: #1a7f37;
  }
  .ayla-status-badge.pending {
    background: rgba(255, 59, 48, 0.10);
    color: #c0392b;
  }
  .ayla-close-btn {
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(0, 0, 0, 0.07);
    border: none; color: rgba(60,60,67,0.6);
    font-size: 11px; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-close-btn:active { transform: scale(0.88); background: rgba(0,0,0,0.12); }

  .ayla-sheet-title {
    font-size: 22px; font-weight: 700;
    letter-spacing: -0.5px; margin: 4px 0 2px;
    color: #1c1c1e; line-height: 1.2;
  }
  .ayla-sheet-subtitle {
    font-size: 13px; color: rgba(60,60,67,0.45);
    margin: 0 0 16px; font-variant-numeric: tabular-nums;
    letter-spacing: 0.1px;
  }

  /* Info Grid */
  .ayla-info-grid {
    display: flex; flex-direction: column;
    background: rgba(0,0,0,0.03); border-radius: 16px;
    padding: 0 14px; margin-bottom: 18px;
    border: 0.5px solid rgba(0,0,0,0.05);
  }
  .ayla-info-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 12px 0;
    border-bottom: 0.5px solid rgba(0,0,0,0.06);
  }
  .ayla-info-item:last-child { border-bottom: none; }
  .ayla-label {
    font-size: 14px; color: rgba(60,60,67,0.55); font-weight: 400;
  }
  .ayla-value {
    font-size: 15px; font-weight: 500;
    text-align: right; max-width: 62%; line-height: 1.35;
    color: #1c1c1e;
  }
  .ayla-value.link { color: #007aff; text-decoration: none; }
  .ayla-value.highlight { font-weight: 700; font-size: 16px; }
  .ayla-value.highlight.red { color: #ff3b30; }
  .ayla-value.highlight.green { color: #34c759; }

  /* Form */
  .ayla-form-group {
    display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px;
  }
  .ayla-input {
    background: rgba(0,0,0,0.04);
    border: 0.5px solid rgba(0,0,0,0.08);
    border-radius: 14px; padding: 14px 16px;
    color: #1c1c1e; font-size: 16px; font-family: inherit;
    width: 100%; outline: none;
    transition: border-color 0.2s, background 0.2s;
    -webkit-appearance: none; appearance: none;
  }
  .ayla-input::placeholder { color: rgba(60,60,67,0.35); }
  .ayla-input:focus {
    border-color: rgba(0,0,0,0.25);
    background: rgba(0,0,0,0.06);
  }
  .ayla-input-readonly {
    color: rgba(60,60,67,0.45); pointer-events: none;
  }
  .ayla-input-row { display: flex; gap: 10px; }
  .ayla-error-text {
    color: #ff3b30; font-size: 13px; font-weight: 500;
    margin: -4px 0 10px 4px;
  }

  /* Action Buttons */
  .ayla-action-row { display: flex; gap: 10px; align-items: stretch; }

  .ayla-btn-primary {
    flex: 1; background: #1c1c1e; color: #fff;
    border: none; border-radius: 100px;
    padding: 15px 20px; font-size: 16px; font-weight: 600;
    letter-spacing: -0.3px; cursor: pointer;
    font-family: inherit;
    transition: opacity 0.2s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-btn-primary:active { transform: scale(0.97); opacity: 0.85; }
  .ayla-btn-primary.loading { opacity: 0.55; pointer-events: none; }

  .ayla-btn-secondary {
    flex: 1; background: rgba(0,0,0,0.07); color: #1c1c1e;
    border: none; border-radius: 100px;
    padding: 15px 20px; font-size: 15px; font-weight: 500;
    cursor: pointer; font-family: inherit;
    transition: background 0.2s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-btn-secondary:active { background: rgba(0,0,0,0.12); transform: scale(0.97); }

  .ayla-btn-danger {
    flex: 1; background: rgba(255, 59, 48, 0.10); color: #ff3b30;
    border: none; border-radius: 100px;
    padding: 15px 20px; font-size: 15px; font-weight: 600;
    cursor: pointer; font-family: inherit;
    transition: background 0.2s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-btn-danger:active { background: rgba(255, 59, 48, 0.16); transform: scale(0.97); }

  .ayla-btn-icon {
    width: 52px; height: 52px; flex-shrink: 0;
    background: rgba(0,0,0,0.07);
    border: none; border-radius: 26px;
    color: #1c1c1e;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s;
    -webkit-tap-highlight-color: transparent;
  }
  .ayla-btn-icon:active { background: rgba(0,0,0,0.12); transform: scale(0.92); }
`;

export default MapPage;