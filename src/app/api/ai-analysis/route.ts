import { type NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai-service"
import type { AIAnalysisRequest } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const body: AIAnalysisRequest = await request.json()

    // Validierung der Anfrage
    if (!body.type || !body.data) {
      return NextResponse.json(
        { success: false, error: "Ungültige Anfrage: type und data sind erforderlich" },
        { status: 400 },
      )
    }

    const result = await aiService.analyzeData(body)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("AI Analysis API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Interner Server-Fehler bei der AI-Analyse",
      },
      { status: 500 },
    )
  }
}

// GET-Endpoint für AI-Status und Limits
export async function GET() {
  try {
    // Hier könnten AI-Service-Statistiken zurückgegeben werden
    return NextResponse.json({
      success: true,
      data: {
        available: true,
        models: ["meta-llama/llama-3.1-8b-instruct", "meta-llama/llama-3.1-70b-instruct"],
        features: ["trigger_analysis", "meal_suggestion", "symptom_advice", "general_chat"],
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "AI-Service nicht verfügbar" }, { status: 503 })
  }
}
