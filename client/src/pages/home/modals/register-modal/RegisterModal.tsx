import React, { useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Lock,
  Calendar,
  MapPin,
  Users,
  Upload,
  FileText,
  CheckCircle,
  Stethoscope,
} from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { IMaskInput } from 'react-imask';

import { useI18n } from '../../../../i18n/I18nContext';
import Modal from '../../../../components/modal/Modal';
import Select from '../../../../components/select/Select';
import { createUser } from '../../../../services/userService';
import { useToast } from '../../../../context/ToastContext';
import EmailVerificationModal from '../email-verification-modal/EmailVerificationModal';
import { parseDateToBrFormat } from '../../../../utils/formatters';
import { BASE_URL } from '../../../../config';

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
const brazilianStates = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, initialData }) => {
  const { t, language } = useI18n();
  const { showToast } = useToast();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [isPsychologist, setIsPsychologist] = useState(false);
  const [crpValidated, setCrpValidated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [identityFiles, setIdentityFiles] = useState<{ front: File | null; back: File | null }>({
    front: null,
    back: null,
  });

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
      gender: 'male',
      crpNumber: '',
      crpState: '',
      specialty: '',
      professionalLicense: '',
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
      gender: Yup.string().required(),
      crpNumber: isPsychologist
        ? Yup.string()
            .required(t('register.validation.crpRequired'))
            .matches(/^\d{2}\/\d{5}$/, t('register.validation.crpInvalidFormat'))
        : Yup.string(),
      crpState: isPsychologist
        ? Yup.string()
            .required(t('register.validation.crpStateRequired'))
            .min(2, t('register.validation.crpStateInvalid'))
        : Yup.string(),
      specialty: isPsychologist
        ? Yup.string()
            .required(t('register.validation.specialtyRequired'))
            .min(3, t('register.validation.specialtyMinLength'))
            .max(100, t('register.validation.specialtyMaxLength'))
        : Yup.string(),
      professionalLicense: Yup.string().max(
        50,
        t('register.validation.professionalLicenseMaxLength')
      ),
    }),
    onSubmit: async values => {
      if (!captchaVerified) {
        showToast(t('validation.recaptcha'), 'error');
        return;
      }

      if (isPsychologist) {
        if (!crpValidated) {
          showToast(t('register.validation.crpNotValidated'), 'error');
          return;
        }
        if (!identityFiles.front || !identityFiles.back) {
          showToast(t('register.validation.identityFilesRequired'), 'error');
          return;
        }
      }

      try {
        let identityPhotos = null;

        if (isPsychologist) {
          identityPhotos = await uploadIdentityFiles();
          if (!identityPhotos) return;
        }

        const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`;
        const birthDate = values.birthDate
          ? parseDateToBrFormat(values.birthDate, language)
          : undefined;
        const region = values.country === 'br' ? 'brasil' : 'other';

        const userData: any = {
          name: fullName,
          email: values.email,
          gender: values.gender,
          password: values.password,
          birthDate: birthDate,
          region: region,
          isPsychologist: isPsychologist,
        };

        if (isPsychologist) {
          userData.crpNumber = values.crpNumber;
          userData.specialty = values.specialty;
          userData.professionalLicense = values.professionalLicense;
          userData.identityFrontPhoto = identityPhotos?.identityFrontPhoto;
          userData.identityBackPhoto = identityPhotos?.identityBackPhoto;
        }

        await createUser(userData);
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

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    setIdentityFiles(prev => ({ ...prev, [type]: file }));
  };

  const validateCrp = async () => {
    if (!formik.values.crpNumber || !formik.values.crpState) {
      showToast(t('register.validation.crpDataRequired'), 'error');
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/api/validate-crp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          crpNumber: formik.values.crpNumber,
          state: formik.values.crpState,
        }),
      });

      const data = await response.json();

      if (response.ok && data.valid) {
        setCrpValidated(true);
        showToast(t('register.crpValidationSuccess'), 'success');
      } else {
        setCrpValidated(false);
        showToast(data.message || t('register.crpValidationFailed'), 'error');
      }
    } catch (error) {
      console.error('Erro ao validar CRP:', error);
      showToast(t('register.crpValidationError'), 'error');
    }
  };

  const uploadIdentityFiles = async () => {
    if (!identityFiles.front || !identityFiles.back) {
      showToast(t('register.validation.identityFilesRequired'), 'error');
      return null;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('identityFront', identityFiles.front);
      formData.append('identityBack', identityFiles.back);

      const response = await fetch(`${BASE_URL}/api/upload-identity`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        throw new Error(data.message || t('register.uploadError'));
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      showToast(t('register.uploadError'), 'error');
      return null;
    } finally {
      setUploading(false);
    }
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
        size="lg"
        description={
          <div className="w-full space-y-4 text-white">
            <form className="w-full space-y-4" onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <User className="w-4 h-4 text-[#6DAEDB]" />
                    {t('register.firstName')} *
                  </label>
                  <input
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t('register.exampleName')}
                    className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                  />
                  {formik.touched.firstName && formik.errors.firstName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formik.errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <User className="w-4 h-4 text-[#6DAEDB]" />
                    {t('register.lastName')} *
                  </label>
                  <input
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder={t('register.exampleLastName')}
                    className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                  />
                  {formik.touched.lastName && formik.errors.lastName && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formik.errors.lastName}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Mail className="w-4 h-4 text-[#6DAEDB]" />
                  {t('register.email')} *
                </label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={t('register.emailPlaceholder')}
                  className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {formik.errors.email}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Lock className="w-4 h-4 text-[#6DAEDB]" />
                    {t('register.password')} *
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('register.passwordPlaceholder')}
                      className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#6DAEDB] transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formik.errors.password}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Lock className="w-4 h-4 text-[#6DAEDB]" />
                    {t('register.confirmPassword')} *
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder={t('register.confirmPasswordPlaceholder')}
                      className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#6DAEDB] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formik.errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4 text-[#6DAEDB]" />
                    {t('register.birthDate')}
                  </label>
                  <IMaskInput
                    mask="00/00/0000"
                    value={formik.values.birthDate}
                    onAccept={(value: string) => formik.setFieldValue('birthDate', value)}
                    placeholder={language === 'pt' ? 'dd/mm/aaaa' : 'mm/dd/yyyy'}
                    className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                  />
                  {formik.touched.birthDate && formik.errors.birthDate && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                      {formik.errors.birthDate}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <MapPin className="w-4 h-4 text-[#6DAEDB]" />
                    {t('register.country')}
                  </label>
                  <div className="relative">
                    <Select
                      name="country"
                      value={formik.values.country}
                      onChange={value => formik.setFieldValue('country', value)}
                      options={countries}
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Users className="w-4 h-4 text-[#6DAEDB]" />
                  {t('register.gender')}
                </label>
                <div className="relative">
                  <Select
                    name="gender"
                    value={formik.values.gender}
                    onChange={value => {
                      formik.setFieldValue('gender', value);
                      formik.setFieldTouched('gender', true);
                    }}
                    options={genders}
                  />
                </div>
                {formik.touched.gender && formik.errors.gender && (
                  <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {formik.errors.gender}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPsychologist}
                    onChange={e => setIsPsychologist(e.target.checked)}
                    className="w-4 h-4 text-[#6DAEDB] bg-transparent border-2 border-[#6DAEDB]/30 rounded focus:ring-[#6DAEDB] focus:ring-2"
                  />
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#6DAEDB]" />
                    <span className="text-sm font-medium text-gray-300">
                      {t('register.isPsychologist')}
                    </span>
                  </div>
                </label>
              </div>
              {isPsychologist && (
                <div className="space-y-4 border-t border-[#6DAEDB]/20 pt-4">
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {t('register.psychologistInfo')}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <FileText className="w-4 h-4 text-[#6DAEDB]" />
                        {t('register.crpNumber')} *
                      </label>
                      <IMaskInput
                        mask="00/00000"
                        name="crpNumber"
                        value={formik.values.crpNumber}
                        onAccept={(value: string) => {
                          formik.setFieldValue('crpNumber', value);
                          setCrpValidated(false);
                        }}
                        placeholder="XX/XXXXX"
                        className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                      />
                      {formik.touched.crpNumber && formik.errors.crpNumber && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {formik.errors.crpNumber}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                        <MapPin className="w-4 h-4 text-[#6DAEDB]" />
                        {t('register.crpState')} *
                      </label>
                      <Select
                        name="crpState"
                        value={formik.values.crpState}
                        onChange={value => {
                          formik.setFieldValue('crpState', value);
                          formik.setFieldTouched('crpState', true);
                          setCrpValidated(false);
                        }}
                        options={[
                          { value: '', label: t('register.selectState') },
                          ...brazilianStates,
                        ]}
                      />
                      {formik.touched.crpState && formik.errors.crpState && (
                        <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                          {formik.errors.crpState}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={validateCrp}
                      disabled={!formik.values.crpNumber || !formik.values.crpState}
                      className="flex items-center gap-2 px-4 py-2 bg-[#6DAEDB] text-white rounded-xl hover:bg-[#4F91C3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {crpValidated ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          {t('register.crpValidated')}
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          {t('register.validateCrp')}
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <Stethoscope className="w-4 h-4 text-[#6DAEDB]" />
                      {t('register.specialty')} *
                    </label>
                    <input
                      name="specialty"
                      value={formik.values.specialty}
                      onChange={formik.handleChange}
                      maxLength={100}
                      className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                      placeholder={t('register.specialtyPlaceholder')}
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        {formik.touched.specialty && formik.errors.specialty && (
                          <p className="text-red-400 text-xs flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                            {formik.errors.specialty}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formik.values.specialty.length}/100
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                      <FileText className="w-4 h-4 text-[#6DAEDB]" />
                      {t('register.professionalLicense')}
                    </label>
                    <input
                      name="professionalLicense"
                      value={formik.values.professionalLicense}
                      onChange={formik.handleChange}
                      maxLength={50}
                      className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
                      placeholder={t('register.professionalLicensePlaceholder')}
                    />
                    <div className="flex justify-between items-center">
                      <div>
                        {formik.touched.professionalLicense &&
                          formik.errors.professionalLicense && (
                            <p className="text-red-400 text-xs flex items-center gap-1">
                              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                              {formik.errors.professionalLicense}
                            </p>
                          )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formik.values.professionalLicense.length}/50
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {t('register.identityDocuments')}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          {t('register.identityFront')} *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('front', file);
                            }}
                            className="hidden"
                            id="identity-front"
                          />
                          <label
                            htmlFor="identity-front"
                            className="flex items-center justify-center gap-2 w-full min-h-[100px] bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border-2 border-dashed border-[#6DAEDB]/30 rounded-xl cursor-pointer hover:border-[#6DAEDB]/50 transition-colors"
                          >
                            {identityFiles.front ? (
                              <div className="text-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-white truncate max-w-32">
                                  {identityFiles.front.name}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-[#6DAEDB] mx-auto mb-2" />
                                <p className="text-sm text-gray-400">{t('register.uploadFile')}</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                          {t('register.identityBack')} *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload('back', file);
                            }}
                            className="hidden"
                            id="identity-back"
                          />
                          <label
                            htmlFor="identity-back"
                            className="flex items-center justify-center gap-2 w-full min-h-[100px] bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border-2 border-dashed border-[#6DAEDB]/30 rounded-xl cursor-pointer hover:border-[#6DAEDB]/50 transition-colors"
                          >
                            {identityFiles.back ? (
                              <div className="text-center">
                                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-sm text-white truncate max-w-32">
                                  {identityFiles.back.name}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="w-8 h-8 text-[#6DAEDB] mx-auto mb-2" />
                                <p className="text-sm text-gray-400">{t('register.uploadFile')}</p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {}
              <div className="flex justify-center py-2">
                <div className="p-3 bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] rounded-xl border border-[#6DAEDB]/20">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={handleCaptchaChange}
                    theme="dark"
                  />
                </div>
              </div>

              {}
              {!captchaVerified && (
                <div className="text-center">
                  <p className="text-amber-400 text-sm flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
                    {t('validation.recaptcha')}
                  </p>
                </div>
              )}
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
