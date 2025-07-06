import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, RefreshCcw, Volume2 } from 'lucide-react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useI18n } from '../../i18n/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../../config';
import ParticlesBackground from '../../components/particles-background/ParticlesBackground';

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
    <div className="min-h-screen flex flex-col bg-black text-white overflow-hidden">
      <div className="relative z-50">
        <Header title={t('motivational.title')} backTo="/" fixed />
      </div><div className="fixed inset-0 bg-black text-white overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-[#6DAEDB]/15 via-black to-[#4F91C3]/10 z-5" /><ParticlesBackground id="motivational-particles" />
        <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4 text-center py-20">
          <audio ref={audioRef} src="/audio/spin.mp3" preload="auto" />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="relative">
              <Sparkles size={48} className="text-[#6DAEDB] mb-4 animate-pulse mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 rounded-full blur-xl"></div>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent mb-4">
              {t('motivational.heading')}
            </h1>
            <p className="text-lg text-[#AAB9C3] max-w-2xl mx-auto leading-relaxed">
              {t('motivational.description')}
            </p>
          </motion.div>
          <AnimatePresence mode="wait">
            {(quote || loading) && (
              <motion.div
                key={quote || 'loading'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm border border-[#6DAEDB]/20 shadow-2xl rounded-3xl p-8 max-w-2xl text-xl font-medium min-h-[200px] flex items-center justify-center mb-8"
              >
                {loading ? (
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-[#6DAEDB] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <div className="text-[#6DAEDB] font-semibold">{t('motivational.loading')}</div>
                  </div>
                ) : (
                  quote && (
                    <div className="text-center">
                      <p className="mb-6 text-white leading-relaxed">&ldquo;{quote}&rdquo;</p>
                      <button
                        onClick={() => speak(quote)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6DAEDB]/20 to-[#4F91C3]/20 hover:from-[#6DAEDB]/30 hover:to-[#4F91C3]/30 text-[#6DAEDB] border border-[#6DAEDB]/30 rounded-xl transition-all transform hover:scale-105"
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
            whileHover={{ scale: 1.05 }}
            animate={{
              boxShadow: loading
                ? '0 0 0px #6DAEDB'
                : ['0 0 20px #6DAEDB50', '0 0 40px #4F91C350', '0 0 20px #6DAEDB50'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="px-8 py-4 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-bold text-lg rounded-2xl transition-all shadow-lg disabled:opacity-70"
          >
            <RefreshCcw size={20} className={`inline mr-3 ${loading ? 'animate-spin' : ''}`} />
            {t('motivational.spin')}
          </motion.button>
        </div>
      </div>
      <div className="relative z-40 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

export default MotivationalSpin;