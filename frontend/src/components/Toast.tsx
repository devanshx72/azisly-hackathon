import React, { useEffect } from 'react';
import { Leaf } from 'lucide-react';

interface ToastProps {
  toast: { message: string; subtext?: string } | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 transition-all duration-300 animate-slide-in">
      <div className="bg-[#F5F2EB] border border-[#C8D9CB] text-[#132B20] px-4 py-2.5 rounded-2xl agrone-card-shadow flex items-center space-x-3 text-xs font-semibold max-w-sm sm:max-w-md">
        <span className="w-5 h-5 rounded-full bg-[#E3EDE5] flex items-center justify-center text-[#132B20] flex-shrink-0">
          <Leaf className="w-3 h-3 stroke-[2.5]" />
        </span>
        <div>
          <span className="font-bold">{toast.message}</span>
          {toast.subtext && <span className="opacity-75"> — {toast.subtext}</span>}
        </div>
      </div>
    </div>
  );
};
