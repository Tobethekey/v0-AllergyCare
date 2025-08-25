'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getFormattedLogsForAI, getAiSuggestions, saveAiSuggestions, clearAiSuggestions, getFoodEntries, getSymptomEntries } from '@/lib/data-service';
import { AlertTriangle, CheckCircle2, Wand2, Info, MessageCircle, Send, Bot, User, Heart, AlertCircle } from 'lucide-react';
import { analyzeWithLlama } from '@/app/actions/llama';

interface AnalysisResult {
  possibleTriggers: string[];
  explanation: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AiAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [dataStats, setDataStats] = useState<{foodCount: number, symptomCount: number}>({foodCount: 0, symptomCount: 0});
  
  // Chat-spezifische States
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedAnalysis = getAiSuggestions();
    if (storedAnalysis) {
      setAnalysisResult(storedAnalysis);
    }
    
    // Lade Datenstatistiken
    const foodEntries = getFoodEntries();
    const symptomEntries = getSymptomEntries();
    setDataStats({
      foodCount: foodEntries.length,
      symptomCount: symptomEntries.length
    });
  }, []);

  // Scroll zum Ende des Chats
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // --- START ERWEITERTE DEBUGGING ---
    if (typeof window !== 'undefined') {
        const rawFood = window.localStorage.getItem('ALLERGYCARE_FOOD_LOGS');
        const rawSymptoms = window.localStorage.getItem('ALLERGYCARE_SYMPTOM_LOGS');
        console.log("=== DEBUGGING KI-ANALYSE ===");
        console.log("Rohdaten für 'ALLERGYCARE_FOOD_LOGS':", rawFood);
        console.log("Rohdaten für 'ALLERGYCARE_SYMPTOM_LOGS':", rawSymptoms);
        
        if (rawFood) {
          const foodData = JSON.parse(rawFood);
          console.log("Parsed Food Data:", foodData);
          console.log("Food Einträge Anzahl:", foodData.length);
        }
        
        if (rawSymptoms) {
          const symptomData = JSON.parse(rawSymptoms);
          console.log("Parsed Symptom Data:", symptomData);
          console.log("Symptom Einträge Anzahl:", symptomData.length);
        }
    }
    // --- END DEBUGGING ---

    const { foodLog, symptomLog } = getFormattedLogsForAI();
    
    // Erweiterte Debugging-Ausgaben
    console.log("=== FORMATIERTE DATEN FÜR KI ===");
    console.log("Food Log:", foodLog);
    console.log("Symptom Log:", symptomLog);

    if (!foodLog || !symptomLog) {
      setError(`Unzureichende Daten für die Analyse. Aktuell: ${dataStats.foodCount} Mahlzeiten, ${dataStats.symptomCount} Symptome. Mindestens 1 Mahlzeit und 1 Symptom erforderlich.`);
      setIsLoading(false);
      return;
    }

    const prompt = `
      Du bist ein einfühlsamer AI-Assistent, der bei der Identifizierung potenzieller Nahrungsmittelauslöser hilft.
      Der Benutzer hat seine Mahlzeiten und Symptome protokolliert. Analysiere diese Daten, um Korrelationen zwischen bestimmten Lebensmitteln und den darauf folgenden Symptomen zu finden.

      Hier sind die Mahlzeiten-Logs:
      ${foodLog}

      Hier sind die Symptom-Logs:
      ${symptomLog}

      Basierend auf deiner Analyse identifiziere die wahrscheinlichsten Nahrungsmittelauslöser. 
      Antworte in einem gültigen JSON-Format mit zwei Schlüsseln: "possibleTriggers" (Array von Lebensmitteln als Strings) und "explanation" (kurze Zusammenfassung auf Deutsch).
      
      Konzentriere dich auf zeitliche Korrelationen zwischen Nahrungsaufnahme und Symptombeginn.
      
      WICHTIG: Erwähne IMMER, dass dies nur eine Unterstützung ist und keine ärztliche Beratung ersetzt!
      
      Beispiel: {"possibleTriggers": ["Milch", "Erdnüsse"], "explanation": "Die Symptome traten wiederholt nach dem Verzehr von Milchprodukten und Erdnüssen auf. Dies könnte auf eine Unverträglichkeit hinweisen. Bitte konsultieren Sie einen Arzt für eine professionelle Diagnose."}
    `;

    try {
      console.log("=== SENDE ANFRAGE AN KI ===");
      console.log("Prompt:", prompt);
      
      clearAiSuggestions();
      const result = await analyzeWithLlama(prompt);
      
      console.log("=== KI-ANTWORT ===");
      console.log("Result:", result);
      
      setAnalysisResult(result);
      saveAiSuggestions(result);
      
      // Initialisiere Chat mit Begrüßungsnachricht nach erfolgreicher Analyse
      initializeChat(result);
      
    } catch (e) {
      console.error("=== KI-ANALYSE FEHLER ===", e);
      setError('Ein Fehler ist bei der Analyse aufgetreten. Der Dienst ist möglicherweise nicht verfügbar.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeChat = (analysisResult: AnalysisResult) => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hallo! 👋 Ich habe Ihre Daten analysiert und ${analysisResult.possibleTriggers.length > 0 ? `${analysisResult.possibleTriggers.length} mögliche Auslöser` : 'keine eindeutigen Auslöser'} identifiziert.

Gerne kann ich Ihnen dabei helfen, die Ergebnisse besser zu verstehen oder Ihre Fragen dazu beantworten. 

❗ **Wichtiger Hinweis**: Ich bin ein AI-Assistent und kann keine ärztliche Beratung ersetzen. Bei ernsthaften Beschwerden sollten Sie unbedingt einen Arzt konsultieren und können gerne diese Analyse als Gesprächsgrundlage mitbringen.

Wie kann ich Ihnen weiterhelfen? 😊`,
      timestamp: new Date()
    };
    
    setChatMessages([welcomeMessage]);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Erstelle Kontext für die Chat-Anfrage
      const { foodLog, symptomLog } = getFormattedLogsForAI();
      const contextPrompt = `
Du bist ein einfühlsamer, hilfsbereiter AI-Assistent für Allergieberatung. Du hilfst Benutzern dabei, ihre Analyse-Ergebnisse zu verstehen.

WICHTIGE VERHALTENSREGELN:
- Sei IMMER empathisch und mitfühlend
- Gib NIEMALS medizinische Diagnosen oder Behandlungsempfehlungen
- Erwähne bei ernsten Beschwerden IMMER, dass ein Arzt konsultiert werden sollte
- Sei konstruktiv und hilfreich
- Sprich auf Deutsch
- Ermutige den Benutzer, den Bericht beim Arztbesuch mitzubringen

VERFÜGBARE DATEN:
Mahlzeiten: ${foodLog}
Symptome: ${symptomLog}
Identifizierte Auslöser: ${analysisResult?.possibleTriggers?.join(', ') || 'Keine'}

AKTUELLE ANALYSE: ${analysisResult?.explanation || 'Keine Analyse verfügbar'}

Benutzer-Frage: ${userMessage.content}

Antworte hilfsreich, empathisch und ermutigend. Bei Unsicherheiten empfehle einen Arztbesuch.
`;

      const response = await analyzeWithLlama(contextPrompt);
      
      // Falls die Antwort als JSON zurückkommt, extrahiere nur die explanation
      let botResponse = '';
      try {
        const parsed = JSON.parse(response.explanation || response);
        botResponse = parsed.explanation || parsed.content || parsed;
      } catch {
        botResponse = typeof response === 'string' ? response : response.explanation || 'Entschuldigung, ich konnte Ihre Frage nicht beantworten.';
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: botResponse,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Entschuldigung, ich bin momentan nicht verfügbar. Bitte versuchen Sie es später erneut. Bei dringenden gesundheitlichen Fragen wenden Sie sich bitte direkt an einen Arzt. 🏥',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Wand2 /> KI-Analyse potenzieller Auslöser
          </CardTitle>
          <CardDescription>
            Lassen Sie die KI Muster zwischen Ihren Mahlzeiten und Symptomen erkennen.
            Diese Funktion dient nur zur Unterstützung und ersetzt keine ärztliche Beratung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Datenstatistiken */}
          <div className="mb-4 p-3 bg-muted rounded-md">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Verfügbare Daten: {dataStats.foodCount} Mahlzeiten, {dataStats.symptomCount} Symptome</span>
            </div>
          </div>

          <Button 
            onClick={handleAnalyze} 
            disabled={isLoading || dataStats.foodCount === 0 || dataStats.symptomCount === 0} 
            className="mb-4 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isLoading ? 'Analysiere...' : 'Analyse starten'}
          </Button>

          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Fehler</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {analysisResult && !isLoading && (
            <div className="mt-4 space-y-4">
              <h3 className="font-headline text-lg text-primary">Analyseergebnis:</h3>
              {analysisResult.possibleTriggers && analysisResult.possibleTriggers.length > 0 ? (
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="text-green-500" /> Mögliche Auslöser:
                  </p>
                  <ul className="list-disc pl-6 mt-2">
                    {analysisResult.possibleTriggers.map((trigger, index) => (
                      <li key={index} className="font-bold">{trigger}</li>
                    ))}
                  </ul>
                  {analysisResult.explanation && (
                      <p className="mt-4 text-sm text-muted-foreground">{analysisResult.explanation}</p>
                  )}
                  
                  {/* Chat-Button */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-pink-500" />
                      <span className="font-semibold text-primary">Haben Sie Fragen zu Ihrer Analyse?</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Chatten Sie mit unserem empathischen AI-Assistenten über Ihre Ergebnisse. 
                      Er kann Ihnen helfen, die Analyse besser zu verstehen und gibt hilfreiche Tipps.
                    </p>
                    <Button 
                      onClick={() => setShowChat(!showChat)} 
                      variant="outline" 
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {showChat ? 'Chat schließen' : 'Mit AI-Assistent chatten'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p>Es konnten keine eindeutigen Auslöser identifiziert werden.</p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-blue-700">Trotzdem Fragen?</span>
                    </div>
                    <p className="text-sm text-blue-600 mb-3">
                      Auch wenn keine eindeutigen Auslöser gefunden wurden, können Sie mit unserem AI-Assistenten über Ihre Symptome sprechen.
                    </p>
                    <Button 
                      onClick={() => setShowChat(!showChat)} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Chat starten
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Chat-Interface */}
      {showChat && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-primary flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Chat mit AI-Assistent
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Einfühlsame Unterstützung - ersetzt keine ärztliche Beratung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Chat-Nachrichten */}
            <ScrollArea className="h-96 mb-4 border rounded-md p-4" ref={chatScrollRef}>
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-2 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="p-3 rounded-lg bg-muted">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chat-Eingabe */}
            <form onSubmit={handleChatSubmit} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Stellen Sie Ihre Frage über die Analyse..."
                disabled={isChatLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={!chatInput.trim() || isChatLoading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Beispiel-Fragen */}
            {chatMessages.length <= 1 && (
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <p className="text-sm font-medium mb-2">💡 Beispiel-Fragen:</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>• "Wie sicher sind diese Ergebnisse?"</p>
                  <p>• "Was sollte ich als nächstes tun?"</p>
                  <p>• "Wie bereite ich mich auf den Arztbesuch vor?"</p>
                  <p>• "Welche Symptome sind besonders bedenklich?"</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
