import {
  X, Plus, Loader2,
} from 'lucide-react';
import { Fragment, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useCreateFridge } from '../hooks/useFridges';
import { Toast } from './Toast';
import { Fridge } from '../types/fridge';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type FormValues = {
  name: string;
  address: string;
  maxCapacity: number;
  temperatureCelsius?: number;
  managerName?: string;
  managerPhone?: string;
};

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

export const FridgeFormDrawer = ({ isOpen, onClose }: Props) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const createFridge = useCreateFridge();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      await createFridge.mutateAsync(data);
      onClose();
      showToast('Yangi xolodilnik qo‘shildi', 'success');
      reset(); // clean form
    } catch (e: any) {
      showToast(e?.message ?? 'Saqlashda xatolik', 'error');
    }
  };

  // Toast handling
  const [toast, setToast] = useState<{show:boolean, message:string, type:'success'|'error'}>({show:false, message:'', type:'success'});
  const showToast = (msg:string, type:'success'|'error'='success') => {
    setToast({show:true, message:msg, type});
    setTimeout(()=>setToast({show:false, message:'', type:'success'}), 3500);
  };

  // Drawer paint ferm: Yopilganida forma ro‘yxatni tozalash.
  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* shade */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />
      {/* drawer */}
      <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <header className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold">Yangi xolodilnik</h2>
          <button
            onClick={isSubmitting ? undefined : onClose}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            aria-label="Yopish"
          >
            <X size={20} />
          </button>
        </header>

        <form
          id="fridge-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-5 space-y-4 text-sm"
        >
          {/* Nom */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500">Nomlanishi *</label>
            <input
              {...register('name')}
              className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Kamera #1"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
          </div>

          {/* Manzil */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500">Manzil *</label>
            <input
              {...register('address')}
              className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${errors.address ? 'border-red-500' : ''}`}
              placeholder="To‘liq manzil"
              disabled={isSubmitting}
            />
            {errors.address && <p className="text-xs text-red-600">{errors.address.message}</p>}
          </div>

          {/* Sig‘im + Harorat */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-gray-500">Sig‘im (tn) *</label>
              <input
                type="number"
                step="0.01"
                {...register('maxCapacity')}
                className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${errors.maxCapacity ? 'border-red-500' : ''}`}
                placeholder="100"
                disabled={isSubmitting}
              />
              {errors.maxCapacity && <p className="text-xs text-red-600">{errors.maxCapacity.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-gray-500">Harorat (°C)</label>
              <input
                type="number"
                step="0.1"
                {...register('temperatureCelsius')}
                className="w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
                placeholder="-5.0"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          {/* Menejer */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500">Mas'ul shaxs (Menejer)</label>
            <input
              {...register('managerName')}
              className="w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white"
              placeholder="Ism familiyasi"
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase text-gray-500">Telefon raqam</label>
            <input
              {...register('managerPhone')}
              className={`w-full p-2.5 bg-gray-50 border rounded-xl focus:outline-none focus:border-blue-500 focus:bg-white ${errors.managerPhone ? 'border-red-500' : ''}`}
              placeholder="+998 90 123 45 67"
              disabled={isSubmitting}
            />
            {errors.managerPhone && <p className="text-xs text-red-600">{errors.managerPhone.message}</p>}
          </div>
        </form>

        {/* Footer actions */}
        <footer className="p-5 border-t border-gray-100 bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="fridge-form"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-blue-200"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
            Saqlash
          </button>
        </footer>
      </aside>

      {/* Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />}
    </Fragment>
  );
};
