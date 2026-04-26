import React from 'react';
import { motion } from 'framer-motion';
import { useCurrency, currencies } from '@/context/CurrencyContext';

const CurrencyToggle = ({ variant = 'default' }) => {
  const { currency, setCurrency } = useCurrency();

  const isCompact = variant === 'compact';

  return (
    <div className={`flex items-center bg-gray-100/80 backdrop-blur-md p-1 rounded-full border border-gray-200/50 shadow-sm relative shrink-0 ${isCompact ? 'h-10' : 'h-12'}`}>
      {currencies.map((curr) => {
        const isActive = currency.code === curr.code;
        return (
          <button
            key={curr.code}
            onClick={() => setCurrency(curr)}
            className={`
              relative z-10 px-4 h-full flex items-center gap-2 rounded-full transition-all duration-300
              uppercase tracking-wider font-black
              ${isCompact ? 'text-[10px]' : 'text-[12px]'}
              ${isActive ? 'text-white' : 'text-heading/50 hover:text-heading/80'}
            `}
          >
            <span className={`${isCompact ? 'text-[14px]' : 'text-[16px]'} leading-none`}>{curr.flag}</span>
            <span>{curr.code}</span>
            
            {isActive && (
              <motion.div
                layoutId={`activeCurrency-${variant}`}
                className="absolute inset-0 bg-gradient-to-r from-primary to-orange-600 rounded-full -z-10 shadow-lg shadow-primary/20"
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
