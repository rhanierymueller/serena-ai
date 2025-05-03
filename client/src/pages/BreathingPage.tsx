import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '../components/PageLayout';
import { useI18n } from '../i18n/I18nContext';

type Step = { text: string; duration: number };

const BreathingSession: React.FC = () => {
  const { t, language } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesReady, setVoicesReady] = useState(false);

  const isRunningRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  const steps: Step[] = [
    { text: t('breathing.inhale'), duration: 4000 },
    { text: t('breathing.hold'), duration: 3000 },
    { text: t('breathing.exhale'), duration: 4000 },
  ];

  useEffect(() => {
    const tryLoadVoices = () => {
      const available = speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
        setVoicesReady(true);
        return true;
      }
      return false;
    };

    if (!tryLoadVoices()) {
      const interval = window.setInterval(() => {
        if (tryLoadVoices()) window.clearInterval(interval);
      }, 200);
      return () => window.clearInterval(interval);
    }
  }, []);

  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  const getCalmVoice = (): SpeechSynthesisVoice | undefined => {
    const preferredVoices: { [key: string]: string[] } = {
      pt: ['Google português do Brasil', 'Luciana', 'Microsoft Maria Desktop', 'pt-BR-Wavenet-F'],
      en: ['Google US English', 'Microsoft Zira Desktop', 'en-US-Wavenet-C'],
      es: ['Google español', 'Microsoft Sabina Desktop', 'es-ES-Standard-A'],
    };

    const voicePrefs = preferredVoices[language] || [];
    const langPrefix = { pt: 'pt', en: 'en', es: 'es' }[language];

    let voice = voices.find(
      v => v.lang.startsWith(langPrefix) && voicePrefs.some(name => v.name.includes(name))
    );

    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(langPrefix));
    }

    return voice;
  };

  const runStep = (index: number) => {
    setCurrentStep(index);
    const { text, duration } = steps[index];
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getCalmVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = {
      pt: 'pt-BR',
      en: 'en-US',
      es: 'es-ES',
    }[language];
    utterance.rate = 0.8;
    utterance.pitch = 1.1;

    utterance.onend = () => {
      if (!isRunningRef.current) return;
      timeoutRef.current = window.setTimeout(() => {
        runStep((index + 1) % steps.length);
      }, duration);
    };

    speechSynthesis.speak(utterance);
  };

  const startSession = () => {
    if (!voicesReady || isRunningRef.current) return;
    setIsRunning(true);
    isRunningRef.current = true;
    ambientAudioRef.current?.play();
    runStep(0);
  };

  const stopSession = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    speechSynthesis.cancel();
    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
      ambientAudioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    ambientAudioRef.current = new Audio('/audio/fundo-relaxante.mp3');
    ambientAudioRef.current.loop = true;
    ambientAudioRef.current.volume = 0.3;
    return stopSession;
  }, []);

  return (
    <PageLayout backTo="/" title={t('breathing.title')}>
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-white text-center max-w-lg mx-auto">
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: isRunning ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 8, repeat: Infinity }}
              className="w-40 h-40 rounded-full bg-[#6DAEDB] shadow-2xl"
            />
          </div>

          <div className="mt-10">
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="text-3xl font-bold mb-6"
              >
                {steps[currentStep].text}
              </motion.h2>
            </AnimatePresence>

            <div className="space-x-4">
              {!isRunning ? (
                <button
                  onClick={startSession}
                  disabled={!voicesReady}
                  className={`px-6 py-2 rounded-xl font-semibold transition ${
                    !voicesReady
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-[#6DAEDB] hover:bg-[#4F91C3] text-black'
                  }`}
                >
                  {!voicesReady ? t('breathing.loading') : t('breathing.start')}
                </button>
              ) : (
                <button
                  onClick={stopSession}
                  className="px-6 py-2 rounded-xl font-semibold transition border border-[#6DAEDB] text-[#6DAEDB] hover:bg-[#2a3b47]"
                >
                  {t('breathing.stop')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default BreathingSession;
