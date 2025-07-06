import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useI18n } from '../i18n/I18nContext';
import { validateCRPWithAPI, CRPValidationResult } from '../utils/crpValidation';

export const useCrpValidation = () => {
  const { t } = useI18n();
  const { showToast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [validationResult, setValidationResult] = useState<CRPValidationResult | null>(null);

  const validateCrp = async (crpNumber: string, state: string) => {
    if (!crpNumber || !state) {
      showToast(t('register.validation.crpDataRequired'), 'error');
      return false;
    }

    setIsValidating(true);

    try {
      const result = await validateCRPWithAPI(crpNumber, state);
      setValidationResult(result);

      if (result.isValid) {
        setIsValidated(true);
        showToast(t('register.crpValidationSuccess'), 'success');
        return true;
      } else {
        setIsValidated(false);
        showToast(result.message || t('register.crpValidationFailed'), 'error');
        return false;
      }
    } catch (error) {
      console.error('Erro ao validar CRP:', error);
      setIsValidated(false);
      setValidationResult(null);
      showToast(t('register.crpValidationError'), 'error');
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const resetValidation = () => {
    setIsValidated(false);
    setValidationResult(null);
  };

  return {
    validateCrp,
    isValidating,
    isValidated,
    validationResult,
    resetValidation,
  };
};