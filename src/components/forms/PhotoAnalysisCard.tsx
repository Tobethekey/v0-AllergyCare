"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Camera, Crown, Loader2, CheckCircle, AlertTriangle, Utensils } from "lucide-react"
import { photoAIService } from "@/lib/photo-ai-service"
import type { PhotoAnalysisResult } from "@/lib/photo-ai-service"
import { getPremiumStatus } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

interface PhotoAnalysisCardProps {
  photoFile: File | null
  onAnalysisComplete?: (detectedFoods: string[]) => void
}

export function PhotoAnalysisCard({ photoFile, onAnalysisComplete }: PhotoAnalysisCardProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<PhotoAnalysisResult | null>(null)
  const { toast } = useToast()

  const premiumStatus = getPremiumStatus()

  const handleAnalyzePhoto = async () => {
    if (!photoFile) return

    setIsAnalyzing(true)
    setAnalysisResult(null)

    try {
      // Verwende Mock-Analyse für Entwicklung
      const result = await photoAIService.mockAnalyzePhoto(photoFile)
      setAnalysisResult(result)

      if (result.success && result.data) {
        toast({
          title: "Foto-Analyse abgeschlossen",
          description: `${result.data.detectedFoods.length} Nahrungsmittel erkannt`,
        })

        // Übertrage erkannte Nahrungsmittel an das Formular
        if (onAnalysisComplete && result.data.detectedFoods.length > 0) {
          onAnalysisComplete(result.data.detectedFoods)
        }
      } else {
        toast({
          title: "Analyse fehlgeschlagen",
          description: result.error || "Unbekannter Fehler",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Foto-Analyse konnte nicht durchgeführt werden",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (!photoFile) {
    return null
  }

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-700">
          <Camera className="h-5 w-5" />
          KI-Foto-Analyse
          {premiumStatus.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!premiumStatus.isPremium ? (
          <Alert>
            <Crown className="h-4 w-4" />
            <AlertDescription>
              <strong>Premium-Feature:</strong> Automatische Nahrungsmittel-Erkennung ist nur für Premium-Nutzer
              verfügbar.{" "}
              <Button variant="link" className="p-0 h-auto" asChild>
                <a href="/premium">Jetzt upgraden</a>
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Lassen Sie die KI Ihr Foto analysieren und automatisch Nahrungsmittel erkennen.
            </p>

            <Button
              onClick={handleAnalyzePhoto}
              disabled={isAnalyzing}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysiere Foto...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Foto mit KI analysieren
                </>
              )}
            </Button>

            {analysisResult && (
              <div className="space-y-4">
                {analysisResult.success && analysisResult.data ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">Analyse erfolgreich</span>
                      <Badge variant="secondary">{Math.round(analysisResult.data.confidence * 100)}% Konfidenz</Badge>
                    </div>

                    {analysisResult.data.detectedFoods.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Utensils className="h-4 w-4" />
                          Erkannte Nahrungsmittel:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {analysisResult.data.detectedFoods.map((food, index) => (
                            <Badge key={index} className="bg-green-100 text-green-800 border-green-300">
                              {food}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.data.nutritionalInfo && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-white/50 rounded-lg">
                        {analysisResult.data.nutritionalInfo.calories && (
                          <div>
                            <span className="text-sm font-medium">Geschätzte Kalorien:</span>
                            <div className="text-lg font-bold text-blue-600">
                              {analysisResult.data.nutritionalInfo.calories} kcal
                            </div>
                          </div>
                        )}

                        {analysisResult.data.nutritionalInfo.allergens &&
                          analysisResult.data.nutritionalInfo.allergens.length > 0 && (
                            <div>
                              <span className="text-sm font-medium">Mögliche Allergene:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {analysisResult.data.nutritionalInfo.allergens.map((allergen, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {allergen}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                    {analysisResult.data.suggestions && analysisResult.data.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">KI-Empfehlungen:</h4>
                        <ul className="text-sm space-y-1">
                          {analysisResult.data.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.data.warnings && analysisResult.data.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Hinweise:</strong>
                          <ul className="mt-1">
                            {analysisResult.data.warnings.map((warning, index) => (
                              <li key={index}>• {warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Analyse fehlgeschlagen:</strong> {analysisResult.error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
