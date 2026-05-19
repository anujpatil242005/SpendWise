import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

// Map currency codes to their symbols and locales for proper formatting
const CURRENCY_CONFIG = {
  USD: { symbol: '$', locale: 'en-US' },
  INR: { symbol: '₹', locale: 'en-IN' },
  EUR: { symbol: '€', locale: 'de-DE' },
  GBP: { symbol: '£', locale: 'en-GB' },
  CAD: { symbol: '$', locale: 'en-CA' },
  AUD: { symbol: '$', locale: 'en-AU' },
};

export const CurrencyProvider = ({ children }) => {
  // Initialize from localStorage or default to INR
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('spendwise_user_currency') || 'INR';
  });

  const [currencySymbol, setCurrencySymbol] = useState(CURRENCY_CONFIG['INR'].symbol);

  useEffect(() => {
    const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG['INR'];
    setCurrencySymbol(config.symbol);
    localStorage.setItem('spendwise_user_currency', currency);
    
    // Dispatch event so other non-React parts can know if needed
    window.dispatchEvent(new Event('spendwise-currency-updated'));
  }, [currency]);

  // Setter to change currency
  const setCurrency = (newCurrency) => {
    if (CURRENCY_CONFIG[newCurrency]) {
      setCurrencyState(newCurrency);
    }
  };

  /**
   * Format a value as active currency with 2 decimal places
   */
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return `${currencySymbol}0.00`;
    const locale = CURRENCY_CONFIG[currency]?.locale || 'en-IN';
    return `${currencySymbol}${Number(value).toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  /**
   * Format a value as active currency with no decimal places (compact form)
   */
  const formatCurrencyCompact = (value) => {
    if (value === undefined || value === null) return `${currencySymbol}0`;
    const locale = CURRENCY_CONFIG[currency]?.locale || 'en-IN';
    return `${currencySymbol}${Number(value).toLocaleString(locale, {
      maximumFractionDigits: 0,
    })}`;
  };

  /**
   * Format a value with prefix sign (+ / -)
   */
  const formatCurrencySigned = (value, type) => {
    const sign = type === 'income' ? '+' : '-';
    return `${sign}${formatCurrency(Math.abs(value))}`;
  };

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        currencySymbol, 
        setCurrency, 
        formatCurrency, 
        formatCurrencyCompact, 
        formatCurrencySigned 
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
