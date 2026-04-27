import React from 'react';
import { motion } from 'framer-motion';
import { useCurrency, currencies } from '@/context/CurrencyContext';

const CurrencyToggle = ({ variant = 'default' }) => {
  const { currency, setCurrency } = useCurrency();

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center bg-slate-50/50 backdrop-blur-md p-1 rounded-2xl border border-slate-200/50 shadow-inner relative shrink-0 ${isCompact ? 'h-[44px]' : 'h-12'}`}>
      {currencies.map((curr) => {
        const isActive = currency.code === curr.code;
        return (
          <button
            key={curr.code}
            onClick={() => setCurrency(curr)}
            className={`
              relative z-10 px-4 h-full flex items-center gap-2 rounded-xl transition-all duration-300
              uppercase tracking-widest font-bold
              ${isCompact ? 'text-[11px]' : 'text-[12px]'}
              ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-600'}
            `}
          >
            <span className={`${isCompact ? 'text-[16px]' : 'text-[18px]'} leading-none`}>{curr.flag}</span>
            <span>{curr.code}</span>
            
            {isActive && (
              <motion.div
                layoutId={`activeCurrency-${variant}`}
                className="absolute inset-0 bg-gradient-to-br from-[#f59e0b] to-[#ff7b00] rounded-xl -z-10 shadow-lg shadow-orange-500/20"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CurrencyToggle;
