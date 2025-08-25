// Zentraler AI-Service für AllergyCare
import { analyzeWithLlama } from "@/app/actions/llama"
import { getPremiumStatus, incrementDailyUsage } from "./data-service"

export interface AIAnalysisRequest {
  type: "trigger_analysis" | "meal_suggestion" | "symptom_advice" | "general_chat"
  data: {
    foodLog?: string
    symptomLog?: string
    userMessage?: string
    context?: string
  }
  userId?: string
}

export interface AIAnalysisResponse {
  success: boolean
  data?: {
    possibleTriggers?: string[]
    explanation?: string
    suggestions?: string[]
    response?: string
  }
  error?: string
  usageRemaining?: number
}

export class AIService {
  private static instance: AIService
  private requestQueue: Promise<any>[] = []
  private maxConcurrentRequests = 3

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async analyzeData(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    // Premium-Check und Nutzungslimits
    const premiumStatus = getPremiumStatus()

    if (!premiumStatus.isPremium) {
      const canUseAI = incrementDailyUsage("exports") // AI-Nutzung zählt als Export
      if (!canUseAI) {
        return {
          success: false,
          error: "Tägliches AI-Limit erreicht. Upgraden Sie zu Premium für unbegrenzte AI-Analysen.",
        }
      }
    }

    // Rate Limiting für gleichzeitige Anfragen
    if (this.requestQueue.length >= this.maxConcurrentRequests) {
      return {
        success: false,
        error: "Zu viele gleichzeitige AI-Anfragen. Bitte versuchen Sie es in einem Moment erneut.",
      }
    }

    const analysisPromise = this.performAnalysis(request)
    this.requestQueue.push(analysisPromise)

    try {
      const result = await analysisPromise
      return result
    } finally {
      // Entferne die Anfrage aus der Queue
      const index = this.requestQueue.indexOf(analysisPromise)
      if (index > -1) {
        this.requestQueue.splice(index, 1)
      }
    }
  }

  private async performAnalysis(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    try {
      let prompt = ""

      switch (request.type) {
        case "trigger_analysis":
          prompt = this.buildTriggerAnalysisPrompt(request.data)
          break
        case "meal_suggestion":
          prompt = this.buildMealSuggestionPrompt(request.data)
          break
        case "symptom_advice":
          prompt = this.buildSymptomAdvicePrompt(request.data)
          break
        case "general_chat":
          prompt = this.buildGeneralChatPrompt(request.data)
          break
        default:
          throw new Error("Unbekannter AI-Analyse-Typ")
      }

      const result = await analyzeWithLlama(prompt)

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      console.error("AI Analysis Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "AI-Analyse fehlgeschlagen",
      }
    }
  }

  private buildTriggerAnalysisPrompt(data: { foodLog?: string; symptomLog?: string; context?: string }): string {
    return `
Du bist ein spezialisierter AI-Assistent für Allergie- und Unverträglichkeitsanalyse.

AUFGABE: Analysiere die folgenden Daten und identifiziere mögliche Nahrungsmittelauslöser.

MAHLZEITEN-LOG:
${data.foodLog || "Keine Daten verfügbar"}

SYMPTOM-LOG:
${data.symptomLog || "Keine Daten verfügbar"}

${data.context ? `ZUSÄTZLICHER KONTEXT: ${data.context}` : ""}

ANWEISUNGEN:
1. Suche nach zeitlichen Korrelationen zwischen Nahrungsaufnahme und Symptomen
2. Berücksichtige häufige Allergene (Milch, Eier, Nüsse, Gluten, etc.)
3. Achte auf Muster und Wiederholungen
4. Bewerte die Wahrscheinlichkeit jedes identifizierten Auslösers

ANTWORT-FORMAT (JSON):
{
  "possibleTriggers": ["Auslöser1", "Auslöser2"],
  "explanation": "Detaillierte Erklärung der Analyse mit medizinischen Hintergründen"
}

WICHTIG: Erwähne IMMER, dass dies eine AI-Unterstützung ist und keine ärztliche Diagnose ersetzt!
`
  }

  private buildMealSuggestionPrompt(data: { foodLog?: string; symptomLog?: string; context?: string }): string {
    return `
Du bist ein AI-Ernährungsberater, der sichere Mahlzeiten für Menschen mit Nahrungsmittelunverträglichkeiten vorschlägt.

BISHERIGE MAHLZEITEN:
${data.foodLog || "Keine Daten verfügbar"}

AUFGETRETENE SYMPTOME:
${data.symptomLog || "Keine Daten verfügbar"}

${data.context ? `SPEZIELLE ANFRAGE: ${data.context}` : ""}

AUFGABE: Schlage 3-5 sichere, nährstoffreiche Mahlzeiten vor, die wahrscheinlich keine Symptome auslösen.

ANTWORT-FORMAT (JSON):
{
  "suggestions": [
    "Mahlzeit 1: Beschreibung und Zutaten",
    "Mahlzeit 2: Beschreibung und Zutaten",
    "Mahlzeit 3: Beschreibung und Zutaten"
  ],
  "explanation": "Begründung für die Auswahl und Ernährungstipps"
}

WICHTIG: Keine medizinischen Diagnosen, nur Ernährungsvorschläge!
`
  }

  private buildSymptomAdvicePrompt(data: { symptomLog?: string; context?: string }): string {
    return `
Du bist ein einfühlsamer AI-Assistent, der Menschen mit Allergiesymptomen unterstützt.

AKTUELLE SYMPTOME:
${data.symptomLog || "Keine Daten verfügbar"}

${data.context ? `BENUTZER-FRAGE: ${data.context}` : ""}

AUFGABE: Gib hilfreiche, nicht-medizinische Ratschläge zum Umgang mit Symptomen.

ANTWORT-FORMAT (JSON):
{
  "response": "Einfühlsame Antwort mit praktischen Tipps und Ermutigung",
  "suggestions": [
    "Praktischer Tipp 1",
    "Praktischer Tipp 2",
    "Praktischer Tipp 3"
  ]
}

WICHTIG: 
- Keine medizinischen Diagnosen oder Behandlungsempfehlungen
- Bei ernsten Symptomen IMMER Arztbesuch empfehlen
- Sei empathisch und ermutigend
`
  }

  private buildGeneralChatPrompt(data: { userMessage?: string; context?: string }): string {
    return `
Du bist ein freundlicher, empathischer AI-Assistent für Menschen mit Nahrungsmittelallergien und -unverträglichkeiten.

${data.context ? `KONTEXT: ${data.context}` : ""}

BENUTZER-NACHRICHT: ${data.userMessage || ""}

VERHALTEN:
- Sei immer empathisch und verständnisvoll
- Gib praktische, hilfreiche Ratschläge
- Ermutige bei Unsicherheiten zum Arztbesuch
- Keine medizinischen Diagnosen
- Antworte auf Deutsch

ANTWORT-FORMAT (JSON):
{
  "response": "Deine hilfreiche, empathische Antwort"
}
`
  }

  // Hilfsmethode für Premium-Features
  async getAdvancedAnalysis(foodLog: string, symptomLog: string): Promise<AIAnalysisResponse> {
    const premiumStatus = getPremiumStatus()

    if (!premiumStatus.isPremium) {
      return {
        success: false,
        error: "Erweiterte AI-Analysen sind nur für Premium-Nutzer verfügbar.",
      }
    }

    const advancedPrompt = `
Du bist ein hochspezialisierter AI-Experte für Allergie- und Autoimmunerkrankungen.

ERWEITERTE ANALYSE-AUFGABE:
1. Detaillierte Muster-Erkennung über längere Zeiträume
2. Kreuzreaktions-Analyse zwischen verschiedenen Allergenen
3. Saisonale und umweltbedingte Faktoren
4. Stress- und Lifestyle-Korrelationen
5. Ernährungsoptimierung und Supplementempfehlungen

DATEN:
Mahlzeiten: ${foodLog}
Symptome: ${symptomLog}

ERWEITERTE ANTWORT (JSON):
{
  "possibleTriggers": ["Hauptauslöser"],
  "crossReactions": ["Mögliche Kreuzreaktionen"],
  "patterns": ["Erkannte Muster"],
  "lifestyle_factors": ["Lifestyle-Einflüsse"],
  "recommendations": ["Detaillierte Empfehlungen"],
  "explanation": "Umfassende wissenschaftliche Analyse"
}
`

    return this.performAnalysis({
      type: "trigger_analysis",
      data: { foodLog, symptomLog, context: advancedPrompt },
    })
  }
}

// Export der Singleton-Instanz
export const aiService = AIService.getInstance()
