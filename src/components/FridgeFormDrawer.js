import { X, Plus, Loader2 } from 'lucide-react';
import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateFridge } from '../hooks/useFridges';
import { Toast } from './Toast';

const schema = yup.object().shape({
  name: yup.string().required('Nomlanishi talab qilinadi.'),
  address: yup.string().required('Manzilni kiriting.'),
  maxCapacity: yup
    .number()
    .typeError('Raqam kiriting')
    .positive('Musbat son bo‘lishi kerak')
    .required('Sig‘imni kiriting.'),
  temperatureCelsius: yup.number().nullable(),
  managerPhone: yup
    .string()
    .matches(/^(\+?\d{1,3})?\s?\d{9,12}$/, {
      message: 'Telefon raqam noto‘g‘ri formatda',
      excludeEmptyString: true,
    })
    .nullable(),
});

export const FridgeFormDrawer = ({ isOpen, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const createFridge = useCreateFridge();

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const showToast = (msg, type = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const onSubmit = async (data) => {
    try {
      await createFridge.mutateAsync(data);
      onClose();
      showToast('Yangi xolodilnik qo‘shildi', 'success');
      reset(); // clean form
    } catch (e) {
      showToast(e?.message ?? 'Saqlashda xatolik', 'error');
    }
  };

  // Drawer yopilganda forma ro'yxatini tozalash
  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Shade (Backdrop) */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 font-inter">
        
        <header className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Yangi xolodilnik</h2>
          <button
            onClick={isSubmitting ? undefined : onClose}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </header>

        <form
          id="fridge-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-5 text-sm"
        >
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Nomlanishi *</label>
            <input
              {...register('name')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium ${errors.name ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`}
              placeholder="Masalan: Markaziy muzlatgich 1"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.name.message}</p>}
          </div>

          {/* Manzil */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Manzil *</label>
            <input
              {...register('address')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium ${errors.address ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`}
              placeholder="Tuman, ko'cha, mahalla"
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.address.message}</p>}
          </div>

          {/* Sig'im va Harorat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Sig‘im (tn) *</label>
              <input
                type="number"
                step="0.01"
                {...register('maxCapacity')}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-mono font-bold ${errors.maxCapacity ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`}
                placeholder="0.0"
                disabled={isSubmitting}
              />
              {errors.maxCapacity && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.maxCapacity.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Harorat (°C)</label>
              <input
                type="number"
                step="0.1"
                {...register('temperatureCelsius')}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-mono font-bold"
                placeholder="-5.0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          {/* Menejer */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mas'ul shaxs (Menejer)</label>
            <input
              {...register('managerName')}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
              placeholder="Ism familiya"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1">Telefon raqam</label>
            <input
              {...register('managerPhone')}
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all font-mono font-medium ${errors.managerPhone ? 'border-red-500 bg-red-50/50' : 'border-slate-200'}`}
              placeholder="+998 90 123 45 67"
              disabled={isSubmitting}
            />
            {errors.managerPhone && <p className="text-[11px] font-semibold text-red-500 ml-1">{errors.managerPhone.message}</p>}
          </div>
        </form>

        {/* Footer actions */}
        <footer className="p-5 border-t border-slate-100 bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="fridge-form"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} strokeWidth={2.5} />}
            Saqlash
          </button>
        </footer>
      </aside>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </Fragment>
  );
};