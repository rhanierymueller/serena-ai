import { useRef, useState, useCallback } from 'react';

interface UseSpeechRecognitionProps {
  language?: string;
  onResult: (text: string) => void;
}

export const useSpeechRecognition = ({
  language = 'pt-BR',
  onResult,
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Browser does not support speech recognition');
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return true;
  }, [language, onResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current && !initSpeechRecognition()) {
      alert('Seu navegador não suporta reconhecimento de voz.');
      return;
    }

    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  }, [initSpeechRecognition, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    startListening,
    stopListening,
    isSupported: () => 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window,
  };
};