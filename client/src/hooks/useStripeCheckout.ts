import { loadStripe } from '@stripe/stripe-js';
import { BASE_URL } from '../config';
import { getPublicConfig } from '../services/configService';

// Inicializa como null e carrega dinamicamente quando necessário
let stripePromise: Promise<any> | null = null;

// Função para obter a instância do Stripe com a chave do servidor
const getStripeInstance = async () => {
  if (!stripePromise) {
    const config = await getPublicConfig();
    if (!config.stripePubKey) {
      throw new Error('Chave pública do Stripe não disponível');
    }
    stripePromise = loadStripe(config.stripePubKey);
  }
  return stripePromise;
};

export async function handleStripeSubscriptionCheckout(
  userId: string,
  email: string,
  tokenAmount: number
) {
  try {
    const res = await fetch(`${BASE_URL}/api/stripe/create-token-checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        userEmail: email,
        tokenAmount,
      }),
    });

    const data = await res.json();

    if (!data.sessionId) throw new Error('Stripe session not created');

    // Obtém a instância do Stripe com a chave do servidor
    const stripe = await getStripeInstance();
    if (!stripe) throw new Error('Stripe.js not loaded');

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  } catch (err) {
    console.error('Erro ao iniciar checkout Stripe:', err);
    alert('Não foi possível redirecionar para o pagamento.');
  }
}
