// src/hooks/useStripeCheckout.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUB_KEY!);

export async function handleStripeSubscriptionCheckout(userId: string, email: string) {
  try {
    const res = await fetch('http://localhost:4000/api/stripe/create-subscription-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: 'price_1RFKKN2ckL60RGGGQDkXBHt8',
        userId,
        userEmail: email,
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
