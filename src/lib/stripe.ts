import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with the provided publishable key
export const stripePromise = loadStripe('pk_test_51R4WdEH5sHHWeUYDoVpqts8Ljyl7P0wnTNI8TWJrkA6suiMjrIHjRlOKS0bgUrAXUHzNoO6NlwtZ7xKoYaSZ5aOK00jnxNqmiI');