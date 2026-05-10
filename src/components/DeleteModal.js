import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Fragment } from 'react';
import classNames from 'classnames';

type DeleteModalProps = {
  isOpen: boolean;
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export const DeleteModal = ({
  isOpen,
  name,
  onCancel,
  onConfirm,
  loading = false,
}: DeleteModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* shade */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      {/* dialog */}
      <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          O'chirishni tasdiqlang
        </h3>
        <p className="text-gray-500 text-sm mb-6">
          <span className="font-semibold">{name}</span> xolodilnikini o‘chirishingizga
          ishonchingiz komilmi? Bu amalni ortga qaytarib bo‘lmaydi.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'O‘chir'}
          </button>
        </div>
      </div>
    </div>
  );
};
