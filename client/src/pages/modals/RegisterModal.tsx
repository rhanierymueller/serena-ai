import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';
import Modal from '../../components/Modal';
import Select from '../../components/Select';

import { createUser } from '../../services/userService';
import { saveUser } from '../../services/userSession';

interface RegisterModalProps {
  onClose: () => void;
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

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const { t } = useI18n();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
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
        .required(t('register.validation.passwordRequired'))
        .min(8, t('register.validation.passwordMin'))
        .matches(/[A-Z]/, t('register.validation.passwordUpper'))
        .matches(/[a-z]/, t('register.validation.passwordLower'))
        .matches(/[0-9]/, t('register.validation.passwordNumber'))
        .matches(/[!@#$%^&*(),.?":{}|<>]/, t('register.validation.passwordSymbol')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], t('register.validation.passwordMatch'))
        .required(t('register.validation.passwordConfirm')),
      birthDate: Yup.string().required(t('register.validation.birthDate')),
      country: Yup.string().required(t('register.validation.country')),
      gender: Yup.string().required(t('register.validation.gender')),
    }),
    onSubmit: async values => {
      try {
        const user = await createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          gender: values.gender,
        });

        saveUser(user);
        onClose();
      } catch (error) {
        console.error('Erro ao registrar:', error);
        alert('Erro ao registrar. Tente novamente.');
      }
    },
  });

  return (
    <Modal
      title={t('register.title')}
      description={
        <form onSubmit={formik.handleSubmit} className="space-y-4 text-white">
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
            <label className="text-sm block mb-1">
              {t('register.password')} <span className="text-red-500">*</span>
            </label>
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
            <label className="text-sm block mb-1">
              {t('register.confirmPassword')} <span className="text-red-500">*</span>
            </label>
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
              <label className="text-sm block mb-1">
                {t('register.birthDate')} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="birthDate"
                onChange={formik.handleChange}
                value={formik.values.birthDate}
                className="w-full bg-gray-700 px-4 py-2 rounded-md border border-gray-600"
              />
              {formik.touched.birthDate && formik.errors.birthDate && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.birthDate}</div>
              )}
            </div>

            <div className="w-1/2">
              <label className="text-sm block mb-1">
                {t('register.country')} <span className="text-red-500">*</span>
              </label>
              <Select
                value={formik.values.country}
                onChange={val => formik.setFieldValue('country', val)}
                options={countries}
              />
              {formik.touched.country && formik.errors.country && (
                <div className="text-red-400 text-xs mt-1">{formik.errors.country}</div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm block mb-1">
              {t('register.gender')} <span className="text-red-500">*</span>
            </label>
            <Select
              value={formik.values.gender}
              onChange={val => formik.setFieldValue('gender', val)}
              options={genders}
            />
            {formik.touched.gender && formik.errors.gender && (
              <div className="text-red-400 text-xs mt-1">{formik.errors.gender}</div>
            )}
          </div>
        </form>
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
