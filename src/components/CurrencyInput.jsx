import React from 'react';

export default function CurrencyInput({ value, onChange, className, placeholder = "0,00", required = false }) {
  const handleChange = (e) => {
    // Extrai apenas os números do valor digitado
    const digitsOnly = e.target.value.replace(/\D/g, '');
    
    if (digitsOnly === '') {
      onChange('');
      return;
    }

    // Divide por 100 para transformar em decimal (ex: "123" vira 1.23)
    const numericValue = parseInt(digitsOnly, 10) / 100;
    
    // Passa o valor numérico como string (para facilitar conversão posterior com Number())
    onChange(numericValue.toFixed(2));
  };

  // Formata o valor de exibição com padrão BR (ex: "1.23" vira "1,23")
  let displayValue = '';
  if (value) {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      displayValue = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  return (
    <input
      type="tel" // 'tel' invoca o teclado numérico na maioria dos celulares
      inputMode="numeric" // reforça o teclado numérico sem pontuação extra
      value={displayValue}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  );
}
