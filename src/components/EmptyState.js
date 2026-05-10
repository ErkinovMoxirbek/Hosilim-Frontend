// src/components/EmptyState.tsx
import { ReactNode } from 'react';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex-1 flex flex-col items-center justify-center border border-dashed rounded-3xl p-12 text-center bg-gray-50/50 min-h-[400px] gap-5">
    <div className="text-gray-300">{icon}</div>
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    <p className="text-gray-500 text-sm max-w-sm">{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
      >
        {icon && <span className="w-4">{icon}</span>}
        {actionLabel}
      </button>
    )}
  </div>
);
