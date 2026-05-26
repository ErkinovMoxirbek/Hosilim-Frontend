import React, { useState, useEffect } from 'react';
import { X, Loader2, ArrowRight } from 'lucide-react';
import { stockService } from '../services/stockService';

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TransferModal({ isOpen, onClose, stock, fridges, exporters, onSuccess }) {
  const [type, setType] = useState('FRIDGE');
  const [form, setForm] = useState({
    targetFridgeId: '',
    targetExporterId: '',
    basketCount: '',
    price: '',
  });
  const [calc, setCalc]             = useState(null);
  const [isCalcLoading, setCalcLoad] = useState(false);
  const [isSubmitting, setSubmit]    = useState(false);

  const dBaskets = useDebounce(form.basketCount, 550);
  const dPrice   = useDebounce(form.price,       550);

  // ── API-driven calculation (no frontend math) ────────────────────────────
  useEffect(() => {
    if (type !== 'EXPORTER' || !stock?.stockId || !dBaskets || !dPrice) {
      setCalc(null);
      return;
    }
    let alive = true;
    setCalcLoad(true);
    stockService
      .calculateExport(stock.stockId, {
        stockId:     stock.stockId,
        basketCount: Number(dBaskets),
        price:       Number(dPrice),
      })
      .then(r  => { if (alive) setCalc(r); })
      .catch(() => { if (alive) setCalc(null); })
      .finally(()=> { if (alive) setCalcLoad(false); });
    return () => { alive = false; };
  }, [type, stock?.stockId, dBaskets, dPrice]);

  // ── Reset on close ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) {
      setType('FRIDGE');
      setForm({ targetFridgeId: '', targetExporterId: '', basketCount: '', price: '' });
      setCalc(null);
    }
  }, [isOpen]);

  if (!isOpen || !stock) return null;

  const bCount     = Number(form.basketCount) || 0;
  const isOverLimit = bCount > stock.basketCount;

  const canSubmit = !isSubmitting && !isOverLimit && bCount > 0 && (
    type === 'FRIDGE'
      ? !!form.targetFridgeId
      : !!form.targetExporterId && !!form.price && !!calc
  );

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSubmit(true);
      if (type === 'FRIDGE') {
        await stockService.transferStock(stock.stockId, {
          targetFridgeId: Number(form.targetFridgeId),
          basketCount:    bCount,
        });
      } else {
        await stockService.exportStock(stock.stockId, {
          exporterId:            Number(form.targetExporterId),
          basketCount:           bCount,
          customPricePerKg:      Number(form.price),
          calculatedNetWeight:   calc?.projectedNetWeight,
          calculatedTotalAmount: calc?.projectedTotalAmount,
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmit(false);
    }
  };

  // ── Derived UI tokens ────────────────────────────────────────────────────
  const isFridge = type === 'FRIDGE';
  const ring     = isFridge ? 'focus:ring-blue-500/20'  : 'focus:ring-amber-500/20';
  const btn      = isFridge
    ? 'bg-blue-600  hover:bg-blue-700  disabled:bg-blue-600'
    : 'bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500';

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/25 backdrop-blur-[2px]"
        onClick={() => !isSubmitting && onClose()}
      />

      {/* Card */}
      <div className="relative w-full sm:max-w-[400px] bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="px-6 pt-7 pb-5 flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black tracking-[0.14em] uppercase text-gray-300 mb-1">
              Yuk boshqaruvi
            </p>
            <h2 className="text-2xl font-black text-gray-950 font-['Syne',sans-serif] leading-none">
              {stock.fruitName}
            </h2>
          </div>
          <button
            onClick={() => !isSubmitting && onClose()}
            className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-gray-700 hover:bg-gray-100 transition-all"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* ── Stock badge ─────────────────────────────────────────────────── */}
        <div className="mx-6 mb-5 flex items-center justify-between py-2.5 border-y border-gray-100">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Mavjud zaxira
          </span>
          <span className="font-['DM_Mono',monospace] text-sm font-bold text-gray-700 tabular-nums">
            {stock.basketCount.toLocaleString()} savat
          </span>
        </div>

        {/* ── Type toggle ─────────────────────────────────────────────────── */}
        <div className="px-6 mb-6">
          <div className="relative flex bg-gray-100/80 rounded-2xl p-1 gap-1">
            <div
              className="absolute top-1 bottom-1 rounded-[14px] bg-white shadow-sm transition-all duration-300 ease-out"
              style={{
                left:  isFridge ? '4px' : 'calc(50% + 2px)',
                width: 'calc(50% - 6px)',
              }}
            />
            {[
              { id: 'FRIDGE',   label: '❄️  Muzlatgich', color: 'text-blue-600'  },
              { id: 'EXPORTER', label: '✈️  Eksport',    color: 'text-amber-600' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`relative flex-1 py-2.5 text-[12px] font-black rounded-[14px] transition-colors duration-200 tracking-wide
                  ${type === t.id ? t.color : 'text-gray-400 hover:text-gray-500'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────────────── */}
        <form id="tm-form" onSubmit={handleSubmit} className="px-6 space-y-4 pb-6">

          {/* Selector */}
          {isFridge ? (
            <Field label="Kamera">
              <select
                required value={form.targetFridgeId} onChange={set('targetFridgeId')}
                className={`w-full bg-gray-50 border-0 rounded-2xl px-4 py-3.5 text-[13px] font-bold text-gray-900
                  focus:outline-none focus:ring-2 focus:bg-white transition-all ${ring} cursor-pointer appearance-none`}
              >
                <option value="" disabled>Kamerani tanlang…</option>
                {fridges.map(f => (
                  <option key={f.id} value={f.id}>{f.name} · {f.temperatureCelsius}°C</option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="Hamkor">
              <select
                required value={form.targetExporterId} onChange={set('targetExporterId')}
                className={`w-full bg-gray-50 border-0 rounded-2xl px-4 py-3.5 text-[13px] font-bold text-gray-900
                  focus:outline-none focus:ring-2 focus:bg-white transition-all ${ring} cursor-pointer appearance-none`}
              >
                <option value="" disabled>Hamkorni tanlang…</option>
                {exporters.map(ex => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} {ex.surname} · {ex.phoneNumber}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {/* Basket count — giant number */}
          <Field
            label="Savatlar soni"
            aside={
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, basketCount: String(stock.basketCount) }))}
                className="text-[10px] font-black uppercase tracking-wider text-blue-500 hover:text-blue-700 transition-colors"
              >
                Barchasi
              </button>
            }
          >
            <div className="relative">
              <input
                required
                type="number"
                min="1"
                max={stock.basketCount}
                value={form.basketCount}
                onChange={set('basketCount')}
                placeholder="0"
                className={`w-full bg-gray-50 border-0 rounded-2xl pl-4 pr-20 py-3.5
                  font-['DM_Mono',monospace] text-[32px] font-black tabular-nums leading-none
                  text-gray-950 placeholder-gray-200 focus:outline-none focus:ring-2 focus:bg-white transition-all
                  ${isOverLimit ? 'ring-2 ring-red-300/80 bg-red-50' : ring}`}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase tracking-wider pointer-events-none">
                savat
              </span>
            </div>
            {isOverLimit && (
              <p className="text-[11px] text-red-500 font-bold mt-1.5 pl-1">
                Maksimal: {stock.basketCount} ta savat
              </p>
            )}
          </Field>

          {/* Price (export only) */}
          {!isFridge && (
            <Field label="Narx (so'm/kg)">
              <div className="relative">
                <input
                  required
                  type="number"
                  min="0"
                  step="any"
                  value={form.price}
                  onChange={set('price')}
                  placeholder="0"
                  className={`w-full bg-gray-50 border-0 rounded-2xl pl-4 pr-16 py-3.5
                    font-['DM_Mono',monospace] text-[32px] font-black tabular-nums leading-none
                    text-gray-950 placeholder-gray-200 focus:outline-none focus:ring-2 focus:bg-white transition-all ${ring}`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-gray-300 uppercase tracking-wider pointer-events-none">
                  so'm
                </span>
              </div>
            </Field>
          )}

          {/* ── Calculation result card (export only) ─────────────────────── */}
          {!isFridge && bCount > 0 && (
            <div
              className={`rounded-2xl overflow-hidden transition-all duration-500
                ${isCalcLoading || !calc ? 'opacity-50 scale-[0.98]' : 'opacity-100 scale-100'}`}
            >
              <div className="bg-gray-950 px-5 py-4">
                {isCalcLoading ? (
                  <div className="flex items-center gap-2.5 py-1">
                    <Loader2 size={13} className="animate-spin text-gray-500" />
                    <span className="text-xs font-bold text-gray-500 tracking-wider">
                      Hisoblanmoqda…
                    </span>
                  </div>
                ) : calc ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-500 mb-1.5">
                        Sof vazn
                      </p>
                      <p className="font-['DM_Mono',monospace] font-black text-[26px] leading-none text-white tabular-nums">
                        {Number(calc.projectedNetWeight).toFixed(2)}
                        <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-500 mb-1.5">
                        Jami summa
                      </p>
                      <p className="font-['DM_Mono',monospace] font-black text-[22px] leading-none text-emerald-400 tabular-nums">
                        {Number(calc.projectedTotalAmount).toLocaleString('uz-UZ')}
                        <span className="text-sm font-normal text-emerald-700 ml-1">so'm</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-gray-600 py-1 tracking-wide">
                    Narx va savatlar sonini kiriting
                  </p>
                )}
              </div>
            </div>
          )}
        </form>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="px-6 pb-7 pt-1 flex gap-2.5">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="py-3.5 px-5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl transition-colors disabled:opacity-50 text-[13px]"
          >
            Bekor
          </button>
          <button
            type="submit"
            form="tm-form"
            disabled={!canSubmit}
            className={`flex-1 py-3.5 font-bold rounded-2xl transition-all flex items-center justify-center gap-2
              text-[13px] text-white shadow-sm disabled:opacity-40 disabled:cursor-not-allowed ${btn}`}
          >
            {isSubmitting ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <>
                {isFridge ? 'Kameraga kiritish' : 'Eksportga sotish'}
                <ArrowRight size={14} strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Tiny helper ─────────────────────────────────────────────────────────────
function Field({ label, aside, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-0.5">
        <label className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
          {label}
        </label>
        {aside}
      </div>
      {children}
    </div>
  );
}