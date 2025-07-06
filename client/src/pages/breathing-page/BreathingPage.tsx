import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Wind, Heart, Play, Square, Loader2 } from 'lucide-react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useI18n } from '../../i18n/I18nContext';

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
    <div className="min-h-screen bg-black text-white">
      <Header title={t('breathing.title')} backTo="/" fixed />

      {}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-black to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/5 via-transparent to-[#4F91C3]/5" />

        {}
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.2, 1.2, 1] : 1,
            opacity: isRunning ? [0.3, 0.6, 0.6, 0.3] : 0.3,
          }}
          transition={{
            duration: isRunning ? 11 : 4,
            ease: 'easeInOut',
            repeat: Infinity,
            times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
          }}
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-[#6DAEDB]/10 to-[#4F91C3]/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.1, 1.1, 1] : 1,
            opacity: isRunning ? [0.2, 0.4, 0.4, 0.2] : 0.2,
          }}
          transition={{
            duration: isRunning ? 11 : 4,
            ease: 'easeInOut',
            repeat: Infinity,
            times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
            delay: 0.3,
          }}
          className="absolute bottom-32 right-10 w-24 h-24 bg-gradient-to-br from-[#4F91C3]/10 to-[#6DAEDB]/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.15, 1.15, 1] : 1,
            y: isRunning ? [0, -10, -10, 0] : 0,
            opacity: isRunning ? [0.25, 0.5, 0.5, 0.25] : 0.25,
          }}
          transition={{
            duration: isRunning ? 11 : 4,
            ease: 'easeInOut',
            repeat: Infinity,
            times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
            delay: 0.6,
          }}
          className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-[#6DAEDB]/8 to-[#4F91C3]/8 rounded-full blur-lg"
        />
        <motion.div
          animate={{
            scale: isRunning ? [1, 1.25, 1.25, 1] : 1,
            y: isRunning ? [0, 15, 15, 0] : 0,
            opacity: isRunning ? [0.3, 0.6, 0.6, 0.3] : 0.3,
          }}
          transition={{
            duration: isRunning ? 11 : 4,
            ease: 'easeInOut',
            repeat: Infinity,
            times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
            delay: 0.9,
          }}
          className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-gradient-to-br from-[#4F91C3]/8 to-[#6DAEDB]/8 rounded-full blur-lg"
        />

        {}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.3, 1.3, 1] : 1,
              opacity: isRunning ? [0.3, 0.1, 0.1, 0.3] : 0.3,
            }}
            transition={{
              duration: isRunning ? 11 : 4,
              ease: 'easeInOut',
              repeat: Infinity,
              times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
            }}
            className="absolute top-1/2 left-1/2 w-96 h-96 border border-[#6DAEDB]/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.4, 1.4, 1] : 1,
              opacity: isRunning ? [0.2, 0.05, 0.05, 0.2] : 0.2,
            }}
            transition={{
              duration: isRunning ? 11 : 4,
              ease: 'easeInOut',
              repeat: Infinity,
              times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
              delay: 1,
            }}
            className="absolute top-1/2 left-1/2 w-80 h-80 border border-[#4F91C3]/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          />
          <motion.div
            animate={{
              scale: isRunning ? [1, 1.5, 1.5, 1] : 1,
              opacity: isRunning ? [0.1, 0.03, 0.03, 0.1] : 0.1,
            }}
            transition={{
              duration: isRunning ? 11 : 4,
              ease: 'easeInOut',
              repeat: Infinity,
              times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
              delay: 2,
            }}
            className="absolute top-1/2 left-1/2 w-64 h-64 border border-[#6DAEDB]/20 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          />
        </div>
      </div>

      {}
      <div className="relative z-10 pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          {}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Wind size={48} className="text-[#6DAEDB] animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 rounded-full blur-2xl"></div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-6">
              {t('breathing.title')}
            </h1>
            <p className="text-lg md:text-xl text-[#AAB9C3] max-w-4xl mx-auto leading-relaxed mb-8">
              Exercícios de respiração guiada para relaxamento e bem-estar
            </p>

            {}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center text-sm">
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#6DAEDB]/10 to-[#4F91C3]/10 px-4 py-2 rounded-full border border-[#6DAEDB]/20">
                <Waves size={16} className="text-[#6DAEDB]" />
                <span className="text-[#E0ECF1]">Técnica 4-3-4</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#4F91C3]/10 to-[#6DAEDB]/10 px-4 py-2 rounded-full border border-[#4F91C3]/20">
                <Heart size={16} className="text-[#4F91C3]" />
                <span className="text-[#E0ECF1]">Reduz ansiedade</span>
              </div>
            </div>
          </motion.div>

          {}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-[#6DAEDB]/20">
              {}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: isRunning ? [1, 1.6, 1.6, 1] : 1,
                      filter: isRunning ? 'blur(0px)' : 'blur(1px)',
                      boxShadow: isRunning
                        ? [
                            '0 0 30px rgba(109, 174, 219, 0.3)',
                            '0 0 60px rgba(109, 174, 219, 0.6)',
                            '0 0 60px rgba(109, 174, 219, 0.6)',
                            '0 0 30px rgba(109, 174, 219, 0.3)',
                          ]
                        : '0 0 30px rgba(109, 174, 219, 0.3)',
                    }}
                    transition={{
                      duration: isRunning ? 11 : 2,
                      ease: 'easeInOut',
                      repeat: isRunning ? Infinity : 0,
                      times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
                    }}
                    className="w-64 h-64 rounded-full bg-gradient-to-br from-[#6DAEDB] to-[#4F91C3] shadow-2xl flex items-center justify-center"
                  >
                    <div className="w-56 h-56 rounded-full bg-gradient-to-br from-[#6DAEDB]/20 to-[#4F91C3]/20 backdrop-blur-sm flex items-center justify-center border border-white/10">
                      <Wind size={48} className="text-white/80" />
                    </div>
                  </motion.div>

                  {}
                  <div className="absolute inset-0 pointer-events-none">
                    <motion.div
                      animate={{
                        scale: isRunning ? [1, 1.8, 1.8, 1] : 1,
                        opacity: isRunning ? [0.4, 0.1, 0.1, 0.4] : 0.4,
                      }}
                      transition={{
                        duration: isRunning ? 11 : 2,
                        ease: 'easeInOut',
                        repeat: isRunning ? Infinity : 0,
                        times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
                      }}
                      className="absolute inset-0 border-2 border-[#6DAEDB]/30 rounded-full"
                    />
                    <motion.div
                      animate={{
                        scale: isRunning ? [1, 2.2, 2.2, 1] : 1,
                        opacity: isRunning ? [0.3, 0.05, 0.05, 0.3] : 0.3,
                      }}
                      transition={{
                        duration: isRunning ? 11 : 2,
                        ease: 'easeInOut',
                        repeat: isRunning ? Infinity : 0,
                        times: isRunning ? [0, 0.36, 0.64, 1] : undefined,
                        delay: 0.5,
                      }}
                      className="absolute inset-0 border border-[#4F91C3]/20 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {}
              <div className="text-center mb-8">
                <AnimatePresence mode="wait">
                  <motion.h2
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-4"
                  >
                    {steps[currentStep].text}
                  </motion.h2>
                </AnimatePresence>

                {isRunning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[#AAB9C3] text-lg"
                  >
                    Siga o ritmo da respiração
                  </motion.div>
                )}
              </div>

              {}
              <div className="flex justify-center">
                {!isRunning ? (
                  <button
                    onClick={startSession}
                    disabled={!voicesReady}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 ${
                      !voicesReady
                        ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                        : 'bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white'
                    }`}
                  >
                    {!voicesReady ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        {t('breathing.loading')}
                      </>
                    ) : (
                      <>
                        <Play size={20} />
                        {t('breathing.start')}
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={stopSession}
                    className="px-8 py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-3 border-2 border-[#6DAEDB] text-[#6DAEDB] hover:bg-[#6DAEDB]/10"
                  >
                    <Square size={20} />
                    {t('breathing.stop')}
                  </button>
                )}
              </div>{!isRunning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center text-[#AAB9C3]"
                >
                  <p className="text-lg mb-4">Como funciona:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-4 rounded-xl border border-[#6DAEDB]/10">
                      <div className="text-[#6DAEDB] text-2xl font-bold mb-2">4s</div>
                      <div className="text-sm">Inspire</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-4 rounded-xl border border-[#4F91C3]/10">
                      <div className="text-[#4F91C3] text-2xl font-bold mb-2">3s</div>
                      <div className="text-sm">Segure</div>
                    </div>
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 p-4 rounded-xl border border-[#6DAEDB]/10">
                      <div className="text-[#6DAEDB] text-2xl font-bold mb-2">4s</div>
                      <div className="text-sm">Expire</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BreathingSession;