"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Crown, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { getPremiumStatus, setPremiumStatus } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

export function SubscriptionManagement() {
  const [isCancelling, setIsCancelling] = useState(false)
  const { toast } = useToast()

  const premiumStatus = getPremiumStatus()

  const handleCancelSubscription = async () => {
    setIsCancelling(true)

    // Simulate cancellation process
    setTimeout(() => {
      const cancelledStatus = {
        isPremium: false,
        subscriptionType: undefined,
        subscriptionDate: undefined,
        expiryDate: undefined,
        cancelledAt: new Date().toISOString(),
      }

      setPremiumStatus(cancelledStatus)
      setIsCancelling(false)

      toast({
        title: "Abonnement gekündigt",
        description:
          "Ihr Premium-Abonnement wurde erfolgreich gekündigt. Sie können die Premium-Features bis zum Ablaufdatum weiter nutzen.",
      })
    }, 1500)
  }

  const formatSubscriptionType = (type: string | undefined) => {
    switch (type) {
      case "monthly":
        return "Monatsabonnement"
      case "yearly":
        return "Jahresabonnement"
      case "lifetime":
        return "Lebenslanger Zugang"
      default:
        return "Unbekannt"
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Nicht verfügbar"
    return new Date(dateString).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (!premiumStatus.isPremium) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Abonnement-Verwaltung
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Sie nutzen derzeit die kostenlose Version von AllergyCare.
              <Button variant="link" className="p-0 h-auto ml-1" asChild>
                <a href="/premium">Hier können Sie auf Premium upgraden</a>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          Abonnement-Verwaltung
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Premium Aktiv</Badge>
              <span className="text-sm font-medium">{formatSubscriptionType(premiumStatus.subscriptionType)}</span>
            </div>
            <div className="text-sm text-muted-foreground">Alle Premium-Features sind freigeschaltet</div>
          </div>
          <Crown className="h-8 w-8 text-yellow-600" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Abonnement seit:</span>
            </div>
            <div className="text-sm text-muted-foreground ml-6">{formatDate(premiumStatus.subscriptionDate)}</div>
          </div>

          {premiumStatus.expiryDate && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Läuft ab am:</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">{formatDate(premiumStatus.expiryDate)}</div>
            </div>
          )}

          {premiumStatus.subscriptionType === "lifetime" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">Lebenslanger Zugang</span>
              </div>
              <div className="text-sm text-muted-foreground ml-6">Kein Ablaufdatum - unbegrenzt gültig</div>
            </div>
          )}
        </div>

        {premiumStatus.subscriptionType !== "lifetime" && (
          <div className="pt-4 border-t">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Abonnement verwalten</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Sie können Ihr Abonnement jederzeit kündigen. Nach der Kündigung können Sie die Premium-Features bis
                  zum Ablaufdatum weiter nutzen.
                </p>
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isCancelling}>
                    <XCircle className="mr-2 h-4 w-4" />
                    {isCancelling ? "Wird gekündigt..." : "Abonnement kündigen"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Abonnement kündigen?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      <p>Möchten Sie Ihr {formatSubscriptionType(premiumStatus.subscriptionType)} wirklich kündigen?</p>
                      <div className="bg-orange-50 p-3 rounded border border-orange-200">
                        <p className="text-sm">
                          <strong>Was passiert nach der Kündigung:</strong>
                        </p>
                        <ul className="text-sm mt-1 space-y-1">
                          <li>• Premium-Features bleiben bis {formatDate(premiumStatus.expiryDate)} aktiv</li>
                          <li>• Danach gelten wieder die kostenlosen Limits</li>
                          <li>• Ihre Daten bleiben vollständig erhalten</li>
                          <li>• Sie können jederzeit wieder upgraden</li>
                        </ul>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Ja, kündigen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Hinweis:</strong> Dies ist eine Simulation der Kündigungsfunktion. In der echten App würde
                  hier die Integration mit dem Zahlungsanbieter erfolgen.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
