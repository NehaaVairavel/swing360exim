import React from 'react';
import { motion } from 'framer-motion';
import { useCurrency, currencies } from '@/context/CurrencyContext';

const CurrencyToggle = ({ variant = 'default' }) => {
  const { currency, setCurrency } = useCurrency();

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center w-full bg-slate-100/50 p-1 rounded-full border border-slate-200/50 shadow-inner relative shrink-0 ${isCompact ? 'h-[44px]' : 'h-12'}`}>
      {currencies.map((curr) => {
        const isActive = currency.code === curr.code;
        return (
          <button
            key={curr.code}
            onClick={() => setCurrency(curr)}
            className={`
              relative z-10 flex-1 h-full flex items-center justify-center gap-2 rounded-full transition-all duration-300
              uppercase tracking-widest font-black
              ${isCompact ? 'text-[10px]' : 'text-[12px]'}
              ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-800'}
            `}
          >
            <span className={`${isCompact ? 'text-[15px]' : 'text-[18px]'} leading-none`}>{curr.flag}</span>
            <span>{curr.code === 'INR' ? '₹ INR' : curr.code}</span>
            
            {isActive && (
              <motion.div
                layoutId={`activeCurrency-${variant}`}
                className="absolute inset-0 bg-gradient-to-r from-[#f59e0b] to-[#ff7b00] rounded-full -z-10 shadow-lg shadow-orange-500/30"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CurrencyToggle;
