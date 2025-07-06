import React from 'react';
import { Stethoscope, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { FormikProps } from 'formik';
import FormField from '../../../../components/form-field/FormField';
import Select from '../../../../components/select/Select';
import FileUploader from '../../../../components/file-uploader/FileUploader';
import { formatCRPNumber, brazilianStates } from '../../../../utils/crpValidation';
import { useCrpValidation } from '../../../../hooks/useCrpValidation';

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

interface PsychologistFieldsProps {
  formik: FormikProps<RegistrationFormData>;
  identityFiles: { front: File | null; back: File | null };
  onFileUpload: (type: 'front' | 'back', file: File) => void;
  uploading: boolean;
  t: (key: string) => string;
}

const PsychologistFields: React.FC<PsychologistFieldsProps> = ({
  formik,
  identityFiles,
  onFileUpload,
  uploading,
  t,
}) => {
  const { validateCrp, isValidating, isValidated } = useCrpValidation();

  const handleCrpNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCRPNumber(e.target.value);
    formik.setFieldValue('crpNumber', formatted);
  };

  const handleValidateCrp = async () => {
    await validateCrp(formik.values.crpNumber, formik.values.crpState);
  };

  return (
    <div className="space-y-6">
      {}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-blue-400" />
          {t('register.psychologist.title')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={t('register.psychologist.crpNumber')}
            error={formik.touched.crpNumber ? formik.errors.crpNumber : undefined}
            required
          >
            <input
              name="crpNumber"
              value={formik.values.crpNumber}
              onChange={handleCrpNumberChange}
              placeholder="XX/XXXXX"
              className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
            />
          </FormField>
          <FormField
            label={t('register.psychologist.crpState')}
            error={formik.touched.crpState ? formik.errors.crpState : undefined}
            required
          >
            <Select
              name="crpState"
              value={formik.values.crpState}
              onChange={formik.handleChange}
              options={brazilianStates}
              placeholder={t('register.psychologist.selectState')}
            />
          </FormField>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={handleValidateCrp}
            disabled={!formik.values.crpNumber || !formik.values.crpState || isValidating}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isValidated ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            {isValidating
              ? t('register.psychologist.validating')
              : isValidated
                ? t('register.psychologist.validated')
                : t('register.psychologist.validateCrp')}
          </button>
        </div>
      </div>

      {}
      <div className="space-y-4">
        <FormField
          label={t('register.psychologist.specialty')}
          error={formik.touched.specialty ? formik.errors.specialty : undefined}
          required
        >
          <input
            name="specialty"
            value={formik.values.specialty}
            onChange={formik.handleChange}
            placeholder={t('register.psychologist.specialtyPlaceholder')}
            className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
          />
        </FormField>
        <FormField
          label={t('register.psychologist.professionalLicense')}
          error={formik.touched.professionalLicense ? formik.errors.professionalLicense : undefined}
          helpText={t('register.psychologist.professionalLicenseHelp')}
        >
          <input
            name="professionalLicense"
            value={formik.values.professionalLicense}
            onChange={formik.handleChange}
            placeholder={t('register.psychologist.professionalLicensePlaceholder')}
            className="w-full bg-gradient-to-r from-[#1f2d36] to-[#2a3b47] border border-[#6DAEDB]/30 text-white placeholder-gray-400 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all duration-300"
          />
        </FormField>
      </div>

      {}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white">
          {t('register.psychologist.identityDocuments')}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label={t('register.psychologist.identityFront')} required>
            <FileUploader
              onFileSelect={file => file && onFileUpload('front', file)}
              currentFile={identityFiles.front}
              acceptedTypes={['image/*']}
              maxSizeInMB={5}
              placeholder={t('register.psychologist.uploadFront')}
              isLoading={uploading}
            />
          </FormField>

          <FormField label={t('register.psychologist.identityBack')} required>
            <FileUploader
              onFileSelect={file => file && onFileUpload('back', file)}
              currentFile={identityFiles.back}
              acceptedTypes={['image/*']}
              maxSizeInMB={5}
              placeholder={t('register.psychologist.uploadBack')}
              isLoading={uploading}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};

export default PsychologistFields;