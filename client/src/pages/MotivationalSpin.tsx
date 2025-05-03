import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCcw, Volume2 } from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useI18n } from '../i18n/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../config';

const MotivationalSpin: React.FC = () => {
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voicesReady, setVoicesReady] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      const interval = setInterval(() => {
        if (tryLoadVoices()) clearInterval(interval);
      }, 200);
      return () => clearInterval(interval);
    }
  }, []);

  const getVoiceByLanguage = (): SpeechSynthesisVoice | undefined => {
    const preferredVoices: { [key: string]: string[] } = {
      pt: ['Google português do Brasil', 'Luciana', 'Microsoft Maria Desktop', 'pt-BR-Wavenet-F'],
      en: ['Google US English', 'Microsoft Zira Desktop', 'en-US-Wavenet-C'],
      es: ['Google español', 'Microsoft Sabina Desktop', 'es-ES-Standard-A'],
    };

    const langPrefix = { pt: 'pt', en: 'en', es: 'es' }[language];
    const preferred = preferredVoices[language] || [];

    let voice = voices.find(
      v => v.lang.startsWith(langPrefix) && preferred.some(name => v.name.includes(name))
    );

    if (!voice) voice = voices.find(v => v.lang.startsWith(langPrefix));
    return voice;
  };

  const speak = (text: string) => {
    if (!voicesReady) return;
    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getVoiceByLanguage();
    if (voice) utterance.voice = voice;

    utterance.lang = language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'pt-BR';

    utterance.pitch = 1.1;
    utterance.rate = 0.95;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const handleSpin = async () => {
    setLoading(true);
    setQuote(null);
    audioRef.current?.play();

    try {
      const res = await fetch(`${BASE_URL}/api/motivacional`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      });

      const data = await res.json();
      setTimeout(() => {
        setQuote(data.quote);
        audioRef.current?.pause();
        if (audioRef.current) audioRef.current.currentTime = 0;
      }, 2000);
    } catch (err) {
      console.error(err);
      setQuote('Algo deu errado 😢');
      audioRef.current?.pause();
    } finally {
      setTimeout(() => setLoading(false), 2000);
    }
  };

  return (
    <PageLayout title={t('motivational.title')} backTo="/">
      <div className="flex flex-col items-center justify-center text-white min-h-[calc(100vh-80px)] px-4 text-center relative">
        <audio ref={audioRef} src="/audio/spin.mp3" preload="auto" />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <Sparkles size={48} className="text-[#6DAEDB] mb-2 animate-pulse" />
          <h1 className="text-3xl font-bold">{t('motivational.heading')}</h1>
          <p className="text-[#AAB9C3] mt-2">{t('motivational.description')}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {(quote || loading) && (
            <motion.div
              key={quote || 'loading'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
              className="bg-[#1a1a1a] border border-[#2a3b47] shadow-2xl rounded-2xl p-6 max-w-lg text-xl font-medium min-h-[150px] flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-pulse text-[#6DAEDB] text-center">
                  {t('motivational.loading')}
                </div>
              ) : (
                quote && (
                  <div className="text-[#E0ECF1]">
                    <p className="mb-4">“{quote}”</p>
                    <button
                      onClick={() => speak(quote)}
                      className="text-sm text-[#6DAEDB] hover:text-white transition flex items-center gap-2 justify-center"
                    >
                      <Volume2 size={18} /> {t('motivational.listen')}
                    </button>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleSpin}
          disabled={loading}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: loading
              ? '0 0 0px #6DAEDB'
              : ['0 0 10px #6DAEDB', '0 0 20px #4F91C3', '0 0 10px #6DAEDB'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'loop',
          }}
          className="mt-10 px-6 py-3 bg-[#6DAEDB] hover:bg-[#4F91C3] text-black font-semibold text-lg rounded-xl transition-all"
        >
          <RefreshCcw size={18} className="inline mr-2" />
          {t('motivational.spin')}
        </motion.button>
      </div>
    </PageLayout>
  );
};

export default MotivationalSpin;
