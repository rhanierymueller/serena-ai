import React, { useRef, useState } from 'react';
import Modal from '../../components/Modal';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../../services/userService';
import { saveUser } from '../../services/userSession';
import { useI18n } from '../../i18n/I18nContext';
import ReCAPTCHA from 'react-google-recaptcha';

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onSuccess }) => {
  const { t } = useI18n();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
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
      try {
        if (!captchaVerified) {
          alert('Por favor, verifique o reCAPTCHA.');
          return;
        }

        const user = await loginUser(values);
        saveUser(user);
        onSuccess();
      } catch (err) {
        alert('Erro ao autenticar.');
        console.error(err);
      }
    },
  });

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const handleSubmitModal = async () => {
    formik.setTouched({
      email: true,
      password: true,
    });

    const errors = await formik.validateForm();

    if (Object.keys(errors).length === 0) {
      formik.handleSubmit();
    }
  };

  return (
    <Modal
      title={t('login.title')}
      description={
        <form onSubmit={formik.handleSubmit} className="space-y-4 text-white">
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = import.meta.env.VITE_API_URL + '/api/signin/google';
              }}
              className="flex items-center justify-center gap-2 bg-white text-black px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition"
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
              <span>{t('login.googleAuth')}</span>
            </button>
          </div>

          <div>
            <label className="text-sm mb-1 block">{t('login.email')}</label>
            <input
              type="email"
              name="email"
              placeholder={t('login.emailPlaceholder')}
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm mb-1 block">{t('login.password')}</label>
            <input
              type="password"
              name="password"
              placeholder={t('login.passwordPlaceholder')}
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
            )}
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
  );
};

export default LoginModal;
