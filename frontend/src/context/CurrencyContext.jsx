import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const currencies = [
  { code: 'USD', symbol: '$', rate: 1, flag: '🇺🇸' },
  { code: 'AED', symbol: 'AED', rate: 3.67, flag: '🇦🇪' },
  { code: 'EUR', symbol: '€', rate: 0.92, flag: '🇪🇺' },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved ? JSON.parse(saved) : currencies[0];
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', JSON.stringify(currency));
  }, [currency]);

  const formatPrice = (usdValue) => {
    const converted = usdValue * currency.rate;
    
    if (currency.code === 'AED') {
      return `AED ${Math.round(converted).toLocaleString()}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.code,
      maximumFractionDigits: 0,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
