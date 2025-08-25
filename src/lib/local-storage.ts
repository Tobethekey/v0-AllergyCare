// Definiert die Struktur der Objekte, die wir speichern
interface FoodLog {
  id: string;
  date: string;
  foodItems: string[];
  photo?: string;
}

interface SymptomLog {
  id: string;
  description: string;
  category: string;
  severity: number;
  startDate: string;
  duration: number;
}

interface AnalysisResult {
  possibleTriggers: string[];
  explanation: string;
}

// Eine Hilfsfunktion, um sicher mit dem Local Storage zu arbeiten (verhindert Fehler auf dem Server)
const safeGetLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key “${key}”:`, error);
    return defaultValue;
  }
};

const safeSetLocalStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key “${key}”:`, error);
  }
};

// --- KOMPLETTE FUNKTIONEN ZUR DATENVERWALTUNG ---

// --- Food Logs ---
export const getAllFoodLogs = (): FoodLog[] => safeGetLocalStorage('foodLogs', []);

export const addFoodLog = (newLog: Omit<FoodLog, 'id'>) => {
  const logs = getAllFoodLogs();
  const logWithId: FoodLog = { ...newLog, id: new Date().toISOString() };
  safeSetLocalStorage('foodLogs', [...logs, logWithId]);
};

export const updateFoodLog = (updatedLog: FoodLog) => {
  const logs = getAllFoodLogs();
  const updatedLogs = logs.map(log => log.id === updatedLog.id ? updatedLog : log);
  safeSetLocalStorage('foodLogs', updatedLogs);
};

export const deleteFoodLog = (id: string) => {
  const logs = getAllFoodLogs();
  const filteredLogs = logs.filter(log => log.id !== id);
  safeSetLocalStorage('foodLogs', filteredLogs);
};


// --- Symptom Logs ---
export const getAllSymptomLogs = (): SymptomLog[] => safeGetLocalStorage('symptomLogs', []);

export const addSymptomLog = (newLog: Omit<SymptomLog, 'id'>) => {
    const logs = getAllSymptomLogs();
    const logWithId: SymptomLog = { ...newLog, id: new Date().toISOString() };
    safeSetLocalStorage('symptomLogs', [...logs, logWithId]);
};

export const updateSymptomLog = (updatedLog: SymptomLog) => {
  const logs = getAllSymptomLogs();
  const updatedLogs = logs.map(log => log.id === updatedLog.id ? updatedLog : log);
  safeSetLocalStorage('symptomLogs', updatedLogs);
};

export const deleteSymptomLog = (id: string) => {
  const logs = getAllSymptomLogs();
  const filteredLogs = logs.filter(log => log.id !== id);
  safeSetLocalStorage('symptomLogs', filteredLogs);
};


// --- AI Analysis ---
export const getAiSuggestions = (): AnalysisResult | null => safeGetLocalStorage('aiSuggestions', null);

export const saveAiSuggestions = (result: AnalysisResult) => {
  safeSetLocalStorage('aiSuggestions', result);
};

export const clearAiSuggestions = () => {
    if (typeof window !== 'undefined') {
        window.localStorage.removeItem('aiSuggestions');
    }
};
