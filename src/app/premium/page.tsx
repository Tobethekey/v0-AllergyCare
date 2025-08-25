"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Crown, Check, Zap, Shield, Users, FileText, Camera, BarChart3, Clock, Star } from "lucide-react"
import { PremiumFeatureCard } from "@/components/premium/PremiumFeatureCard"
import { PremiumBadge } from "@/components/premium/PremiumBadge"
import PageHeader from "@/components/PageHeader"
import { getPremiumStatus, getRemainingUsage } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StripeCheckout } from "@/components/premium/StripeCheckout"

export default function PremiumPage() {
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly" | "lifetime" | null>(null)
  const { toast } = useToast()

  const premiumStatus = getPremiumStatus()
  const remainingUsage = getRemainingUsage()

  const handleUpgrade = async (plan: "monthly" | "yearly" | "lifetime") => {
    // Diese Funktion wird jetzt durch die StripeCheckout-Komponente ersetzt
    console.log(`Upgrading to ${plan} plan via Stripe`)
  }

  const freeFeatures = [
    "1 Mahlzeit pro Tag dokumentieren",
    "1 Symptom pro Tag erfassen",
    "1 Export pro Tag",
    "1 Benutzerprofil",
    "Grundlegende Timeline-Ansicht",
    "Lokale Datenspeicherung",
  ]

  const premiumFeatures = [
    "Unbegrenzte Mahlzeiten dokumentieren",
    "Unbegrenzte Symptome erfassen",
    "Unbegrenzte PDF & CSV Exporte",
    "Unbegrenzte Benutzerprofile für die ganze Familie",
    "Erweiterte AI-Analysen und Muster-Erkennung",
    "Automatische Backup-Funktion",
    "Unbegrenzte Foto-Uploads für Mahlzeiten",
    "Erweiterte Filteroptionen in Berichten",
    "Prioritäts-Support",
    "Werbefreie Nutzung",
  ]

  if (premiumStatus.isPremium) {
    return (
      <div className="space-y-8">
        <PageHeader title="Premium Status" description="Sie nutzen bereits AllergyCare Premium mit allen Funktionen.">
          <PremiumBadge />
        </PageHeader>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Crown className="h-6 w-6" />
              Premium Aktiv
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {premiumStatus.subscriptionType === "lifetime"
                ? "Lebenslanger Zugang zu allen Premium-Features"
                : `${premiumStatus.subscriptionType === "yearly" ? "Jahres" : "Monats"}-Abonnement aktiv`}
              {premiumStatus.expiryDate && (
                <span className="block mt-1">
                  Läuft ab am: {new Date(premiumStatus.expiryDate).toLocaleDateString("de-DE")}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Ihre Premium-Vorteile
                </h4>
                <ul className="space-y-1 text-sm">
                  {premiumFeatures.slice(0, 5).map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Nutzungsstatistik
                </h4>
                <div className="text-sm space-y-1">
                  <div>Mahlzeiten heute: Unbegrenzt ✨</div>
                  <div>Symptome heute: Unbegrenzt ✨</div>
                  <div>Exporte heute: Unbegrenzt ✨</div>
                  <div>Profile: Unbegrenzt ✨</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alle Premium-Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Upgrade zu Premium"
        description="Schalten Sie alle Funktionen frei und nutzen Sie AllergyCare ohne Einschränkungen."
      />

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Aktuelle Nutzung:</strong> {remainingUsage.foodEntries} Mahlzeit(en), {remainingUsage.symptomEntries}{" "}
          Symptom(e), {remainingUsage.exports} Export(s) und {remainingUsage.profiles} Profil(e) heute noch verfügbar.
        </AlertDescription>
      </Alert>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Kostenlos
            </CardTitle>
            <CardDescription>Grundfunktionen für den Einstieg</CardDescription>
            <div className="text-2xl font-bold">0€</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {freeFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Badge variant="secondary" className="w-full justify-center">
              Aktueller Plan
            </Badge>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-400 shadow-lg relative">
          <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Empfohlen
          </Badge>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Premium
            </CardTitle>
            <CardDescription>Alle Funktionen ohne Einschränkungen</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {premiumFeatures.slice(0, 6).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
              <li className="text-xs text-muted-foreground">...und weitere Premium-Features</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <PremiumFeatureCard
          title="Monatsplan"
          description="Flexibel monatlich kündbar"
          price="4,99€"
          period="pro Monat"
          features={["Alle Premium-Features", "Monatlich kündbar", "Sofortiger Zugang", "Email-Support"]}
          customButton={
            <StripeCheckout plan="monthly" className="w-full">
              Jetzt upgraden
            </StripeCheckout>
          }
        />

        <PremiumFeatureCard
          title="Jahresplan"
          description="2 Monate kostenlos sparen"
          price="49,99€"
          period="pro Jahr (4,17€/Monat)"
          features={["Alle Premium-Features", "2 Monate gratis", "Prioritäts-Support", "Erweiterte Analysen"]}
          isPopular
          customButton={
            <StripeCheckout plan="yearly" className="w-full">
              Jetzt upgraden
            </StripeCheckout>
          }
        />

        <PremiumFeatureCard
          title="Lifetime"
          description="Einmalige Zahlung, lebenslang nutzen"
          price="149,99€"
          period="einmalig"
          features={["Alle Premium-Features", "Lebenslanger Zugang", "Alle zukünftigen Updates", "VIP-Support"]}
          customButton={
            <StripeCheckout plan="lifetime" className="w-full">
              Jetzt upgraden
            </StripeCheckout>
          }
        />
      </div>

      {isUpgrading && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 animate-spin" />
              <span className="font-semibold">Upgrade wird verarbeitet...</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Ihr {selectedPlan === "lifetime" ? "Lifetime" : selectedPlan === "yearly" ? "Jahres" : "Monats"}-Plan wird
              aktiviert.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Warum Premium?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Unbegrenzte Dokumentation
              </h4>
              <p className="text-sm text-muted-foreground">
                Dokumentieren Sie alle Mahlzeiten und Symptome ohne tägliche Limits. Perfekt für Familien und intensive
                Allergie-Verfolgung.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Professionelle Berichte
              </h4>
              <p className="text-sm text-muted-foreground">
                Erstellen Sie unbegrenzt detaillierte PDF-Berichte für Ärzte und CSV-Exporte für eigene Analysen.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Familien-Features
              </h4>
              <p className="text-sm text-muted-foreground">
                Verwalten Sie Profile für alle Familienmitglieder und behalten Sie die Gesundheit aller im Blick.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Erweiterte Analysen
              </h4>
              <p className="text-sm text-muted-foreground">
                Nutzen Sie AI-gestützte Muster-Erkennung und erweiterte Filteroptionen für bessere Einblicke.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Alle Preise inkl. MwSt. • Jederzeit kündbar • 30 Tage Geld-zurück-Garantie</p>
        <p className="mt-1">Ihre Daten bleiben weiterhin sicher und lokal auf Ihrem Gerät gespeichert.</p>
      </div>
    </div>
  )
}
