import { useState, useEffect, useCallback, useRef } from 'react';
import { YMaps, Map, Placemark, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';
import shopService from './shopService'; // Yangi service importi

// ─── Utilities ────────────────────────────────────────────────────────────────

const formatSum = (v) =>
  new Intl.NumberFormat('uz-UZ').format(Math.round(v || 0)) + " so'm";

/**
 * Handles multiple DTO coordinate field name conventions:
 * - { lat, lon }               — ShopDTO (Alya loyihasi)
 * - { latitude, longitude }    — generic explicit fields
 * - { location: { y, x } }     — JTS Point serialized by Jackson
 * - { location: { coordinates:[lon,lat] } } — GeoJSON Point
 */
const getCoords = (shop) => {
  if (shop.lat != null && shop.lon != null)
    return [+shop.lat, +shop.lon];
  if (shop.latitude != null && shop.longitude != null)
    return [+shop.latitude, +shop.longitude];
  if (shop.location?.y != null && shop.location?.x != null)
    return [+shop.location.y, +shop.location.x];
  if (Array.isArray(shop.location?.coordinates))
    return [shop.location.coordinates[1], shop.location.coordinates[0]];
  return null;
};

const markerPreset = (debt) => {
  if (!debt || debt <= 0)     return 'islands#greenDotIconWithCaption';
  if (debt >= 2_000_000)      return 'islands#redDotIconWithCaption';
  return                      'islands#yellowDotIconWithCaption';
};

// ─── Constants ────────────────────────────────────────────────────────────────

const TASHKENT = [41.2995, 69.2401];

const EMPTY_FORM = { name: '', phoneNumber: '', address: '' };

// ─── Component ────────────────────────────────────────────────────────────────

const MapPage = () => {
  const [shops,         setShops]    = useState([]);
  const [loading,       setLoading]  = useState(true);
  const [fetchError,    setFetchErr] = useState(null);
  const [selectedShop,  setSelected] = useState(null);
  const [isAddMode,     setAddMode]  = useState(false);
  const [pendingCoords, setPending]  = useState(null); // null = no pending, [lat,lon] = form open
  const [form,          setForm]     = useState(EMPTY_FORM);
  const [saving,        setSaving]   = useState(false);
  const [formError,     setFormErr]  = useState(null);
  
  // GPS uchun yangi state
  const [userLocation,  setUserLocation] = useState(null);

  // When a Placemark is clicked it also bubbles to the Map.
  // This ref blocks the Map click handler for one cycle after a Placemark click.
  const skipMapClick = useRef(false);

  // ── Data ──────────────────────────────────────────────────────────────────────
  const fetchShops = useCallback(async () => {
    setFetchErr(null);
    try {
      const data = await shopService.getAllShops();
      setShops(data);
    } catch (err) {
      setFetchErr("Do'konlarni yuklashda xatolik yuz berdi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  // ── GPS Tracking Effect ───────────────────────────────────────────────────────
  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.warn("GPS joylashuvini aniqlab bo'lmadi:", err.message);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 10000, 
          timeout: 5000 
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────────
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

  const closeDetail = () => setSelected(null);

  const startNavigation = () => {
    const c = getCoords(selectedShop);
    if (!c) return;
    window.open(
      `https://yandex.uz/maps/?rtext=~${c[0]},${c[1]}&rtt=auto`,
      '_blank'
    );
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
    if (!form.name.trim())        { setFormErr("Do'kon nomi majburiy");    return; }
    if (!form.phoneNumber.trim()) { setFormErr("Telefon raqam majburiy"); return; }
    setSaving(true);
    setFormErr(null);
    try {
      await shopService.createShop({
        name: form.name,
        phoneNumber: form.phoneNumber,
        address: form.address,
        latitude: pendingCoords[0],
        longitude: pendingCoords[1],
      });
      await fetchShops();
      cancelAdd();
    } catch (err) {
      setFormErr("Saqlashda xatolik. Qaytadan urinib ko'ring.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────
  const shopsOnMap   = shops.filter(s => getCoords(s) !== null);
  const debtorCount  = shops.filter(s => (s.totalDebt || 0) > 0).length;
  const isSheetOpen  = selectedShop !== null || pendingCoords !== null;

  // ── Render: Loading ───────────────────────────────────────────────────────────
  if (loading) return (
    <div style={S.centerScreen}>
      <style>{KEYFRAMES}</style>
      <div style={S.spinner} className="ayla-spin" />
      <p style={S.loadingText}>Yuklanmoqda...</p>
    </div>
  );

  if (fetchError) return (
    <div style={S.centerScreen}>
      <p style={{ color: '#f87171', fontSize: 14, textAlign: 'center', maxWidth: 260 }}>
        {fetchError}
      </p>
      <button style={S.retryBtn} onClick={fetchShops}>Qaytadan urinish</button>
    </div>
  );

  // ── Render: Main ──────────────────────────────────────────────────────────────
  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={S.root}>

        {/* ── Floating Header ─────────────────────────────────────────────────── */}
        <header style={S.header}>
          <div>
            <div style={S.headerTitle}>Do'konlar xaritasi</div>
            <div style={S.chips}>
              <span style={S.chip}>{shops.length} ta do'kon</span>
              {debtorCount > 0 && (
                <span style={{ ...S.chip, ...S.chipDanger }}>
                  {debtorCount} qarzdor
                </span>
              )}
            </div>
          </div>
          <button
            style={{ ...S.addBtn, ...(isAddMode ? S.addBtnActive : {}) }}
            onClick={handleAddToggle}
          >
            {isAddMode ? "✕ Bekor" : "+ Qo'shish"}
          </button>
        </header>

        {/* ── Add-mode instruction pill ────────────────────────────────────────── */}
        {isAddMode && (
          <div style={S.hintPill}>
            📍 Xaritada joy tanlang
          </div>
        )}

        {/* ── Map (full-screen base layer) ─────────────────────────────────────── */}
        <div style={{ ...S.mapWrap, cursor: isAddMode ? 'crosshair' : 'default' }}>
          <YMaps>
            <Map
              defaultState={{ center: TASHKENT, zoom: 12 }}
              width="100%"
              height="100%"
              onClick={onMapClick}
              options={{ suppressMapOpenBlock: true }}
            >
              <ZoomControl         options={{ position: { right: 14, top: isSheetOpen ? 300 : 100 } }} />
              <GeolocationControl options={{ position: { right: 14, top: isSheetOpen ? 378 : 178 } }} />

              {shopsOnMap.map(shop => (
                <Placemark
                  key={shop.id}
                  geometry={getCoords(shop)}
                  properties={{
                    iconCaption: shop.name,
                    hintContent: `${shop.name} · ${formatSum(shop.totalDebt)}`,
                  }}
                  options={{
                    preset: markerPreset(shop.totalDebt),
                    iconCaptionMaxWidth: 130,
                    zIndex: shop.id === selectedShop?.id ? 1000 : undefined,
                  }}
                  onClick={() => onPlacemarkClick(shop)}
                />
              ))}

              {/* Blue pin for pending (not-yet-saved) shop location */}
              {pendingCoords && (
                <Placemark
                  geometry={pendingCoords}
                  options={{ preset: 'islands#blueDotIcon' }}
                />
              )}

              {/* 🟢 Userning joriy joylashuvi (GPS) */}
              {userLocation && (
                <Placemark
                  geometry={userLocation}
                  options={{
                    preset: 'islands#redCircleDotIcon',
                    iconColor: '#ccff00', 
                    zIndex: 2000, 
                  }}
                  properties={{
                    hintContent: "Sizning joylashuvingiz",
                    iconCaption: "Men"
                  }}
                />
              )}

            </Map>
          </YMaps>
        </div>

        {/* ── Bottom sheet: Shop detail ─────────────────────────────────────────── */}
        {selectedShop && !pendingCoords && (
          <div style={S.sheet}>
            <div style={S.sheetHandle} />

            {/* Status row */}
            <div style={S.sheetTopRow}>
              <span style={{
                ...S.statusBadge,
                ...(selectedShop.totalDebt > 0 ? S.badgeDanger : S.badgeGood),
              }}>
                {selectedShop.totalDebt > 0 ? '🔴 Qarzdor' : "🟢 To'langan"}
              </span>
              <button style={S.closeX} onClick={closeDetail} aria-label="Yopish">✕</button>
            </div>

            <h2 style={S.shopName}>{selectedShop.name}</h2>

            <div style={S.infoBlock}>
              <InfoRow label="Telefon">
                <a style={S.phoneLink} href={`tel:${selectedShop.phoneNumber}`}>
                  📞 {selectedShop.phoneNumber}
                </a>
              </InfoRow>

              {selectedShop.address && (
                <InfoRow label="Manzil">
                  <span style={S.infoValue}>📍 {selectedShop.address}</span>
                </InfoRow>
              )}

              <InfoRow label="Joriy qarz">
                <span style={{
                  ...S.debtNumber,
                  color: selectedShop.totalDebt > 0 ? '#f87171' : '#86efac',
                }}>
                  {formatSum(selectedShop.totalDebt)}
                </span>
              </InfoRow>
            </div>

            <div style={S.btnRow}>
              <button style={S.primaryBtn} onClick={startNavigation}>
                🚗 Boshlash
              </button>
              <button style={S.secondaryBtn}>
                📋 Tarix
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom sheet: Add shop form ───────────────────────────────────────── */}
        {pendingCoords && !selectedShop && (
          <div style={S.sheet}>
            <div style={S.sheetHandle} />
            <p style={S.sheetTitle}>Yangi do'kon qo'shish</p>

            <span style={S.coordTag}>
              📍 {pendingCoords[0].toFixed(5)}, {pendingCoords[1].toFixed(5)}
            </span>

            <input
              style={S.input}
              placeholder="Do'kon nomi *"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              autoFocus
            />
            <input
              style={S.input}
              placeholder="Telefon raqami * (+998 90 123 45 67)"
              type="tel"
              value={form.phoneNumber}
              onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
            />
            <input
              style={S.input}
              placeholder="Manzil (ixtiyoriy)"
              value={form.address}
              onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            />

            {formError && <p style={S.formError}>{formError}</p>}

            <div style={S.btnRow}>
              <button style={S.secondaryBtn} onClick={cancelAdd}>
                Bekor
              </button>
              <button
                style={{
                  ...S.primaryBtn,
                  opacity: saving ? 0.6 : 1,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
                onClick={saveShop}
                disabled={saving}
              >
                {saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

// ─── Small helper component ───────────────────────────────────────────────────

const InfoRow = ({ label, children }) => (
  <div style={S.infoRow}>
    <span style={S.infoLabel}>{label}</span>
    {children}
  </div>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const KEYFRAMES = `
  @keyframes ayla-spin { to { transform: rotate(360deg); } }
  .ayla-spin { animation: ayla-spin 0.8s linear infinite; }
`;

const S = {
  root: {
    position: 'fixed',
    inset: 0,
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    background: '#000',
    WebkitFontSmoothing: 'antialiased',
  },
  centerScreen: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    background: '#000',
  },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #1e1e1e',
    borderTop: '3px solid #ccff00',
    borderRadius: '50%',
  },
  loadingText: {
    color: '#555',
    fontSize: 14,
    margin: 0,
  },
  retryBtn: {
    marginTop: 8,
    background: '#1e1e1e',
    color: '#ccc',
    border: '1px solid #333',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    cursor: 'pointer',
  },

  // Header
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: 'rgba(0,0,0,0.90)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(204,255,0,0.10)',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: '-0.3px',
    lineHeight: 1,
  },
  chips: {
    display: 'flex',
    gap: 6,
    marginTop: 5,
  },
  chip: {
    fontSize: 11,
    fontWeight: 600,
    background: '#1e1e1e',
    color: '#666',
    padding: '2px 8px',
    borderRadius: 10,
    border: '1px solid #2a2a2a',
  },
  chipDanger: {
    background: '#2d0000',
    color: '#f87171',
    border: '1px solid #3d0000',
  },
  addBtn: {
    background: '#ccff00',
    color: '#000',
    border: 'none',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    letterSpacing: '-0.2px',
    transition: 'background 0.15s, color 0.15s',
  },
  addBtnActive: {
    background: '#2a2a2a',
    color: '#ccc',
  },

  // Hint pill
  hintPill: {
    position: 'absolute',
    top: 68,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 100,
    background: '#ccff00',
    color: '#000',
    fontSize: 13,
    fontWeight: 700,
    padding: '10px 22px',
    borderRadius: 99,
    boxShadow: '0 4px 24px rgba(204,255,0,0.30)',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    letterSpacing: '-0.2px',
  },

  // Map layer
  mapWrap: {
    position: 'absolute',
    inset: 0,
  },

  // Bottom sheet (shared by detail + form)
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    zIndex: 200,
    background: '#111',
    borderRadius: '20px 20px 0 0',
    padding: '10px 20px 40px',
    boxShadow: '0 -16px 48px rgba(0,0,0,0.75)',
    borderTop: '1px solid rgba(255,255,255,0.07)',
    maxHeight: '72vh',
    overflowY: 'auto',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    background: '#2a2a2a',
    borderRadius: 2,
    margin: '0 auto 18px',
  },

  // Detail sheet
  sheetTopRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: 700,
    padding: '4px 12px',
    borderRadius: 99,
    border: '1px solid transparent',
  },
  badgeDanger: {
    background: '#2d0000',
    color: '#f87171',
    borderColor: '#3d0a0a',
  },
  badgeGood: {
    background: '#052000',
    color: '#86efac',
    borderColor: '#0a3300',
  },
  closeX: {
    background: '#1e1e1e',
    border: '1px solid #2a2a2a',
    color: '#666',
    cursor: 'pointer',
    width: 30,
    height: 30,
    borderRadius: '50%',
    fontSize: 13,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flexShrink: 0,
  },
  shopName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 18px',
    letterSpacing: '-0.6px',
    lineHeight: 1.2,
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    marginBottom: 22,
  },
  infoRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
  },
  infoLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
  },
  infoValue: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 1.4,
  },
  phoneLink: {
    color: '#ccff00',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: 16,
    letterSpacing: '-0.2px',
  },
  debtNumber: {
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: '-0.8px',
    lineHeight: 1,
  },

  // Buttons
  btnRow: {
    display: 'flex',
    gap: 10,
  },
  primaryBtn: {
    flex: 2,
    background: '#ccff00',
    color: '#000',
    border: 'none',
    borderRadius: 12,
    padding: '15px',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    letterSpacing: '-0.2px',
  },
  secondaryBtn: {
    flex: 1,
    background: '#1a1a1a',
    color: '#bbb',
    border: '1px solid #2a2a2a',
    borderRadius: 12,
    padding: '15px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },

  // Add form
  sheetTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    margin: '0 0 12px',
    letterSpacing: '-0.4px',
  },
  coordTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: '#1a2500',
    color: '#ccff00',
    fontSize: 12,
    fontWeight: 600,
    padding: '6px 12px',
    borderRadius: 8,
    marginBottom: 18,
    border: '1px solid #2a3d00',
    letterSpacing: '-0.1px',
  },
  input: {
    display: 'block',
    width: '100%',
    background: '#181818',
    border: '1px solid #2a2a2a',
    borderRadius: 10,
    padding: '13px 14px',
    color: '#fff',
    fontSize: 15,
    marginBottom: 10,
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
  },
  formError: {
    color: '#f87171',
    fontSize: 13,
    margin: '0 0 12px',
    fontWeight: 500,
  },
};

export default MapPage;