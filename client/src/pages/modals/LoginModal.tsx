import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import { loginUser } from '../../services/userService';
import { saveUser, UserProfile } from '../../services/userSession';
import { useToast } from '../../context/ToastContext';
import ForgotPasswordModal from './ForgotPasswordModal';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const API_URL = import.meta.env.VITE_BASE_URL || '';
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(t('register.validation.emailInvalid'))
        .max(255, t('register.validation.emailInvalid'))
        .required(t('register.validation.emailRequired')),
      password: Yup.string()
        .max(128, t('register.validation.passwordRequired'))
        .required(t('register.validation.passwordRequired')),
    }),
    onSubmit: async values => {
      if (!captchaVerified) {
        showToast(t('login.validation.recaptcha'), 'error');
        return;
      }
      try {
        const user = await loginUser(values);
        saveUser(user as UserProfile);
        onSuccess();
      } catch (error: any) {
        console.error('Login error:', error);
        const errorKey = error?.errorCode || error?.message || 'internalServerError';
        const translated =
          t(`errors.${errorKey}`) !== `errors.${errorKey}`
            ? t(`errors.${errorKey}`)
            : t('errors.internalServerError');
        showToast(translated, 'error');
      }
    },
  });

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const handleSubmitModal = async () => {
    formik.setTouched({ email: true, password: true });
    const errors = await formik.validateForm();
    if (Object.keys(errors).length === 0) {
      formik.handleSubmit();
    }
  };

  return (
    <>
      <Modal
        title={t('login.title')}
        description={
          <form onSubmit={formik.handleSubmit} className="space-y-4 text-white">
            {/* Botão Google */}
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => (window.location.href = `${API_URL}/api/signin/google`)}
                className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
              >
                <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  {/* Paths do logo Google */}
                </svg>
                <span>{t('login.googleAuth')}</span>
              </button>
            </div>

            {/* Email */}
            <div>
              <label className="text-sm mb-1 block">{t('login.email')}</label>
              <input
                name="email"
                type="email"
                placeholder={t('login.emailPlaceholder')}
                value={formik.values.email}
                onChange={formik.handleChange}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="text-sm mb-1 block">{t('login.password')}</label>
              <input
                name="password"
                type="password"
                placeholder={t('login.passwordPlaceholder')}
                value={formik.values.password}
                onChange={formik.handleChange}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Esqueceu senha */}
            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="text-sm text-blue-400 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                {t('login.forgotPassword')}
              </button>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <ReCAPTCHA ref={recaptchaRef} sitekey={siteKey} onChange={handleCaptchaChange} />
            </div>
          </form>
        }
        onCancel={onClose}
        onConfirm={handleSubmitModal}
        confirmDisabled={!captchaVerified}
        confirmText={t('login.confirm')}
        cancelText={t('register.cancel')}
        size="sm"
      />

      {/* Modal de Esqueci a Senha */}
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </>
  );
};

export default LoginModal;
