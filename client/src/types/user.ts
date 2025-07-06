export interface User {
  id: string;
  name: string;
  email: string;
  gender?: string;
  birthdate?: string;
  phone?: string;
  region?: string;
  plan: string;
  active: boolean;
  isPsychologist?: boolean;
  crpNumber?: string;
  crpStatus?: string;
  specialty?: string;
  professionalLicense?: string;
}

export interface UserTokens {
  total: number;
  used: number;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface Country {
  value: string;
  label: string;
}

export interface PhoneCodeOption {
  code: string;
  country: string;
  flag: string;
}

export type Gender = 'male' | 'female' | 'other';