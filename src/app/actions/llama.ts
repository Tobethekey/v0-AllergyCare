'use server';

import { z } from 'zod';

// Schema zur Validierung der erwarteten JSON-Antwort von der API
const analysisResultSchema = z.object({
  possibleTriggers: z.array(z.string()),
  explanation: z.string(),
});

export async function analyzeWithLlama(prompt: string) {
  const apiKey = process.env.LLAMA_API_KEY;

  // Fallback für Entwicklung/Testing ohne API-Schlüssel
  if (!apiKey) {
    console.warn("Llama API key is not configured. Using mock response for development.");
    
    // Mock-Response für Entwicklung
    return {
      possibleTriggers: ["Paprika", "Nudelauflauf"],
      explanation: "Basierend auf den Daten scheinen Paprika und Nudelauflauf häufig mit Magen-Darm-Symptomen in Verbindung zu stehen. Bitte konsultieren Sie einen Arzt für eine professionelle Diagnose."
    };
  }

  // OpenRouter API-Konfiguration
  const openRouterConfig = {
    url: "https://openrouter.ai/api/v1/chat/completions",
    models: [
      "meta-llama/llama-3.1-8b-instruct:free", // Kostenlos verfügbar
      "meta-llama/llama-3.1-70b-instruct", // Bessere Qualität
      "meta-llama/llama-3-8b-instruct", // Fallback
    ]
  };

  // Erweiterte Prompt-Struktur für bessere JSON-Antworten
  const systemPrompt = `Du bist ein medizinischer AI-Assistent, der Allergie-Tagebuchdaten analysiert. 
Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "possibleTriggers": ["Lebensmittel1", "Lebensmittel2"],
  "explanation": "Detaillierte Erklärung basierend auf den Daten..."
}`;

  const fullPrompt = `${systemPrompt}\n\nAnalysiere die folgenden Daten:\n${prompt}`;

  // Versuche verschiedene Modelle in der Reihenfolge
  for (const model of openRouterConfig.models) {
    try {
      console.log(`Versuche OpenRouter mit Modell: ${model}`);
      
      const response = await fetch(openRouterConfig.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "https://allergycareapp.netlify.app", // Ihre App-URL
          "X-Title": "AllergyCare App", // App-Name für OpenRouter
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user", 
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3, // Niedrigere Temperatur für konsistentere Antworten
          response_format: { type: "json_object" }, // Erzwingt JSON-Antwort
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenRouter API Error (${model}):`, response.status, errorBody);
        continue; // Versuche nächstes Modell
      }

      const data = await response.json();
      console.log("OpenRouter Response:", data);

      if (!data.choices || !data.choices[0]) {
        console.error("Unerwartete API-Antwort-Struktur:", data);
        continue;
      }

      const resultText = data.choices[0].message.content;
      console.log("AI Response Text:", resultText);

      // Versuche JSON zu parsen
      try {
        const parsedJson = JSON.parse(resultText);
        const validatedResult = analysisResultSchema.parse(parsedJson);
        console.log("Erfolgreich validierte Antwort:", validatedResult);
        return validatedResult;
      } catch (parseError) {
        console.warn("JSON parsing failed, extracting information manually:", parseError);
        console.log("Roher Text:", resultText);
        
        // Fallback: Extrahiere Informationen manuell
        return {
          possibleTriggers: extractTriggers(resultText),
          explanation: cleanExplanation(resultText)
        };
      }

    } catch (error) {
      console.error(`Error with OpenRouter model ${model}:`, error);
      continue; // Versuche nächstes Modell
    }
  }

  // Fallback wenn alle Modelle fehlschlagen
  console.error("Alle OpenRouter-Modelle fehlgeschlagen");
  throw new Error("Failed to get analysis from OpenRouter AI service. All models failed.");
}

// Hilfsfunktion zum Extrahieren von Auslösern aus dem Text
function extractTriggers(text: string): string[] {
  const triggers: string[] = [];
  
  // Häufige Allergene und Lebensmittel
  const commonFoods = [
    'Paprika', 'Nudelauflauf', 'Apfel', 'Banane', 'Milch', 'Ei', 'Nuss', 'Nüsse',
    'Weizen', 'Soja', 'Fisch', 'Meeresfrüchte', 'Erdnuss', 'Erdnüsse', 'Tomate', 
    'Zitrus', 'Schokolade', 'Käse', 'Brot', 'Fleisch', 'Reis', 'Kartoffel', 
    'Zwiebel', 'Knoblauch', 'Gewürze', 'Gluten', 'Laktose', 'Haselnuss',
    'Mandel', 'Walnuss', 'Sellerie', 'Senf', 'Sesam', 'Lupine'
  ];
  
  // Erstelle Regex-Pattern für Wortgrenzen
  const pattern = new RegExp('\\b(' + commonFoods.join('|') + ')\\b', 'gi');
  const matches = text.match(pattern);
  
  if (matches) {
    // Normalisiere die gefundenen Treffer
    const normalized = matches.map(item => 
      item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
    );
    triggers.push(...normalized);
  }
  
  // Entferne Duplikate und beschränke auf 5 Haupttrigger
  return [...new Set(triggers)].slice(0, 5);
}

// Hilfsfunktion zum Bereinigen der Erklärung
function cleanExplanation(text: string): string {
  // Entferne JSON-Syntax falls vorhanden
  let cleaned = text.replace(/[{}"\[\]]/g, '');
  
  // Extrahiere sinnvolle Sätze
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  // Nimm die ersten 2-3 aussagekräftigsten Sätze
  const explanation = sentences.slice(0, 3).join('. ').trim();
  
  return explanation.length > 10 
    ? explanation + '.' 
    : "Basierend auf den verfügbaren Daten wurden mögliche Auslöser identifiziert. Bitte konsultieren Sie einen Arzt für eine professionelle Diagnose.";
}
