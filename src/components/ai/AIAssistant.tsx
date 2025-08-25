"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Sparkles, Utensils, Heart, MessageCircle, Crown, Loader2 } from "lucide-react"
import { aiService } from "@/lib/ai-service"
import type { AIAnalysisResponse } from "@/lib/ai-service"
import { getPremiumStatus } from "@/lib/data-service"
import { useToast } from "@/hooks/use-toast"

export function AIAssistant() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("analysis")
  const [results, setResults] = useState<AIAnalysisResponse | null>(null)
  const [chatMessage, setChatMessage] = useState("")
  const [mealContext, setMealContext] = useState("")

  const { toast } = useToast()
  const premiumStatus = getPremiumStatus()

  const handleTriggerAnalysis = async () => {
    setIsLoading(true)
    try {
      const result = await aiService.analyzeData({
        type: "trigger_analysis",
        data: {
          context: "Vollständige Trigger-Analyse aller verfügbaren Daten",
        },
      })

      setResults(result)

      if (result.success) {
        toast({
          title: "Analyse abgeschlossen",
          description: "Die AI-Analyse Ihrer Daten wurde erfolgreich durchgeführt.",
        })
      } else {
        toast({
          title: "Analyse fehlgeschlagen",
          description: result.error || "Ein unbekannter Fehler ist aufgetreten.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die AI-Analyse konnte nicht durchgeführt werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMealSuggestion = async () => {
    setIsLoading(true)
    try {
      const result = await aiService.analyzeData({
        type: "meal_suggestion",
        data: {
          context: mealContext || "Sichere Mahlzeiten basierend auf bisherigen Daten vorschlagen",
        },
      })

      setResults(result)

      if (result.success) {
        toast({
          title: "Mahlzeiten-Vorschläge erstellt",
          description: "Die AI hat sichere Mahlzeiten für Sie vorgeschlagen.",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Mahlzeiten-Vorschläge konnten nicht erstellt werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatMessage = async () => {
    if (!chatMessage.trim()) return

    setIsLoading(true)
    try {
      const result = await aiService.analyzeData({
        type: "general_chat",
        data: {
          userMessage: chatMessage,
        },
      })

      setResults(result)
      setChatMessage("")

      if (result.success) {
        toast({
          title: "AI-Antwort erhalten",
          description: "Der AI-Assistent hat auf Ihre Nachricht geantwortet.",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Der AI-Assistent konnte nicht antworten.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvancedAnalysis = async () => {
    if (!premiumStatus.isPremium) {
      toast({
        title: "Premium erforderlich",
        description: "Erweiterte AI-Analysen sind nur für Premium-Nutzer verfügbar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const result = await aiService.getAdvancedAnalysis("", "")
      setResults(result)

      if (result.success) {
        toast({
          title: "Erweiterte Analyse abgeschlossen",
          description: "Die Premium AI-Analyse wurde erfolgreich durchgeführt.",
        })
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die erweiterte Analyse konnte nicht durchgeführt werden.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-blue-600" />
            AI-Assistent
            {premiumStatus.isPremium && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="analysis" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Analyse
              </TabsTrigger>
              <TabsTrigger value="meals" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                Mahlzeiten
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2" disabled={!premiumStatus.isPremium}>
                <Crown className="h-4 w-4" />
                Erweitert
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Trigger-Analyse</h3>
                <p className="text-sm text-muted-foreground">
                  Lassen Sie die AI Ihre Mahlzeiten und Symptome analysieren, um mögliche Auslöser zu identifizieren.
                </p>
                <Button onClick={handleTriggerAnalysis} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analysiere...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Trigger-Analyse starten
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="meals" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Sichere Mahlzeiten-Vorschläge</h3>
                <p className="text-sm text-muted-foreground">
                  Erhalten Sie AI-generierte Vorschläge für sichere, nährstoffreiche Mahlzeiten.
                </p>
                <Textarea
                  placeholder="Spezielle Wünsche oder Einschränkungen (optional)..."
                  value={mealContext}
                  onChange={(e) => setMealContext(e.target.value)}
                  className="min-h-[80px]"
                />
                <Button onClick={handleMealSuggestion} disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Erstelle Vorschläge...
                    </>
                  ) : (
                    <>
                      <Utensils className="mr-2 h-4 w-4" />
                      Mahlzeiten vorschlagen
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold">Chat mit AI-Assistent</h3>
                <p className="text-sm text-muted-foreground">
                  Stellen Sie Fragen zu Ihren Allergien, Symptomen oder Ernährung.
                </p>
                <Input
                  placeholder="Ihre Frage an den AI-Assistenten..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleChatMessage()}
                />
                <Button onClick={handleChatMessage} disabled={isLoading || !chatMessage.trim()} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AI antwortet...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Nachricht senden
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-600" />
                  Erweiterte Premium-Analyse
                </h3>
                <p className="text-sm text-muted-foreground">
                  Tiefgreifende AI-Analyse mit Kreuzreaktionen, Mustern und personalisierten Empfehlungen.
                </p>
                <Button
                  onClick={handleAdvancedAnalysis}
                  disabled={isLoading || !premiumStatus.isPremium}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Erweiterte Analyse läuft...
                    </>
                  ) : (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      Premium-Analyse starten
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* Ergebnisse anzeigen */}
          {results && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  AI-Ergebnisse
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.success ? (
                  <div className="space-y-4">
                    {results.data?.possibleTriggers && (
                      <div>
                        <h4 className="font-semibold mb-2">Mögliche Auslöser:</h4>
                        <div className="flex flex-wrap gap-2">
                          {results.data.possibleTriggers.map((trigger, index) => (
                            <Badge key={index} variant="destructive">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {results.data?.suggestions && (
                      <div>
                        <h4 className="font-semibold mb-2">Vorschläge:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {results.data.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm">
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {results.data?.explanation && (
                      <div>
                        <h4 className="font-semibold mb-2">Erklärung:</h4>
                        <p className="text-sm text-muted-foreground">{results.data.explanation}</p>
                      </div>
                    )}

                    {results.data?.response && (
                      <div>
                        <h4 className="font-semibold mb-2">AI-Antwort:</h4>
                        <p className="text-sm">{results.data.response}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-red-600">
                    <p className="font-semibold">Fehler:</p>
                    <p className="text-sm">{results.error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
