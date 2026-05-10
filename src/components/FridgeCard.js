import { 
  MapPin, User, Phone, ThermometerSnowflake, ThermometerSun,
  Trash2, AlertCircle 
} from 'lucide-react';
import { memo, useCallback } from 'react';
import { Fridge } from '../types/fridge';
import { formatNumber } from '../utils/format';

type FridgeCardProps = {
  fridge: Fridge;
  onDelete: (id: string, name: string, currentCap: number) => void;
};

const statusBadge = (status: Fridge['status']) => {
  switch (status) {
    case 'ACTIVE':
      return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Ishlamoqda</span>;
    case 'MAINTENANCE':
      return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Ta'mirda</span>;
    case 'FULL':
      return <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">To'lgan</span>;
    default:
      return <span className="bg-gray-50 text-gray-700 border border-gray-200 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Noma'lum</span>;
  }
};

export const FridgeCard = memo(({ fridge, onDelete }: FridgeCardProps) => {
  const current = fridge.currentCapacity ?? 0;
  const max = fridge.maxCapacity ?? 1;
  const percent = Math.min(Math.round((current / max) * 100), 100);
  const isFull = percent >= 95;
  const isCold = fridge.temperatureCelsius < 0;

  const handleDelete = useCallback(() => {
    onDelete(fridge.id, fridge.name, current);
  }, [fridge.id, fridge.name, current, onDelete]);

  return (
    <article
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
      aria-labelledby={`fridge-${fridge.id}-title`}
    >
      {/* Header */}
      <header className="p-5 border-b border-gray-100 flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h2 id={`fridge-${fridge.id}-title`} className="text-[18px] font-bold text-gray-900 mb-1.5 leading-tight">
            {fridge.name}
          </h2>
          {statusBadge(fridge.status)}
        </div>
        <button
          onClick={handleDelete}
          className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
          aria-label={`"${fridge.name}" xolodilnikini o'chirish`}
        >
          <Trash2 size={18} />
        </button>
      </header>

      {/* Body */}
      <section className="p-5 flex-1 flex flex-col gap-4 text-sm bg-gray-50/30">
        {/* Details */}
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-2.5 text-gray-600">
            <MapPin size={16} className="text-gray-400 shrink-0" />
            <span className="font-medium truncate">{fridge.address}</span>
          </p>
          <p className="flex items-center gap-2.5 text-gray-600">
            <User size={16} className="text-gray-400 shrink-0" />
            <span className="font-medium truncate">{fridge.managerName || 'Biriktirilmagan'}</span>
          </p>
          <p className="flex items-center gap-2.5 text-gray-600">
            <Phone size={16} className="text-gray-400 shrink-0" />
            <span className="font-mono">{fridge.managerPhone || '---'}</span>
          </p>
        </div>

        {/* Harorat */}
        <div className={`flex justify-between items-center p-3 rounded-xl border ${isCold ? 'bg-blue-50/50 border-blue-100' : 'bg-orange-50/50 border-orange-100'}`}>
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Harorat</span>
          <div className={`flex items-center gap-1.5 font-bold ${isCold ? 'text-blue-600' : 'text-orange-600'}`}>
            {isCold ? <ThermometerSnowflake size={16} /> : <ThermometerSun size={16} />}
            <span className="font-mono text-base">{fridge.temperatureCelsius > 0 ? '+' : ''}{fridge.temperatureCelsius}°C</span>
          </div>
        </div>

        {/* Sig'im progress */}
        <div className="mt-auto bg-white p-3 rounded-xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Joriy sig'im</span>
            <span className="font-mono text-xs font-semibold text-gray-500">
              <span className={`text-sm ${isFull ? 'text-red-600 font-bold' : 'text-gray-900 font-black'}`}>{formatNumber(current)}</span> / {formatNumber(max)} tn
            </span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : percent > 75 ? 'bg-amber-400' : 'bg-blue-500'}`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </section>
    </article>
  );
});
