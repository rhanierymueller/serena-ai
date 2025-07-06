import { PhoneCodeOption } from '../types';

export const phoneCodeOptions: PhoneCodeOption[] = [
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+591', country: 'Bolívia', flag: '🇧🇴' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+57', country: 'Colômbia', flag: '🇨🇴' },
  { code: '+593', country: 'Equador', flag: '🇪🇨' },
  { code: '+592', country: 'Guiana', flag: '🇬🇾' },
  { code: '+595', country: 'Paraguai', flag: '🇵🇾' },
  { code: '+51', country: 'Peru', flag: '🇵🇪' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷' },
  { code: '+598', country: 'Uruguai', flag: '🇺🇾' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+1', country: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+1', country: 'Canadá', flag: '🇨🇦' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+34', country: 'Espanha', flag: '🇪🇸' },
  { code: '+33', country: 'França', flag: '🇫🇷' },
  { code: '+49', country: 'Alemanha', flag: '🇩🇪' },
  { code: '+39', country: 'Itália', flag: '🇮🇹' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+81', country: 'Japão', flag: '🇯🇵' },
  { code: '+61', country: 'Austrália', flag: '🇦🇺' },
  { code: '+999', country: 'Outro', flag: '🌍' },
];

export const formatPhoneNumber = (value: string, countryCode: string): string => {

  const numbers = value.replace(/\D/g, '');

  switch (countryCode) {
    case '+55': 
      if (numbers.length <= 2) return numbers;
      if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 11) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      }
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;

    case '+1': // US/Canada
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 10)}`;

    case '+351': // Portugal
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;

    case '+34': // Spain
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)}`;

    default:
      // Generic formatting for other countries
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 6) return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
      if (numbers.length <= 9)
        return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`;
      return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 9)} ${numbers.slice(9)}`;
  }
};

export const parsePhoneNumber = (fullPhone: string): { countryCode: string; number: string } => {
  if (!fullPhone) return { countryCode: '+55', number: '' };

  const phoneOption = phoneCodeOptions.find(option => fullPhone.startsWith(option.code));

  if (phoneOption) {
    const number = fullPhone.substring(phoneOption.code.length);
    return { countryCode: phoneOption.code, number };
  }

  return { countryCode: '+55', number: fullPhone };
};

export const validatePhoneNumber = (phone: string, countryCode: string): boolean => {
  const numbers = phone.replace(/\D/g, '');

  switch (countryCode) {
    case '+55': // Brasil
      return numbers.length === 10 || numbers.length === 11;
    case '+1': // US/Canada
      return numbers.length === 10;
    case '+351': // Portugal
      return numbers.length === 9;
    case '+34': // Spain
      return numbers.length === 9;
    default:
      return numbers.length >= 7 && numbers.length <= 15;
  }
};

export const getPhoneValidationMessage = (
  countryCode: string,
  t: (key: string) => string
): string => {
  switch (countryCode) {
    case '+55':
      return t('profile.validation.phoneBrazilInvalid');
    case '+1':
      return t('profile.validation.phoneUSInvalid');
    case '+351':
      return t('profile.validation.phonePortugalInvalid');
    default:
      return t('profile.validation.phoneGenericInvalid');
  }
};

export const getPhonePlaceholder = (countryCode: string, t: (key: string) => string): string => {
  switch (countryCode) {
    case '+55':
      return t('profile.placeholders.phoneBrazil');
    case '+1':
      return t('profile.placeholders.phoneUS');
    case '+351':
      return t('profile.placeholders.phonePortugal');
    default:
      return t('profile.placeholders.phoneNumber');
  }
};