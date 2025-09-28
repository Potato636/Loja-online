import { loadStripe } from '@stripe/stripe-js';

let stripePromise;

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  console.warn('Missing Stripe public key, using mock Stripe for development');
  stripePromise = Promise.resolve({
    elements: () => ({
      create: (elementType: string, options?: any) => ({
        mount: (container: HTMLElement) => {
          container.innerHTML = '<div>Mock Payment Element</div>';
        },
        unmount: () => true,
      }),
    }),
    confirmPayment: () => Promise.resolve({ error: null, paymentIntent: { status: 'succeeded' } }),
    // Add other mock methods as needed
  });
} else {
  stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
}

export { stripePromise };
