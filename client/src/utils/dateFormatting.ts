export const formatDateToBr = (date: string): string => {
  if (!date) return '';
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

export const formatDateToISO = (date: string): string => {
  if (!date) return '';
  // If already in ISO format, return as is
  if (date.includes('-')) return date;
  // Handle Brazilian format DD/MM/YYYY
  if (date.includes('/')) {
    const [day, month, year] = date.split('/');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return date;
};

export const parseDateToBrFormat = (date: string, language: string = 'pt'): string => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    if (language === 'pt') {
      return formatDateToBr(date);
    } else {
      // For other languages, use ISO format
      return dateObj.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('Error parsing date:', error);
    return '';
  }
};

export const validateBirthDate = (date: string): boolean => {
  if (!date) return false;

  try {
    const dateObj = new Date(date);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    return dateObj <= today && dateObj >= minDate;
  } catch (error) {
    return false;
  }
};

export const formatBirthDateInput = (value: string): string => {
  // Remove all non-digit characters
  const numbers = value.replace(/\D/g, '');
  // Apply DD/MM/YYYY format
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  } else if (numbers.length <= 8) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
  } else {
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  }
};

export const validateBirthDateFormat = (date: string): boolean => {
  // Check if matches DD/MM/YYYY format
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  if (!dateRegex.test(date)) return false;
  const [day, month, year] = date.split('/').map(Number);
  // Basic validation
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  // Check if date is valid
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getDate() === day && dateObj.getMonth() === month - 1 && dateObj.getFullYear() === year
  );
};

export const getAge = (birthDate: string): number => {
  if (!birthDate) return 0;

  try {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  } catch (error) {
    return 0;
  }
};

export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    } else {
      return formatDateToBr(dateString);
    }
  } catch (error) {
    return '';
  }
};