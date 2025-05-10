import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext';
import thoughtReframeService from '../services/thoughtReframeService';

interface UseReframeOptions {
  onSuccess?: (reframe: string) => void;
  onError?: (error: string) => void;
}

interface ReframeResult {
  reframe: string | null;
  isLoading: boolean;
  error: string | null;
  isSuicidal: boolean;
  generateReframe: (thought: string, beliefStrength: number) => Promise<void>;
  reset: () => void;
}

/**
 * Hook para gerenciar a reestruturação cognitiva de pensamentos
 */
export function useReframe(options: UseReframeOptions = {}): ReframeResult {
  const { language, t } = useI18n();
  const [reframe, setReframe] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuicidal, setIsSuicidal] = useState(false);

  const generateReframe = async (thought: string, beliefStrength: number) => {
    if (!thought.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setReframe(null);
    setIsSuicidal(false);
    
    try {
      const data = await thoughtReframeService.reframeThought({
        thought,
        belief: beliefStrength,
        lang: language
      });
      
      setReframe(data.reframe);
      options.onSuccess?.(data.reframe);
      
      // Salvar no localStorage se não estiver logado
      thoughtReframeService.saveToLocalStorage(thought, data.reframe, beliefStrength);
    } catch (err: any) {
      console.error('Erro ao processar reestruturação:', err);
      
      // Verificar se é um erro de conteúdo suicida
      if (err.isSuicidal) {
        setIsSuicidal(true);
        const errorMessage = err.helpMessage || t('reframe.emergencyHelp');
        setError(errorMessage);
        options.onError?.(errorMessage);
      } else {
        const errorMessage = err.error || t('reframe.errorProcessing');
        setError(errorMessage);
        options.onError?.(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setReframe(null);
    setError(null);
    setIsLoading(false);
    setIsSuicidal(false);
  };

  return {
    reframe,
    isLoading,
    error,
    isSuicidal,
    generateReframe,
    reset
  };
}

export default useReframe;
