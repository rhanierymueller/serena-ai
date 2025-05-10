import { BASE_URL } from '../config';

interface ReframeRequest {
  thought: string;
  belief: number;
  lang?: string;
}

interface ReframeResponse {
  reframe: string;
}

interface ErrorResponse {
  error: string;
  isSuicidal?: boolean;
  helpMessage?: string;
}

export const thoughtReframeService = {
  /**
   * Envia um pensamento para ser reestruturado
   * @param data Dados do pensamento a ser reestruturado
   * @returns Resposta com o pensamento reestruturado
   */
  async reframeThought(data: ReframeRequest): Promise<ReframeResponse> {
    try {
      const response = await fetch(`${BASE_URL}/api/thought-reframe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw {
          status: response.status,
          ...errorData,
        };
      }

      return (await response.json()) as ReframeResponse;
    } catch (error) {
      console.error('Erro ao processar reestruturação:', error);
      throw error;
    }
  },

  /**
   * Salva um pensamento reestruturado no localStorage para usuários não logados
   * @param originalThought Pensamento original
   * @param reframedThought Pensamento reestruturado
   * @param beliefStrength Intensidade da crença (0-100)
   */
  saveToLocalStorage(originalThought: string, reframedThought: string, beliefStrength: number) {
    try {
      const savedReframes = localStorage.getItem('thoughtReframes');
      const reframes = savedReframes ? JSON.parse(savedReframes) : [];

      reframes.push({
        id: Date.now().toString(),
        originalThought,
        reframedThought,
        beliefStrength,
        createdAt: new Date().toISOString(),
      });

      if (reframes.length > 10) {
        reframes.shift();
      }

      localStorage.setItem('thoughtReframes', JSON.stringify(reframes));
    } catch (error) {
      console.error('Erro ao salvar no localStorage:', error);
    }
  },

  /**
   * Obtém os pensamentos reestruturados salvos no localStorage
   * @returns Lista de pensamentos reestruturados
   */
  getFromLocalStorage() {
    try {
      const savedReframes = localStorage.getItem('thoughtReframes');
      return savedReframes ? JSON.parse(savedReframes) : [];
    } catch (error) {
      console.error('Erro ao ler do localStorage:', error);
      return [];
    }
  },
};

export default thoughtReframeService;
