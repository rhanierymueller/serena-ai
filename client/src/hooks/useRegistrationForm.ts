import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useI18n } from '../i18n/I18nContext';
import { useToast } from '../context/ToastContext';
import { createUser } from '../services/userService';
import { parseDateToBrFormat } from '../utils/dateFormatting';

interface RegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  country: string;
  gender: string;
  crpNumber: string;
  crpState: string;
  specialty: string;
  professionalLicense: string;
}

interface IdentityFiles {
  front: File | null;
  back: File | null;
}

export const useRegistrationForm = (
  initialData?: { name?: string; email?: string },
  onSuccess?: () => void
) => {
  const { t, language } = useI18n();
  const { showToast } = useToast();

  const [isPsychologist, setIsPsychologist] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [crpValidated, setCrpValidated] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [identityFiles, setIdentityFiles] = useState<IdentityFiles>({
    front: null,
    back: null,
  });

  const formik = useFormik<RegistrationFormData>({
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
      await handleSubmit(values);
    },
  });

  const handleSubmit = async (values: RegistrationFormData) => {
    if (!captchaVerified) {
      showToast(t('validation.recaptcha'), 'error');
      return;
    }

    // Validações específicas para psicólogos
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
      // Upload das fotos se for psicólogo
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

      // Adicionar dados do psicólogo se aplicável
      if (isPsychologist) {
        userData.crpNumber = values.crpNumber;
        userData.specialty = values.specialty;
        userData.professionalLicense = values.professionalLicense;
        userData.identityFrontPhoto = identityPhotos?.identityFrontPhoto;
        userData.identityBackPhoto = identityPhotos?.identityBackPhoto;
      }

      await createUser(userData);
      showToast(t('register.success'), 'success');
      onSuccess?.();
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      const errorMessage = error?.errorCode
        ? t(`errors.${error.errorCode}`) !== `errors.${error.errorCode}`
          ? t(`errors.${error.errorCode}`)
          : error.message
        : t('errors.internalServerError');
      showToast(errorMessage, 'error');
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
      // TODO: Replace with actual upload endpoint
      const response = await fetch('/api/upload-identity', {
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

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaVerified(!!token);
  };

  const handleFileUpload = (type: 'front' | 'back', file: File) => {
    setIdentityFiles(prev => ({ ...prev, [type]: file }));
  };

  const validateFormAndSubmit = async () => {
    if (!captchaVerified) {
      showToast(t('validation.recaptcha'), 'error');
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

  return {
    formik,
    isPsychologist,
    setIsPsychologist,
    captchaVerified,
    setCaptchaVerified,
    crpValidated,
    setCrpValidated,
    uploading,
    identityFiles,
    handleCaptchaChange,
    handleFileUpload,
    validateFormAndSubmit,
  };
};