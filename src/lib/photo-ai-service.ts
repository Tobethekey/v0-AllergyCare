// Foto-KI-Analyse Service für AllergyCare
import { getPremiumStatus } from "./data-service"

export interface PhotoAnalysisResult {
  success: boolean
  data?: {
    detectedFoods: string[]
    confidence: number
    nutritionalInfo?: {
      calories?: number
      allergens?: string[]
      ingredients?: string[]
    }
    suggestions?: string[]
    warnings?: string[]
  }
  error?: string
}

export class PhotoAIService {
  private static instance: PhotoAIService

  static getInstance(): PhotoAIService {
    if (!PhotoAIService.instance) {
      PhotoAIService.instance = new PhotoAIService()
    }
    return PhotoAIService.instance
  }

  async analyzePhoto(photoFile: File): Promise<PhotoAnalysisResult> {
    // Premium-Check
    const premiumStatus = getPremiumStatus()
    if (!premiumStatus.isPremium) {
      return {
        success: false,
        error:
          "Foto-KI-Analyse ist nur für Premium-Nutzer verfügbar. Upgraden Sie jetzt für automatische Mahlzeiten-Erkennung!",
      }
    }

    try {
      // Konvertiere Foto zu Base64 für API-Übertragung
      const base64Image = await this.fileToBase64(photoFile)

      // Sende an KI-API für Bildanalyse
      const response = await fetch("/api/analyze-photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          analysisType: "food_detection",
        }),
      })

      if (!response.ok) {
        throw new Error(`API-Fehler: ${response.status}`)
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error("Photo AI Analysis Error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Foto-Analyse fehlgeschlagen",
      }
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Entferne das "data:image/...;base64," Präfix
        const base64 = result.split(",")[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // Hilfsmethode für Mock-Analyse (Entwicklung)
  async mockAnalyzePhoto(photoFile: File): Promise<PhotoAnalysisResult> {
    // Simuliere API-Verzögerung
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock-Ergebnisse basierend auf Dateiname oder zufällig
    const mockFoods = ["Apfel", "Banane", "Brot", "Käse", "Salat", "Tomate", "Hähnchen", "Reis"]
    const detectedFoods = mockFoods.slice(0, Math.floor(Math.random() * 3) + 1)

    return {
      success: true,
      data: {
        detectedFoods,
        confidence: 0.85 + Math.random() * 0.1, // 85-95% Konfidenz
        nutritionalInfo: {
          calories: Math.floor(Math.random() * 500) + 200,
          allergens: ["Gluten", "Milch"].filter(() => Math.random() > 0.7),
          ingredients: detectedFoods.concat(["Gewürze", "Öl"]),
        },
        suggestions: [
          "Achten Sie auf mögliche Kreuzreaktionen mit Nüssen",
          "Diese Mahlzeit enthält Ballaststoffe, die gut für die Verdauung sind",
          "Trinken Sie ausreichend Wasser zu dieser Mahlzeit",
        ],
        warnings: Math.random() > 0.8 ? ["Mögliche Allergenspuren erkannt"] : [],
      },
    }
  }
}

export const photoAIService = PhotoAIService.getInstance()
