import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import ReCAPTCHA from 'react-google-recaptcha';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import { loginUser } from '../../services/userService';
import { UserProfile } from '../../services/userSession';
import { useToast } from '../../context/ToastContext';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useUser } from '../../context/UserContext';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const { setUser } = useUser();

  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        setUser(user as UserProfile);
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
            {false ? (
              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => (window.location.href = `${API_URL}/api/signin/google`)}
                  className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
                >
                  <svg
                    className="w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                  ></svg>
                  <span>{t('login.googleAuth')}</span>
                </button>
              </div>
            ) : null}

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

            <div>
              <label className="text-sm mb-1 block">{t('login.password')}</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={t('login.passwordPlaceholder')}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                        clipRule="evenodd"
                      />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="button"
                className="text-sm text-blue-400 hover:underline"
                onClick={() => setShowForgotPassword(true)}
              >
                {t('login.forgotPassword')}
              </button>
            </div>

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

      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} />}
    </>
  );
};

export default LoginModal;
