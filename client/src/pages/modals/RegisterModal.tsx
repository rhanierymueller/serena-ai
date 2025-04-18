import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { inferGender } from '../../utils/inferGender';

import { createUser } from '../../services/userService';
import { saveUser } from '../../services/userSession';

interface RegisterModalProps {
  onClose: () => void;
  initialData?: {
    name?: string;
    email?: string;
  };
}

const countries = [
  { value: 'br', label: 'Brasil' },
  { value: 'us', label: 'United States' },
  { value: 'es', label: 'España' },
  { value: 'pt', label: 'Portugal' },
  { value: 'mx', label: 'México' },
];

const genders = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Feminino' },
  { value: 'other', label: 'Outros' },
];

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, initialData }) => {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      email: initialData?.email || '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      country: 'br',
      gender: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required(t('register.validation.firstName')),
      email: Yup.string()
        .email(t('register.validation.emailInvalid'))
        .required(t('register.validation.emailRequired')),
      password: Yup.string()
        .nullable()
        .min(8, t('register.validation.passwordMin'))
        .matches(/[A-Z]/, t('register.validation.passwordUpper'))
        .matches(/[a-z]/, t('register.validation.passwordLower'))
        .matches(/[0-9]/, t('register.validation.passwordNumber'))
        .matches(/[!@#$%^&*(),.?":{}|<>]/, t('register.validation.passwordSymbol')),
      confirmPassword: Yup.string()
        .nullable()
        .oneOf([Yup.ref('password')], t('register.validation.passwordMatch')),
      birthDate: Yup.string().nullable(),
      country: Yup.string().nullable(),
      gender: Yup.string().nullable(),
    }),
    onSubmit: async values => {
      try {
        const user = await createUser({
          name: values.name,
          email: values.email,
          gender: values.gender || undefined,
          password: values.password || undefined,
        });

        saveUser(user);
        onClose();
      } catch (error) {
        console.error('Erro ao registrar:', error);
        alert('Erro ao registrar. Tente novamente.');
      }
    },
  });

  useEffect(() => {
    const fetchGender = async () => {
      if (formik.values.name && !formik.values.gender) {
        const gender = await inferGender(formik.values.name);
        if (gender) {
          formik.setFieldValue('gender', gender);
        }
      }
    };

    fetchGender();
  }, [formik.values.name]);

  return (
    <Modal
      title={t('register.title')}
      description={
        <div className="space-y-4 text-white">
          <button
            onClick={() => {
              window.location.href = 'http://localhost:4000/api/signin/google';
            }}
            className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full font-medium hover:bg-gray-100 transition"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.611 20.083h-1.797v-.083H24v8h11.283c-1.63 4.557-5.973 8-11.283 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.843 1.153 7.957 3.043l6.043-6.043C35.211 6.64 29.927 4 24 4 12.954 4 4 12.954 4 24s8.954 20 20 20c11.045 0 20-8.954 20-20 0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.294 16.07 18.799 13 24 13c3.059 0 5.843 1.153 7.957 3.043l6.043-6.043C35.211 6.64 29.927 4 24 4c-7.694 0-14.313 4.344-17.694 10.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.275 0 10.064-2.013 13.683-5.293l-6.352-5.408C29.717 34.399 26.958 35 24 35c-5.288 0-9.64-3.429-11.282-8.006l-6.555 5.055C9.65 39.564 16.332 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.283c-1.003 2.803-3.02 5.146-5.602 6.499.001-.001 6.351 5.407 6.351 5.407C40.926 36.725 44 30.909 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            <span>Entrar com Google</span>
          </button>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm block mb-1">
                {t('register.firstName')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                onChange={formik.handleChange}
                value={formik.values.name}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.name}</div>
              )}
            </div>

            <div>
              <label className="text-sm block mb-1">
                {t('register.email')} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                onChange={formik.handleChange}
                value={formik.values.email}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.email}</div>
              )}
            </div>

            <div className="relative">
              <label className="text-sm block mb-1">{t('register.password')}</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                onChange={formik.handleChange}
                value={formik.values.password}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600 pr-10"
              />
              <span
                className="absolute top-9 right-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.password}</div>
              )}
            </div>

            <div className="relative">
              <label className="text-sm block mb-1">{t('register.confirmPassword')}</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                onChange={formik.handleChange}
                value={formik.values.confirmPassword}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600 pr-10"
              />
              <span
                className="absolute top-9 right-3 cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.confirmPassword}</div>
              )}
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-sm block mb-1">{t('register.birthDate')}</label>
                <input
                  type="date"
                  name="birthDate"
                  onChange={formik.handleChange}
                  value={formik.values.birthDate}
                  className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
                />
              </div>

              <div className="w-1/2">
                <label className="text-sm block mb-1">{t('register.country')}</label>
                <Select
                  value={formik.values.country}
                  onChange={val => formik.setFieldValue('country', val)}
                  options={countries}
                />
              </div>
            </div>

            <div>
              <label className="text-sm block mb-1">{t('register.gender')}</label>
              <Select
                value={formik.values.gender}
                onChange={val => formik.setFieldValue('gender', val)}
                options={genders}
              />
            </div>
          </form>
        </div>
      }
      onCancel={onClose}
      onConfirm={formik.submitForm}
      cancelText={t('register.cancel')}
      confirmText={t('register.submit')}
      size="md"
    />
  );
};

export default RegisterModal;
