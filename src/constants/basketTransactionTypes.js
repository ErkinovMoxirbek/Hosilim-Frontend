import {
  ArrowUpRight,
  ArrowDownLeft,
  PackageCheck,
  AlertTriangle,
  RotateCcw,
  Ban,
  PackagePlus,
  HelpCircle,
} from 'lucide-react';

/**
 * BasketTransactionType uchun UI sozlamalari.
 * `column`:
 *   'given'     -> "Tarqatildi" ustunida ko'rsatiladi
 *   'returned'  -> "Qaytarildi" ustunida ko'rsatiladi
 *   'cancelled' -> "Bekor qilindi" ustunida ko'rsatiladi
 *   null        -> faqat "Holati" belgisida (miqdori bilan birga)
 */
export const BASKET_STATUS_CONFIG = {
  GIVEN_TO_FARMER: {
    label: 'Berildi',
    icon: ArrowUpRight,
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
    column: 'given',
  },
  RETURNED_EMPTY: {
    label: "Bo'sh qaytdi",
    icon: ArrowDownLeft,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    column: 'returned',
  },
  RETURNED_WITH_CROP: {
    label: 'Hosil bilan qaytdi',
    icon: PackageCheck,
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    column: 'returned',
  },
  LOST_PAID: {
    label: "Yo'qoldi, to'landi",
    icon: AlertTriangle,
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    column: 'returned',
  },
  CANCEL_REVERSAL: {
    label: 'Bekor qilindi',
    icon: RotateCcw,
    badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
    column: 'cancelled',
  },
  QUALITY_REJECTION: {
    label: 'Sifatsiz, rad etildi',
    icon: Ban,
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
    column: null,
  },
  RECEIVED: {
    label: 'Punktga qabul qilindi',
    icon: PackagePlus,
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    column: null,
  },
};

export const DEFAULT_BASKET_STATUS = {
  label: "Noma'lum holat",
  icon: HelpCircle,
  badgeClass: 'bg-slate-50 text-slate-400 border-slate-200',
  column: null,
};

export const getBasketStatusConfig = (type) =>
  BASKET_STATUS_CONFIG[type] || DEFAULT_BASKET_STATUS;