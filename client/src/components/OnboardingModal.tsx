import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';

const stepKeys = [
  { title: 'onboarding.step1_title', desc: 'onboarding.step1_desc' },
  { title: 'onboarding.step2_title', desc: 'onboarding.step2_desc' },
  { title: 'onboarding.step3_title', desc: 'onboarding.step3_desc' },
  { title: 'onboarding.step4_title', desc: 'onboarding.step4_desc' },
  { title: 'onboarding.step5_title', desc: 'onboarding.step5_desc' },
  { title: 'onboarding.step6_title', desc: 'onboarding.step6_desc' },
  { title: 'onboarding.step7_title', desc: 'onboarding.step7_desc' },
  { title: 'onboarding.step8_title', desc: 'onboarding.step8_desc' },
];

interface OnboardingModalProps {
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);
  const { t } = useI18n();

  const handleNext = () => setStep(s => Math.min(s + 1, stepKeys.length - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));
  const handleSkip = () => onClose();
  const handleFinish = () => onClose();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#181A20] rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-[#23272F]">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">{t(stepKeys[step].title)}</h2>
        <p className="text-gray-300 mb-8 text-base">{t(stepKeys[step].desc)}</p>
        <div className="flex justify-between items-center gap-2">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className="px-4 py-2 rounded-xl bg-gray-700 text-gray-300 disabled:opacity-40"
          >
            {t('onboarding.back')}
          </button>
          {step < stepKeys.length - 1 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow hover:from-blue-600 hover:to-cyan-700 transition-all"
            >
              {t('onboarding.next')}
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold shadow hover:from-blue-600 hover:to-cyan-700 transition-all"
            >
              {t('onboarding.start')}
            </button>
          )}
          <button
            onClick={handleSkip}
            className="px-4 py-2 rounded-xl bg-transparent text-gray-400 hover:text-blue-400 underline"
          >
            {t('onboarding.skip')}
          </button>
        </div>
        <div className="flex justify-center gap-1 mt-6">
          {stepKeys.map((_, i) => (
            <span
              key={i}
              className={`w-3 h-3 rounded-full ${i === step ? 'bg-blue-400' : 'bg-gray-600'} transition-all`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
