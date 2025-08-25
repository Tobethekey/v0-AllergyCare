"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Crown, ArrowRight } from "lucide-react"
import { setPremiumStatus } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function PremiumSuccessPage() {
  const [isActivating, setIsActivating] = useState(true)
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan") as "monthly" | "yearly" | "lifetime" | null
  const { toast } = useToast()

  useEffect(() => {
    // Simuliere Premium-Aktivierung nach erfolgreicher Zahlung
    const activatePremium = async () => {
      if (!plan) return

      setTimeout(() => {
        const newStatus = {
          isPremium: true,
          subscriptionType: plan,
          subscriptionDate: new Date().toISOString(),
          expiryDate:
            plan === "lifetime"
              ? undefined
              : plan === "yearly"
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }

        setPremiumStatus(newStatus)
        setIsActivating(false)

        toast({
          title: "Premium aktiviert!",
          description: `Ihr ${plan === "lifetime" ? "Lifetime" : plan === "yearly" ? "Jahres" : "Monats"}-Plan ist jetzt aktiv.`,
        })
      }, 2000)
    }

    activatePremium()
  }, [plan, toast])

  const formatPlanName = (planType: string | null) => {
    switch (planType) {
      case "monthly":
        return "Monatsplan"
      case "yearly":
        return "Jahresplan"
      case "lifetime":
        return "Lifetime-Plan"
      default:
        return "Premium-Plan"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            {isActivating ? (
              <Crown className="h-8 w-8 text-yellow-600 animate-pulse" />
            ) : (
              <CheckCircle className="h-8 w-8 text-green-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {isActivating ? "Premium wird aktiviert..." : "Willkommen bei Premium!"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {isActivating ? (
            <p className="text-muted-foreground">
              Ihr {formatPlanName(plan)} wird gerade aktiviert. Bitte warten Sie einen Moment.
            </p>
          ) : (
            <>
              <p className="text-muted-foreground">
                Vielen Dank für Ihr Vertrauen! Ihr {formatPlanName(plan)} ist jetzt aktiv und Sie haben Zugang zu allen
                Premium-Features.
              </p>
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Zur App
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-transparent">
                  <Link href="/premium">Premium-Status anzeigen</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
