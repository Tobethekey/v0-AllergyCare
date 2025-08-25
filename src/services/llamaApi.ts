// OpenRouter API Service für AllergyCare

export const getLlamaAnalysis = async (prompt: string): Promise<string> => {
  const apiKey = process.env.LLAMA_API_KEY;

  if (!apiKey) {
    throw new Error("OpenRouter API key is not defined. Please set LLAMA_API_KEY in your environment variables.");
  }

  // OpenRouter API-Konfiguration
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  
  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": "https://allergycareapp.netlify.app", // Ihre Netlify-URL
        "X-Title": "AllergyCare App",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free", // Kostenloses Modell
        messages: [{ 
          role: "user", 
          content: prompt 
        }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", response.status, errorText);
      throw new Error(`OpenRouter API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0]) {
      throw new Error("Unexpected API response format from OpenRouter");
    }

    return data.choices[0].message.content;
    
  } catch (error) {
    console.error("Error fetching OpenRouter analysis:", error);
    throw error;
  }
};

// Zusätzliche Hilfsfunktion für spezifische Allergie-Analyse
export const analyzeAllergyData = async (
  foods: string[], 
  symptoms: string[], 
  context?: string
): Promise<{
  possibleTriggers: string[];
  explanation: string;
}> => {
  const prompt = `
Analysiere die folgenden Allergie-Tagebuchdaten und identifiziere mögliche Auslöser:

Konsumierte Lebensmittel: ${foods.join(', ')}
Aufgetretene Symptome: ${symptoms.join(', ')}
${context ? `Zusätzlicher Kontext: ${context}` : ''}

Antworte im JSON-Format:
{
  "possibleTriggers": ["Lebensmittel1", "Lebensmittel2"],
  "explanation": "Detaillierte medizinische Erklärung..."
}
`;

  try {
    const response = await getLlamaAnalysis(prompt);
    const parsed = JSON.parse(response);
    
    return {
      possibleTriggers: parsed.possibleTriggers || [],
      explanation: parsed.explanation || "Keine spezifische Analyse verfügbar."
    };
  } catch (error) {
    console.error("Error in analyzeAllergyData:", error);
    throw new Error("Failed to analyze allergy data");
  }
};
