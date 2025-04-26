import React, { useEffect, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { IMaskInput } from 'react-imask';

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

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, initialData }) => {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const genders = [
    { value: 'male', label: t('profile.genderOptions.male') },
    { value: 'female', label: t('profile.genderOptions.female') },
    { value: 'other', label: t('profile.genderOptions.other') },
  ];

  const siteKey =
    import.meta.env?.VITE_RECAPTCHA_SITE_KEY || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: initialData?.email || '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      country: 'br',
      gender: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required('Primeiro nome obrigatório'),
      lastName: Yup.string().required('Sobrenome obrigatório'),
      email: Yup.string().email('Email inválido').required('Email obrigatório'),
      password: Yup.string()
        .min(8, 'Mínimo 8 caracteres')
        .matches(/[A-Z]/, 'Precisa de uma letra maiúscula')
        .matches(/[a-z]/, 'Precisa de uma letra minúscula')
        .matches(/[0-9]/, 'Precisa de um número')
        .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Precisa de um símbolo especial'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password')], 'As senhas precisam coincidir'),
      birthDate: Yup.string().matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Formato inválido'),
      country: Yup.string(),
      gender: Yup.string(),
    }),
    onSubmit: async values => {
      try {
        const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;

        const user = await createUser({
          name: fullName,
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

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const handleSubmitModal = async () => {
    if (!captchaVerified) {
      alert('Por favor, verifique o reCAPTCHA.');
      return;
    }

    formik.setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
      birthDate: true,
      country: true,
      gender: true,
    });

    const errors = await formik.validateForm();

    if (Object.keys(errors).length === 0) {
      formik.handleSubmit();
    }
  };

  return (
    <Modal
      title={t('register.title')}
      description={
        <div className="w-full max-w-md mx-auto space-y-6 text-white">
          {/* Formulário */}
          <form className="w-full max-w-lg mx-auto px-4 space-y-4" onSubmit={formik.handleSubmit}>
            <button
              type="button"
              onClick={() => (window.location.href = '/api/signin/google')}
              className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full font-medium hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 48 48">
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
              <span>{t('login.googleAuth')}</span>
            </button>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-sm mb-1 block">{t('register.firstName')} *</label>
                <input
                  name="firstName"
                  value={formik.values.firstName}
                  placeholder={t('register.firstName')}
                  onChange={formik.handleChange}
                  className="input"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="error">{formik.errors.firstName}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="text-sm mb-1 block">{t('register.lastName')} *</label>
                <input
                  name="lastName"
                  value={formik.values.lastName}
                  placeholder={t('register.lastName')}
                  onChange={formik.handleChange}
                  className="input"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="error">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm mb-1 block">{t('register.email')} *</label>
              <input
                name="email"
                type="email"
                placeholder={t('register.email')}
                value={formik.values.email}
                onChange={formik.handleChange}
                className="input"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="error">{formik.errors.email}</p>
              )}
            </div>

            {/* Campos de Senha e Confirmar */}
            <div className="flex gap-4">
              <div className="w-1/2 relative">
                <label className="text-sm mb-1 block">{t('register.password')} *</label>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  placeholder={t('register.password')}
                  onChange={formik.handleChange}
                  className="input pr-10"
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="error">{formik.errors.password}</p>
                )}
                <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>

              <div className="w-1/2 relative">
                <label className="text-sm mb-1 block">{t('register.confirmPassword')} *</label>
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formik.values.confirmPassword}
                  placeholder={t('register.confirmPassword')}
                  onChange={formik.handleChange}
                  className="input pr-10"
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className="error">{formik.errors.confirmPassword}</p>
                )}
                <span
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-sm mb-1 block">{t('register.birthDate')}</label>
                <IMaskInput
                  mask="00/00/0000"
                  value={formik.values.birthDate}
                  onAccept={(value: string) => formik.setFieldValue('birthDate', value)}
                  placeholder={t('register.birthDate')}
                  className="input"
                />
              </div>

              <div className="w-1/2">
                <label className="text-sm mb-1 block">{t('register.country')}</label>
                <Select
                  value={formik.values.country}
                  onChange={val => formik.setFieldValue('country', val)}
                  options={countries}
                />
              </div>
            </div>

            <div>
              <label className="text-sm mb-1 block">{t('register.gender')}</label>
              <Select
                value={formik.values.gender}
                onChange={val => formik.setFieldValue('gender', val)}
                options={genders}
              />
            </div>
            <div className="flex justify-center W-full">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={handleCaptchaChange}
                size="normal"
              />
            </div>
          </form>
        </div>
      }
      onCancel={onClose}
      onConfirm={handleSubmitModal}
      confirmDisabled={!captchaVerified}
      cancelText="Cancelar"
      confirmText="Registrar"
      size="md"
    />
  );
};

export default RegisterModal;
