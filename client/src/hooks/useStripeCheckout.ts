import { loadStripe } from '@stripe/stripe-js';
import { BASE_URL } from '../config'; // 👈 novo

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY!);

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

    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe.js not loaded');

    await stripe.redirectToCheckout({ sessionId: data.sessionId });
  } catch (err) {
    console.error('Erro ao iniciar checkout Stripe:', err);
    alert('Não foi possível redirecionar para o pagamento.');
  }
}
