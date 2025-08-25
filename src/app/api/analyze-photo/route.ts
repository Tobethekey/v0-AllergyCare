import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { image, analysisType } = await request.json()

    if (!image) {
      return NextResponse.json({ success: false, error: "Kein Bild bereitgestellt" }, { status: 400 })
    }

    // Erstelle Prompt für Bildanalyse
    const prompt = `
Du bist ein spezialisierter KI-Assistent für Nahrungsmittel-Erkennung und Allergie-Analyse.

AUFGABE: Analysiere das bereitgestellte Bild einer Mahlzeit und identifiziere:
1. Alle sichtbaren Nahrungsmittel und Zutaten
2. Mögliche Allergene
3. Geschätzte Nährwerte
4. Gesundheitstipps und Warnungen

WICHTIGE HINWEISE:
- Sei präzise bei der Nahrungsmittel-Erkennung
- Erwähne häufige Allergene (Gluten, Milch, Nüsse, Eier, etc.)
- Gib realistische Kalorienangaben
- Keine medizinischen Diagnosen, nur allgemeine Hinweise

ANTWORT-FORMAT (JSON):
{
  "detectedFoods": ["Nahrungsmittel1", "Nahrungsmittel2"],
  "confidence": 0.85,
  "nutritionalInfo": {
    "calories": 350,
    "allergens": ["Gluten", "Milch"],
    "ingredients": ["Hauptzutaten"]
  },
  "suggestions": ["Hilfreiche Tipps"],
  "warnings": ["Mögliche Allergenwarnungen"]
}

Bild (Base64): ${image.substring(0, 100)}...
`

    // Da wir keine echte Bildanalyse-API haben, verwenden wir eine Mock-Antwort
    // In einer echten Implementierung würde hier eine Vision-API wie GPT-4V oder Google Vision verwendet
    const mockResult = {
      detectedFoods: ["Gemischter Salat", "Hähnchenbrust", "Tomaten", "Gurken"],
      confidence: 0.87,
      nutritionalInfo: {
        calories: 320,
        allergens: ["Möglicherweise Senf im Dressing"],
        ingredients: ["Salat", "Hähnchen", "Gemüse", "Dressing"],
      },
      suggestions: [
        "Ausgewogene Mahlzeit mit Proteinen und Vitaminen",
        "Achten Sie auf das Dressing - es könnte Allergene enthalten",
        "Trinken Sie ausreichend Wasser zu dieser Mahlzeit",
      ],
      warnings: ["Prüfen Sie die Zutaten des Dressings auf Allergene"],
    }

    return NextResponse.json({
      success: true,
      data: mockResult,
    })
  } catch (error) {
    console.error("Photo analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Foto-Analyse fehlgeschlagen",
      },
      { status: 500 },
    )
  }
}
