import React from 'react';
export default function PageHeader({ 
  title, 
  subtitle, 
  icon: Icon, 
  iconBg = "bg-emerald-100", 
  iconColor = "text-emerald-800",
  rightElement 
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 font-inter">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className={`w-12 h-12 ${iconBg} ${iconColor} rounded-xl flex items-center justify-center shadow-sm shrink-0`}>
            <Icon size={22} strokeWidth={2.5} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      
      {/* Agar o'ng tomonda statistika (Pill) yoki tugma bo'lsa */}
      {rightElement && (
        <div className="shrink-0 w-full sm:w-auto">
          {rightElement}
        </div>
      )}
    </div>
  );
}