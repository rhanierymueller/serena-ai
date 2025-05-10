import React, { useState, useRef } from 'react';
import { useI18n } from '../i18n/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';
import useReframe from '../hooks/useReframe';
import { RefreshCw } from 'lucide-react';

interface ReframeExpressProps {
  onChatRedirect?: () => void;
  onReframeGenerated?: (thought: string, reframe: string) => void;
  isRedirecting?: boolean;
}

const ReframeExpress: React.FC<ReframeExpressProps> = ({
  onChatRedirect,
  onReframeGenerated,
  isRedirecting,
}) => {
  const { t, language } = useI18n();
  const [thought, setThought] = useState('');
  const [beliefStrength, setBeliefStrength] = useState(70);
  const [showEvidence, setShowEvidence] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { reframe, isLoading, error, isSuicidal, generateReframe, reset } = useReframe();

  const socraticQuestions = {
    'pt-BR': [
      'Que evidências apoiam esse pensamento?',
      'Que evidências contradizem esse pensamento?',
      'Existe uma explicação alternativa para essa situação?',
      'Qual seria o pior cenário possível? Quão provável ele é?',
      'O que eu diria para um amigo que estivesse pensando isso?',
    ],
    en: [
      'What evidence supports this thought?',
      'What evidence contradicts this thought?',
      'Is there an alternative explanation for this situation?',
      'What would be the worst-case scenario? How likely is it?',
      'What would I say to a friend who was thinking this?',
    ],
    es: [
      '¿Qué evidencias apoyan este pensamiento?',
      '¿Qué evidencias contradicen este pensamiento?',
      '¿Existe una explicación alternativa para esta situación?',
      '¿Cuál sería el peor escenario posible? ¿Qué tan probable es?',
      '¿Qué le diría a un amigo que estuviera pensando esto?',
    ],
  };

  const getRandomQuestions = () => {
    const questions =
      socraticQuestions[language as keyof typeof socraticQuestions] || socraticQuestions['pt-BR'];
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  };

  const [evidenceQuestions] = useState(getRandomQuestions());

  const handleSubmit = async () => {
    if (!thought.trim()) return;
    await generateReframe(thought, beliefStrength);
  };

  React.useEffect(() => {
    if (reframe && onReframeGenerated) {
      onReframeGenerated(thought, reframe);
    }
  }, [reframe, thought, onReframeGenerated]);

  const handleReset = () => {
    setThought('');
    setBeliefStrength(70);
    setShowEvidence(false);
    reset();

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#0d0d0d] bg-opacity-90 rounded-xl p-5 shadow-lg border border-[#2C3E50]">
      <h2 className="text-2xl font-bold text-[#6DAEDB] mb-4 flex items-center">
        <RefreshCw size={16} className="text-[#6DAEDB] mr-2" />
        {t('reframe.title')}
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-white mb-2">{t('reframe.step1')}</h3>
          <textarea
            ref={inputRef}
            value={thought}
            onChange={e => setThought(e.target.value)}
            placeholder={t('reframe.thoughtPlaceholder')}
            className="w-full p-3 bg-[#1f2d36] border border-[#2a3b47] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]"
            rows={3}
            maxLength={128}
            disabled={isLoading || !!reframe}
          />
          <div className="text-right text-sm text-[#AAB9C3] mt-1">{thought.length}/128</div>
        </div>

        {thought && !reframe && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-lg font-medium text-white mb-2">{t('reframe.step2')}</h3>
            <div className="mb-2">
              <label className="text-[#AAB9C3] text-sm">
                {t('reframe.beliefStrength')}:{' '}
                <span className="font-bold text-white">{beliefStrength}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={beliefStrength}
                onChange={e => setBeliefStrength(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mt-3">
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="text-sm text-[#6DAEDB] hover:text-[#A3C9F7] transition"
                disabled={isLoading}
              >
                {showEvidence ? t('reframe.hideEvidence') : t('reframe.showEvidence')}
              </button>

              <AnimatePresence>
                {showEvidence && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-[#1a1a1a] rounded-lg border border-[#2C3E50]"
                  >
                    <p className="text-[#AAB9C3] mb-2 text-sm">{t('reframe.evidencePrompt')}</p>
                    <ul className="list-disc pl-5 space-y-2 text-white">
                      {evidenceQuestions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {thought && !reframe && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black font-medium rounded-lg transition"
              disabled={isLoading}
            >
              {t('reframe.generateBtn')}
            </button>
          </motion.div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-12 h-12 border-4 border-[#6DAEDB] border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-[#AAB9C3]">{t('reframe.processing')}</p>
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-lg ${isSuicidal ? 'bg-red-900 bg-opacity-30 border border-red-700' : 'bg-[#2C3E50]'}`}
          >
            <p className={`${isSuicidal ? 'text-red-300 font-bold' : 'text-[#AAB9C3]'}`}>{error}</p>
            {isSuicidal && (
              <p className="mt-2 text-white">
                <a href="tel:188" className="underline font-bold">
                  188
                </a>{' '}
                - {t('reframe.callCVV')}
              </p>
            )}
            <button onClick={handleReset} className="mt-3 text-sm text-[#6DAEDB] hover:underline">
              {t('reframe.tryAgain')}
            </button>
          </motion.div>
        )}

        {reframe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-[#2C3E50] p-4 rounded-lg"
          >
            <h3 className="text-lg font-medium text-white mb-2">{t('reframe.result')}</h3>
            <p className="text-[#E0ECF1] italic">"{reframe}"</p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleReset}
                className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                {t('reframe.newThought')}
              </button>

              <button
                onClick={onChatRedirect}
                className="py-2 px-4 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black font-medium rounded-lg transition flex-1 flex justify-center items-center"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    {t('reframe.redirecting')}
                  </>
                ) : (
                  t('reframe.chatCTA')
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ReframeExpress;
