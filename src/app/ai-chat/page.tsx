"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bot,
  User,
  Send,
  Crown,
  MessageCircle,
  Sparkles,
  Heart,
  Brain,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
} from "lucide-react"
import { getPremiumStatus, getFormattedLogsForAI } from "@/lib/data-service"
import { aiService } from "@/lib/ai-service"
import { useToast } from "@/hooks/use-toast"
import PageHeader from "@/components/PageHeader"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  type?: "analysis" | "meal_suggestion" | "symptom_advice" | "general"
}

interface ChatSession {
  id: string
  name: string
  messages: ChatMessage[]
  createdAt: Date
  lastActivity: Date
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  const { toast } = useToast()
  const chatScrollRef = useRef<HTMLDivElement>(null)
  const premiumStatus = getPremiumStatus()

  useEffect(() => {
    if (premiumStatus.isPremium && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Willkommen bei Ihrem persönlichen AI-Gesundheitsassistenten! 🌟

Als Premium-Nutzer haben Sie Zugang zu erweiterten KI-Features:

🔍 **Tiefgreifende Analysen** - Detaillierte Auswertung Ihrer Allergie-Daten
🍽️ **Personalisierte Mahlzeiten-Empfehlungen** - Sichere Rezepte basierend auf Ihren Daten  
💡 **Symptom-Beratung** - Hilfreiche Tipps zum Umgang mit Beschwerden
🏥 **Arztbesuch-Vorbereitung** - Strukturierte Berichte für Ihren Arzt

Wie kann ich Ihnen heute helfen? Stellen Sie mir gerne Fragen zu Ihren Allergien, Symptomen oder Ernährung!

*Hinweis: Ich bin ein AI-Assistent und ersetze keine professionelle medizinische Beratung.*`,
        timestamp: new Date(),
        type: "general",
      }
      setMessages([welcomeMessage])
    }
  }, [premiumStatus.isPremium, messages.length])

  // Auto-scroll zum Ende des Chats
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    if (!premiumStatus.isPremium) {
      toast({
        title: "Premium erforderlich",
        description: "Der AI-Chat ist nur für Premium-Nutzer verfügbar.",
        variant: "destructive",
      })
      return
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date(),
      type: "general",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const result = await aiService.analyzeData({
        type: "general_chat",
        data: {
          userMessage: userMessage.content,
          context: `Premium-Nutzer Chat. Verfügbare Daten: ${JSON.stringify(getFormattedLogsForAI())}`,
        },
      })

      if (result.success && result.data?.response) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: result.data.response,
          timestamp: new Date(),
          type: "general",
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(result.error || "AI-Antwort fehlgeschlagen")
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Entschuldigung, ich bin momentan nicht verfügbar. Bitte versuchen Sie es später erneut. Bei dringenden gesundheitlichen Fragen wenden Sie sich bitte direkt an einen Arzt.",
        timestamp: new Date(),
        type: "general",
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Chat-Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = async (actionType: "analysis" | "meal_suggestion" | "symptom_advice") => {
    if (!premiumStatus.isPremium) return

    setIsLoading(true)

    const quickPrompts = {
      analysis: "Führe eine umfassende Analyse meiner aktuellen Allergie-Daten durch.",
      meal_suggestion: "Schlage mir 3 sichere Mahlzeiten basierend auf meinen bisherigen Daten vor.",
      symptom_advice: "Gib mir Tipps zum Umgang mit meinen aktuellen Symptomen.",
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: quickPrompts[actionType],
      timestamp: new Date(),
      type: actionType,
    }

    setMessages((prev) => [...prev, userMessage])

    try {
      const result = await aiService.analyzeData({
        type: actionType,
        data: getFormattedLogsForAI(),
      })

      if (result.success) {
        let responseContent = ""

        if (actionType === "analysis" && result.data?.possibleTriggers) {
          responseContent = `**Analyse-Ergebnisse:**

**Mögliche Auslöser:** ${result.data.possibleTriggers.join(", ")}

**Erklärung:** ${result.data.explanation || "Keine detaillierte Erklärung verfügbar."}

Bitte besprechen Sie diese Ergebnisse mit Ihrem Arzt für eine professionelle Einschätzung.`
        } else if (actionType === "meal_suggestion" && result.data?.suggestions) {
          responseContent = `**Sichere Mahlzeiten-Vorschläge:**

${result.data.suggestions.map((suggestion, index) => `${index + 1}. ${suggestion}`).join("\n")}

**Hinweise:** ${result.data.explanation || "Achten Sie weiterhin auf Ihre individuellen Reaktionen."}

Guten Appetit! 🍽️`
        } else if (actionType === "symptom_advice") {
          responseContent =
            result.data?.response ||
            result.data?.explanation ||
            "Allgemeine Empfehlung: Dokumentieren Sie weiterhin Ihre Symptome und konsultieren Sie bei anhaltenden Beschwerden einen Arzt."
        }

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
          type: actionType,
        }

        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Quick action error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    toast({
      title: "Chat geleert",
      description: "Alle Nachrichten wurden entfernt.",
    })
  }

  const exportChat = () => {
    const chatData = {
      exportDate: new Date().toISOString(),
      messages: messages,
      totalMessages: messages.length,
    }

    const dataStr = JSON.stringify(chatData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `ai-chat-export-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Chat exportiert",
      description: "Ihr Chat-Verlauf wurde als JSON-Datei heruntergeladen.",
    })
  }

  if (!premiumStatus.isPremium) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI-Chat" description="Ihr persönlicher Gesundheitsassistent für Allergie-Beratung." />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              Premium-Feature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Crown className="h-4 w-4" />
              <AlertDescription>
                <strong>AI-Chat ist ein Premium-Feature!</strong>
                <br />
                Upgraden Sie jetzt für unbegrenzten Zugang zu Ihrem persönlichen AI-Gesundheitsassistenten.
                <br />
                <Button variant="link" className="p-0 h-auto mt-2" asChild>
                  <a href="/premium">Jetzt Premium werden →</a>
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="AI-Chat" description="Ihr persönlicher Gesundheitsassistent für Allergie-Beratung.">
        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      </PageHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Schnell-Aktionen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI-Gesundheitsassistent
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportChat} disabled={messages.length === 0}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearChat} disabled={messages.length === 0}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat-Nachrichten */}
              <ScrollArea className="flex-1 p-4" ref={chatScrollRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                          }`}
                        >
                          {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div
                          className={`p-4 rounded-lg ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-gradient-to-br from-gray-50 to-blue-50 border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {message.timestamp.toLocaleTimeString("de-DE", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {message.type && message.type !== "general" && (
                              <Badge variant="secondary" className="text-xs">
                                {message.type === "analysis"
                                  ? "Analyse"
                                  : message.type === "meal_suggestion"
                                    ? "Mahlzeit"
                                    : "Symptom"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3 justify-start">
                      <div className="flex gap-2 max-w-[85%]">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="p-4 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 border">
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">AI denkt nach...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Chat-Eingabe */}
              <div className="p-4 border-t bg-gray-50/50">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSendMessage()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Stellen Sie Ihre Frage zu Allergien, Symptomen oder Ernährung..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!inputMessage.trim() || isLoading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>

                {/* Beispiel-Fragen */}
                {messages.length <= 1 && (
                  <div className="mt-3 p-3 bg-white/80 rounded-md border border-dashed">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Beispiel-Fragen:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <p>• "Analysiere meine letzten Symptome"</p>
                      <p>• "Welche Lebensmittel sollte ich meiden?"</p>
                      <p>• "Wie bereite ich mich auf den Arztbesuch vor?"</p>
                      <p>• "Schlage sichere Mahlzeiten vor"</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quick-actions">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Sparkles className="h-5 w-5" />
                  Daten-Analyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Umfassende KI-Analyse Ihrer Allergie-Daten mit Trigger-Identifikation.
                </p>
                <Button
                  onClick={() => handleQuickAction("analysis")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Analyse starten
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Heart className="h-5 w-5" />
                  Mahlzeiten-Tipps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Personalisierte, sichere Mahlzeiten-Empfehlungen basierend auf Ihren Daten.
                </p>
                <Button
                  onClick={() => handleQuickAction("meal_suggestion")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
                  Vorschläge erhalten
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Brain className="h-5 w-5" />
                  Symptom-Beratung
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Hilfreiche Tipps und Ratschläge zum Umgang mit Ihren Symptomen.
                </p>
                <Button
                  onClick={() => handleQuickAction("symptom_advice")}
                  disabled={isLoading}
                  className="w-full"
                  variant="outline"
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  Beratung erhalten
                </Button>
              </CardContent>
            </Card>
          </div>

          <Alert className="mt-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Wichtiger Hinweis:</strong> Alle AI-Empfehlungen dienen nur zur Unterstützung und ersetzen keine
              professionelle medizinische Beratung. Bei ernsthaften Beschwerden konsultieren Sie bitte einen Arzt.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}
