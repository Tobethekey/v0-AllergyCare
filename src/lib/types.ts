export interface AppSettings {
  // Renamed from UserProfile
  name?: string
  notes?: string
}

export interface UserProfile {
  // New: for individual user profiles
  id: string
  name: string

  // Soziodemografische Daten (alle optional)
  dateOfBirth?: string
  gender?: "männlich" | "weiblich" | "divers" | "keine Angabe"
  weight?: number // in kg
  height?: number // in cm

  // Gesundheitsbezogene Daten
  knownAllergies?: string[] // Bekannte Allergien
  chronicConditions?: string[] // Chronische Erkrankungen
  medications?: string[] // Aktuelle Medikamente

  // Lifestyle-Faktoren
  dietaryPreferences?: ("vegetarisch" | "vegan" | "glutenfrei" | "laktosefrei" | "andere")[]
  activityLevel?: "niedrig" | "mittel" | "hoch"
  smokingStatus?: "nie" | "früher" | "gelegentlich" | "regelmäßig"
  alcoholConsumption?: "nie" | "selten" | "mäßig" | "häufig"

  // Weitere relevante Faktoren
  stressLevel?: "niedrig" | "mittel" | "hoch"
  sleepQuality?: "schlecht" | "mittelmäßig" | "gut" | "sehr gut"

  // Metadaten
  createdAt?: string
  updatedAt?: string
  avatar?: string // Future enhancement: e.g., color or initials
}

export interface FoodEntry {
  id: string
  timestamp: string
  foodItems: string
  photo?: string
  profileIds: string[] // New: Array of UserProfile IDs
}

export type SymptomCategory = "Hautreaktionen" | "Magen-Darm" | "Atmung" | "Allgemeinzustand"
export const symptomCategories: SymptomCategory[] = ["Hautreaktionen", "Magen-Darm", "Atmung", "Allgemeinzustand"]

export type SymptomSeverity = "Leicht" | "Mittel" | "Schwer" // KORRIGIERT: Großbuchstaben
export const symptomSeverities: SymptomSeverity[] = ["Leicht", "Mittel", "Schwer"]

export interface SymptomEntry {
  id: string
  loggedAt: string
  symptom: string
  category: SymptomCategory
  severity: SymptomSeverity // Als String, nicht als Zahl
  startTime: string
  duration: string
  linkedFoodEntryId?: string
  profileId: string // New: Single UserProfile ID
}

// KORRIGIERT: Gleiche Feldnamen wie in der KI-Analyse
export interface AiSuggestion {
  possibleTriggers: string[]
  explanation: string // KORRIGIERT: 'reasoning' zu 'explanation'
}

// Neue Typen für die erweiterten Profildaten
export type Gender = "männlich" | "weiblich" | "divers" | "keine Angabe"
export type DietaryPreference = "vegetarisch" | "vegan" | "glutenfrei" | "laktosefrei" | "andere"
export type ActivityLevel = "niedrig" | "mittel" | "hoch"
export type SmokingStatus = "nie" | "früher" | "gelegentlich" | "regelmäßig"
export type AlcoholConsumption = "nie" | "selten" | "mäßig" | "häufig"
export type StressLevel = "niedrig" | "mittel" | "hoch"
export type SleepQuality = "schlecht" | "mittelmäßig" | "gut" | "sehr gut"

export interface PremiumStatus {
  isPremium: boolean
  subscriptionType?: "monthly" | "yearly" | "lifetime"
  subscriptionDate?: string
  expiryDate?: string
}

export interface UsageLimits {
  dailyFoodEntries: number
  dailySymptomEntries: number
  dailyExports: number
  maxProfiles: number
  lastResetDate: string
}

export interface DailyUsage {
  foodEntries: number
  symptomEntries: number
  exports: number
  date: string
}
