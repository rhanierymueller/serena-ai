import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { IMaskInput } from 'react-imask';

import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import Select from '../../components/Select';
import { createUser } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import EmailVerificationModal from './EmailVerificationModal';
import { formatDate, parseDateToBrFormat } from '../../utils/formatters';

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
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const genders = [
    { value: 'male', label: t('profile.genderOptions.male') },
    { value: 'female', label: t('profile.genderOptions.female') },
    { value: 'other', label: t('profile.genderOptions.other') },
  ];

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

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
      firstName: Yup.string().required(t('register.validation.firstName')),
      lastName: Yup.string().required(t('register.validation.lastName')),
      email: Yup.string()
        .email(t('register.validation.emailInvalid'))
        .required(t('register.validation.emailRequired')),
      password: Yup.string()
        .min(8, t('register.validation.passwordMin'))
        .matches(/[A-Z]/, t('register.validation.passwordUpper'))
        .matches(/[a-z]/, t('register.validation.passwordLower'))
        .matches(/[0-9]/, t('register.validation.passwordNumber'))
        .matches(/[!@#$%^&*(),.?":{}|<>]/, t('register.validation.passwordSymbol'))
        .required(t('register.validation.passwordRequired')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('register.validation.passwordMatch'))
        .required(t('register.validation.passwordConfirm')),
      birthDate: Yup.string().matches(/^\d{2}\/\d{2}\/\d{4}$/, t('register.validation.birthDate')),
      country: Yup.string(),
      gender: Yup.string(),
    }),
    onSubmit: async values => {
      if (!captchaVerified) {
        showToast(t('validation.recaptcha'), 'error');
        return;
      }
      try {
        const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;
        const birthDate = values.birthDate
          ? parseDateToBrFormat(values.birthDate, language)
          : undefined;
        await createUser({
          name: fullName,
          email: values.email,
          gender: values.gender || undefined,
          password: values.password,
          birthDate: birthDate,
        });
        setShowEmailVerification(true);
      } catch (error: any) {
        console.error('Erro ao registrar:', error);
        const errorMessage = error?.errorCode
          ? t(`errors.${error.errorCode}`) !== `errors.${error.errorCode}`
            ? t(`errors.${error.errorCode}`)
            : error.message
          : t('errors.internalServerError');
        showToast(errorMessage, 'error');
      }
    },
  });

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const handleSubmitModal = async () => {
    if (!captchaVerified) {
      alert(t('validation.recaptcha'));
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
    <>
      <Modal
        title={t('register.title')}
        description={
          <div className="w-full max-w-md mx-auto space-y-6 text-white">
            <form className="w-full max-w-lg mx-auto px-4 space-y-4" onSubmit={formik.handleSubmit}>
              {false ? (
                <button
                  type="button"
                  onClick={() => (window.location.href = '/api/signin/google')}
                  className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md w-full font-medium hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48"></svg>
                  <span>{t('login.googleAuth')}</span>
                </button>
              ) : null}
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-sm">{t('register.firstName')} *</label>
                  <input
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    className="input"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="error">{formik.errors.firstName}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="text-sm">{t('register.lastName')} *</label>
                  <input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    className="input"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="error">{formik.errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm">{t('register.email')} *</label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  className="input"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="error">{formik.errors.email}</p>
                )}
              </div>

              <div className="flex gap-4">
                <div className="w-1/2 relative">
                  <label className="text-sm">{t('register.password')} *</label>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formik.values.password}
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
                  <label className="text-sm">{t('register.confirmPassword')} *</label>
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formik.values.confirmPassword}
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
                  <label className="text-sm">{t('register.birthDate')}</label>
                  <IMaskInput
                    mask="00/00/0000"
                    value={formik.values.birthDate}
                    onAccept={(value: string) => formik.setFieldValue('birthDate', value)}
                    placeholder={language === 'pt' ? 'dd/mm/aaaa' : 'mm/dd/yyyy'}
                    className="input"
                  />
                  {formik.touched.birthDate && formik.errors.birthDate && (
                    <p className="error">{formik.errors.birthDate}</p>
                  )}
                </div>
                <div className="w-1/2">
                  <label className="text-sm">{t('register.country')}</label>
                  <Select
                    name="country"
                    value={formik.values.country}
                    onChange={value => formik.setFieldValue('country', value)}
                    options={countries}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm">{t('register.gender')}</label>
                <Select
                  name="gender"
                  value={formik.values.gender}
                  onChange={value => formik.setFieldValue('gender', value)}
                  options={genders}
                />
              </div>

              <div className="flex justify-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={siteKey}
                  onChange={handleCaptchaChange}
                  theme="dark"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white hover:text-gray-300 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitModal}
                  className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary-dark transition flex items-center gap-2"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('register.submit')}
                </button>
              </div>
            </form>
          </div>
        }
        onCancel={onClose}
        onConfirm={handleSubmitModal}
        confirmDisabled={!captchaVerified || formik.isSubmitting}
        cancelText={t('register.cancel')}
        confirmText={
          formik.isSubmitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4" />
              {t('register.submit')}
            </div>
          ) : (
            t('register.submit')
          )
        }
        size="md"
      />
      {showEmailVerification && (
        <EmailVerificationModal
          email={formik.values.email}
          onClose={() => {
            setShowEmailVerification(false);
            onClose();
          }}
        />
      )}
    </>
  );
};

export default RegisterModal;
