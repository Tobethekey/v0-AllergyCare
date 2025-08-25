import { loadStripe } from "@stripe/stripe-js"

// Stripe Public Key (in production aus Umgebungsvariablen)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_...")

export { stripePromise }

// Stripe Price IDs für die verschiedenen Pläne
export const STRIPE_PRICES = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID || "price_monthly_test",
  yearly: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID || "price_yearly_test",
  lifetime: process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID || "price_lifetime_test",
}

export interface CheckoutSessionData {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerEmail?: string
}
