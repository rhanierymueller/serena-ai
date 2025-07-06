import { useState, useCallback } from 'react';

interface UseTextToSpeechProps {
  language?: string;
  rate?: number;
  pitch?: number;
}

interface VoiceConfig {
  [key: string]: string[];
}

export const useTextToSpeech = ({
  language = 'pt-BR',
  rate = 1,
  pitch = 1,
}: UseTextToSpeechProps = {}) => {
  const [isNarrating, setIsNarrating] = useState(false);

  const removeEmojis = useCallback((text: string): string => {
    return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/gu, '');
  }, []);

  const getPreferredVoice = useCallback((lang: string): SpeechSynthesisVoice | null => {
    const voices = speechSynthesis.getVoices();

    const femaleVoiceNames: VoiceConfig = {
      'pt-BR': [
        'Luciana',
        'Microsoft Maria Desktop',
        'Google português do Brasil',
        'pt-BR-Wavenet-F',
      ],
      'en-US': ['Samantha', 'Google US English', 'en-US-Wavenet-F'],
      'es-ES': ['Conchita', 'Google español', 'es-ES-Wavenet-F'],
    };

    const voiceNames = femaleVoiceNames[lang] || [];
    let preferred = voices.find(voice =>
      voiceNames.some(name => voice.name.toLowerCase().includes(name.toLowerCase()))
    );
    if (!preferred) {
      preferred = voices.find(voice => voice.lang === lang);
    }

    return preferred || null;
  }, []);

  const speak = useCallback(
    (text: string, fromVoice = false) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Text-to-speech not supported in this browser');
        return;
      }

      const cleanText = removeEmojis(text);
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = language;

      const assignVoiceAndSpeak = () => {
        const preferredVoice = getPreferredVoice(language);
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsNarrating(true);
        utterance.onend = () => setIsNarrating(false);
        utterance.onerror = () => setIsNarrating(false);
        setIsNarrating(true);
        speechSynthesis.cancel(); 
        speechSynthesis.speak(utterance);
      };
      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.onvoiceschanged = () => {
          assignVoiceAndSpeak();
          speechSynthesis.onvoiceschanged = null;
        };
      } else {
        assignVoiceAndSpeak();
      }
    },
    [language, rate, pitch, removeEmojis, getPreferredVoice]
  );

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsNarrating(false);
  }, []);

  const isSupported = useCallback((): boolean => {
    return 'speechSynthesis' in window;
  }, []);

  return {
    speak,
    stop,
    isNarrating,
    isSupported,
  };
};