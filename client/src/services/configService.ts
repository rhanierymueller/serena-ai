import { BASE_URL } from '../config';

interface PublicConfig {
  stripePubKey: string;
  plans: {
    tokens: number;
    priceUsd: number;
    priceBrl: number;
  }[];
  currencyConversionRate: number;
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
}

let cachedConfig: PublicConfig | null = null;

/**
 * Busca as configurações públicas do servidor
 */
export const getPublicConfig = async (): Promise<PublicConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/config/public-config`);

    if (!response.ok) {
      throw new Error(`Erro ao buscar configurações: ${response.status}`);
    }

    const config = await response.json();
    cachedConfig = config;
    return config;
  } catch (error) {
    const defaultPriceUsd2k = 9.99;
    const defaultPriceUsd5k = 19.99;
    const defaultPriceUsd10k = 29.99;
    const defaultPriceBrl2k = 49.9;
    const defaultPriceBrl5k = 99.0;
    const defaultPriceBrl10k = 149.9;
    const defaultConversionRate = 6.0;

    return {
      stripePubKey: '',
      plans: [
        { tokens: 2000, priceUsd: defaultPriceUsd2k, priceBrl: defaultPriceBrl2k },
        { tokens: 5000, priceUsd: defaultPriceUsd5k, priceBrl: defaultPriceBrl5k },
        { tokens: 10000, priceUsd: defaultPriceUsd10k, priceBrl: defaultPriceBrl10k },
      ],
      currencyConversionRate: defaultConversionRate,
      emailjs: {
        serviceId: '',
        templateId: '',
        publicKey: '',
      },
    };
  }
};
