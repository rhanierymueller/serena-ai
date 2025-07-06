import React, { useState, useRef } from 'react';
import { useI18n } from '../../../../i18n/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';
import useReframe from '../../../../hooks/useReframe';
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
    <div className="w-full max-w-3xl mx-auto bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#6DAEDB]/20">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .slider-thumb::-webkit-slider-thumb {
            appearance: none;
            width: 20px;
            height: 20px;
            background: linear-gradient(45deg, #6DAEDB, #4F91C3);
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(109, 174, 219, 0.5);
          }
          .slider-thumb::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: linear-gradient(45deg, #6DAEDB, #4F91C3);
            border-radius: 50%;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 10px rgba(109, 174, 219, 0.5);
          }
        `,
        }}
      />
      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-8 flex items-center justify-center">
        <RefreshCw size={20} className="text-[#6DAEDB] mr-3" />
        {t('reframe.title')}
      </h2>
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-7 h-7 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center text-black font-bold text-sm">
              1
            </span>
            {t('reframe.step1')}
          </h3>
          <textarea
            ref={inputRef}
            value={thought}
            onChange={e => setThought(e.target.value)}
            placeholder={t('reframe.thoughtPlaceholder')}
            className="w-full p-4 bg-gray-900/80 border border-[#6DAEDB]/30 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6DAEDB] focus:border-transparent transition-all resize-none"
            rows={4}
            maxLength={128}
            disabled={isLoading || !!reframe}
          />
          <div className="text-right text-sm text-[#AAB9C3] mt-2 font-medium">
            {thought.length}/128
          </div>
        </div>

        {thought && !reframe && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-6 rounded-2xl border border-[#6DAEDB]/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center text-black font-bold text-sm">
                2
              </span>
              {t('reframe.step2')}
            </h3>
            <div className="mb-6">
              <label className="text-[#AAB9C3] text-lg mb-3 block">
                {t('reframe.beliefStrength')}:{' '}
                <span className="font-bold text-[#6DAEDB] text-2xl">{beliefStrength}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={beliefStrength}
                onChange={e => setBeliefStrength(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                disabled={isLoading}
              />
              <div className="flex justify-between text-sm text-gray-400 mt-2">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 hover:from-[#6DAEDB]/30 hover:to-[#4F91C3]/30 text-[#6DAEDB] border border-[#6DAEDB]/30 rounded-xl transition-all transform hover:scale-105"
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
                    className="mt-4 p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 rounded-xl border border-[#6DAEDB]/20"
                  >
                    <p className="text-[#AAB9C3] mb-4 text-base font-medium">
                      {t('reframe.evidencePrompt')}
                    </p>
                    <ul className="list-disc pl-6 space-y-3 text-white">
                      {evidenceQuestions.map((question, index) => (
                        <li key={index} className="text-sm leading-relaxed">
                          {question}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {thought && !reframe && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-bold text-base rounded-2xl transition-all transform hover:scale-105 shadow-lg"
              disabled={isLoading}
            >
              {t('reframe.generateBtn')}
            </button>
          </motion.div>
        )}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-2xl border border-[#6DAEDB]/10"
          >
            <div className="w-16 h-16 border-4 border-[#6DAEDB] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[#6DAEDB] font-semibold text-lg">{t('reframe.processing')}</p>
            <p className="text-[#AAB9C3] text-sm mt-2">Analisando seu pensamento&hellip;</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-4 rounded-lg ${isSuicidal ? 'bg-red-900 bg-opacity-30 border border-red-700' : 'bg-[#2C3E50]'}`}
          >
            <p className={`${isSuicidal ? 'text-red-300 font-bold' : 'text-[#AAB9C3]'}`}>
              {isSuicidal ? t('reframe.emergencyHelp') : error}
            </p>
            {isSuicidal && (
              <p className="mt-2 text-white font-bold">
                {t('reframe.emergencyHelp')}
                <br />
                {language === 'pt' ? (
                  <>
                    <a href="tel:188" className="underline font-bold">
                      188
                    </a>{' '}
                    - {t('reframe.callCVV')}
                  </>
                ) : language === 'es' ? (
                  <>
                    <a href="tel:717003717" className="underline font-bold">
                      717 003 717
                    </a>{' '}
                    - Teléfono de la Esperanza (España)
                  </>
                ) : (
                  <>
                    <a href="tel:988" className="underline font-bold">
                      988
                    </a>{' '}
                    - Suicide & Crisis Lifeline (USA)
                    <br />
                    <a
                      href="https://www.befrienders.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Find help worldwide
                    </a>
                  </>
                )}
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
            className="bg-gradient-to-br from-green-900/30 to-green-800/30 backdrop-blur-sm border border-green-400/20 rounded-3xl p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-300 rounded-full flex items-center justify-center text-black font-bold text-sm">
                ✓
              </span>
              {t('reframe.result')}
            </h3>
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 p-6 rounded-2xl border border-green-400/20 mb-6">
              <p className="text-white text-lg leading-relaxed font-medium">
                &ldquo;{reframe}&rdquo;
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="py-2 px-4 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold rounded-xl transition-all transform hover:scale-105 text-sm"
              >
                {t('reframe.newThought')}
              </button>
              <button
                onClick={onChatRedirect}
                className="py-2 px-4 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-bold rounded-xl transition-all transform hover:scale-105 flex-1 flex justify-center items-center shadow-lg text-sm"
                disabled={isRedirecting}
              >
                {isRedirecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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