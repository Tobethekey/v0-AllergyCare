"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { stripePromise, STRIPE_PRICES } from "@/lib/stripe"
import { Loader2 } from "lucide-react"

interface StripeCheckoutProps {
  plan: "monthly" | "yearly" | "lifetime"
  children: React.ReactNode
  className?: string
}

export function StripeCheckout({ plan, children, className }: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    setIsLoading(true)

    try {
      const stripe = await stripePromise

      if (!stripe) {
        throw new Error("Stripe konnte nicht geladen werden")
      }

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: STRIPE_PRICES[plan],
          successUrl: `${window.location.origin}/premium/success?plan=${plan}`,
          cancelUrl: `${window.location.origin}/premium`,
        }),
      })

      const { sessionId, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Fehler beim Checkout",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={isLoading} className={className}>
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Wird geladen...
        </>
      ) : (
        children
      )}
    </Button>
  )
}
