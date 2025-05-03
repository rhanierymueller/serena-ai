type Language = 'pt' | 'en' | 'es';

/**
 * Formata uma data de acordo com a linguagem do usuário
 * @param date Data a ser formatada (string no formato dd/mm/yyyy ou objeto Date)
 * @param language Linguagem do usuário (pt, en, es)
 * @returns Data formatada de acordo com a linguagem (dd/mm/yyyy para pt, mm/dd/yyyy para en e es)
 */
export const formatDate = (date: string | Date, language: Language): string => {
  if (typeof date === 'string') {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);

    if (match) {
      const [_, day, month, year] = match;

      if (language === 'pt') {
        return `${day}/${month}/${year}`;
      } else {
        return `${month}/${day}/${year}`;
      }
    }

    return date;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  if (language === 'pt') {
    return `${day}/${month}/${year}`;
  } else {
    return `${month}/${day}/${year}`;
  }
};

/**
 * Formata um preço de acordo com a linguagem do usuário
 * @param price Preço a ser formatado
 * @param language Linguagem do usuário (pt, en, es)
 * @returns Preço formatado com o símbolo da moeda de acordo com a linguagem (R$ para pt, $ para en e es)
 */
export const formatPrice = (price: number, language: Language): string => {
  const currencySymbol =
    language === 'pt'
      ? import.meta.env.VITE_CURRENCY_SYMBOL_PT || 'R$'
      : import.meta.env.VITE_CURRENCY_SYMBOL_DEFAULT || '$';
  const formattedPrice = price.toFixed(2);

  return `${currencySymbol} ${formattedPrice}`;
};

/**
 * Converte uma string de data do formato de exibição para o formato brasileiro (dd/mm/yyyy)
 * @param date Data no formato de exibição (dd/mm/yyyy para pt, mm/dd/yyyy para en e es)
 * @param language Linguagem do usuário (pt, en, es)
 * @returns Data no formato brasileiro (dd/mm/yyyy)
 */
export const parseDateToBrFormat = (date: string, language: Language): string => {
  if (language === 'pt') {
    return date;
  } else {
    const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = date.match(dateRegex);

    if (match) {
      const [_, month, day, year] = match;
      return `${day}/${month}/${year}`;
    }

    return date;
  }
};
