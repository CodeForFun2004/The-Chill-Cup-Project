// utils/formatCurrency.ts

export const formatCurrency = (value: number): string => {
    return value.toLocaleString('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };
  