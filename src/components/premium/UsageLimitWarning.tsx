"use client"

import { AlertTriangle, Crown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

interface UsageLimitWarningProps {
  type: "foodEntries" | "symptomEntries" | "exports" | "profiles"
  remaining: number | string
  onUpgrade?: () => void
}

const limitMessages = {
  foodEntries: {
    title: "Tägliches Limit für Mahlzeiten erreicht",
    description:
      "Du hast heute bereits eine Mahlzeit dokumentiert. Mit Premium kannst du unbegrenzt Mahlzeiten hinzufügen.",
    action: "Unbegrenzte Mahlzeiten",
  },
  symptomEntries: {
    title: "Tägliches Limit für Symptome erreicht",
    description: "Du hast heute bereits ein Symptom erfasst. Mit Premium kannst du unbegrenzt Symptome dokumentieren.",
    action: "Unbegrenzte Symptome",
  },
  exports: {
    title: "Tägliches Export-Limit erreicht",
    description: "Du hast heute bereits einen Bericht exportiert. Mit Premium kannst du unbegrenzt Berichte erstellen.",
    action: "Unbegrenzte Exporte",
  },
  profiles: {
    title: "Profil-Limit erreicht",
    description:
      "Du kannst nur ein Profil in der kostenlosen Version erstellen. Mit Premium kannst du unbegrenzt Profile für Familienmitglieder anlegen.",
    action: "Unbegrenzte Profile",
  },
}

export function UsageLimitWarning({ type, remaining, onUpgrade }: UsageLimitWarningProps) {
  const message = limitMessages[type]
  const isLimitReached = remaining === 0 || remaining === "0"

  if (!isLimitReached && remaining !== "unlimited") {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          Noch {remaining}{" "}
          {type === "foodEntries"
            ? "Mahlzeit(en)"
            : type === "symptomEntries"
              ? "Symptom(e)"
              : type === "exports"
                ? "Export(s)"
                : "Profil(e)"}{" "}
          heute verfügbar.
        </AlertDescription>
      </Alert>
    )
  }

  if (isLimitReached) {
    return (
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            {message.title}
          </CardTitle>
          <CardDescription className="text-orange-700">{message.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/premium" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                <Crown className="w-4 h-4 mr-2" />
                Jetzt Premium holen
              </Button>
            </Link>
            <Button variant="outline" className="flex-1 bg-transparent" onClick={onUpgrade}>
              Mehr erfahren
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
