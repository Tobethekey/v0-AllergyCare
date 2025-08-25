"use client"
import type {
  FoodEntry,
  SymptomEntry,
  AppSettings,
  UserProfile,
  AiSuggestion,
  PremiumStatus,
  UsageLimits,
  DailyUsage,
} from "./types"

const FOOD_LOG_KEY = "ALLERGYCARE_FOOD_LOGS" // Changed prefix for uniqueness
const SYMPTOM_LOG_KEY = "ALLERGYCARE_SYMPTOM_LOGS" // Changed prefix
const APP_SETTINGS_KEY = "ALLERGYCARE_APP_SETTINGS" // Renamed from USER_PROFILE_KEY
const USER_PROFILES_KEY = "ALLERGYCARE_USER_PROFILES" // New key for user profiles
const AI_SUGGESTIONS_KEY = "ALLERGYCARE_AI_SUGGESTIONS" // Changed prefix
const PREMIUM_STATUS_KEY = "ALLERGYCARE_PREMIUM_STATUS"
const USAGE_LIMITS_KEY = "ALLERGYCARE_USAGE_LIMITS"
const DAILY_USAGE_KEY = "ALLERGYCARE_DAILY_USAGE"
const AUTO_BACKUP_KEY = "ALLERGYCARE_AUTO_BACKUP"
const BACKUP_SETTINGS_KEY = "ALLERGYCARE_BACKUP_SETTINGS"

function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") {
    return defaultValue
  }
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return defaultValue
  }
}

function saveToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    // Update last activity timestamp
    window.localStorage.setItem("ALLERGYCARE_LAST_ACTIVITY", new Date().toISOString())

    triggerAutoBackup()
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error)
  }
}

interface BackupSettings {
  enabled: boolean
  frequency: "daily" | "weekly" | "monthly"
  maxBackups: number
  lastBackupDate?: string
}

interface AutoBackup {
  id: string
  timestamp: string
  data: {
    foodEntries: FoodEntry[]
    symptomEntries: SymptomEntry[]
    userProfiles: UserProfile[]
    appSettings: AppSettings
  }
}

export const getBackupSettings = (): BackupSettings =>
  getFromLocalStorage(BACKUP_SETTINGS_KEY, {
    enabled: true,
    frequency: "daily" as const,
    maxBackups: 7,
  })

export const saveBackupSettings = (settings: BackupSettings): void => saveToLocalStorage(BACKUP_SETTINGS_KEY, settings)

export const getAutoBackups = (): AutoBackup[] => getFromLocalStorage(AUTO_BACKUP_KEY, [])

export const createAutoBackup = (): void => {
  const settings = getBackupSettings()
  if (!settings.enabled) return

  const backups = getAutoBackups()
  const now = new Date()
  const lastBackup = backups[0]

  // Check if backup is needed based on frequency
  if (lastBackup) {
    const lastBackupDate = new Date(lastBackup.timestamp)
    const timeDiff = now.getTime() - lastBackupDate.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)

    const shouldBackup =
      (settings.frequency === "daily" && daysDiff >= 1) ||
      (settings.frequency === "weekly" && daysDiff >= 7) ||
      (settings.frequency === "monthly" && daysDiff >= 30)

    if (!shouldBackup) return
  }

  const newBackup: AutoBackup = {
    id: crypto.randomUUID(),
    timestamp: now.toISOString(),
    data: {
      foodEntries: getFoodEntries(),
      symptomEntries: getSymptomEntries(),
      userProfiles: getUserProfiles(),
      appSettings: getAppSettings(),
    },
  }

  // Add new backup and maintain max limit
  const updatedBackups = [newBackup, ...backups].slice(0, settings.maxBackups)
  saveToLocalStorage(AUTO_BACKUP_KEY, updatedBackups)

  // Update last backup date
  const updatedSettings = { ...settings, lastBackupDate: now.toISOString() }
  saveToLocalStorage(BACKUP_SETTINGS_KEY, updatedSettings)
}

export const restoreFromAutoBackup = (backupId: string): boolean => {
  const backups = getAutoBackups()
  const backup = backups.find((b) => b.id === backupId)

  if (!backup) return false

  try {
    saveToLocalStorage(FOOD_LOG_KEY, backup.data.foodEntries)
    saveToLocalStorage(SYMPTOM_LOG_KEY, backup.data.symptomEntries)
    saveToLocalStorage(USER_PROFILES_KEY, backup.data.userProfiles)
    saveToLocalStorage(APP_SETTINGS_KEY, backup.data.appSettings)
    return true
  } catch (error) {
    console.error("Error restoring from auto backup:", error)
    return false
  }
}

export const deleteAutoBackup = (backupId: string): void => {
  const backups = getAutoBackups()
  const updatedBackups = backups.filter((b) => b.id !== backupId)
  saveToLocalStorage(AUTO_BACKUP_KEY, updatedBackups)
}

const triggerAutoBackup = (): void => {
  // Debounce backup creation to avoid too frequent backups
  if (typeof window !== "undefined") {
    clearTimeout((window as any).autoBackupTimeout)
    ;(window as any).autoBackupTimeout = setTimeout(() => {
      createAutoBackup()
    }, 5000) // Wait 5 seconds after last change
  }
}

export const validateDataIntegrity = (): {
  isValid: boolean
  errors: string[]
  warnings: string[]
} => {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const foodEntries = getFoodEntries()
    const symptomEntries = getSymptomEntries()
    const userProfiles = getUserProfiles()
    const profileIds = new Set(userProfiles.map((p) => p.id))

    // Validate food entries
    foodEntries.forEach((entry, index) => {
      if (!entry.id || !entry.timestamp || !entry.foodItems) {
        errors.push(`Food entry ${index + 1}: Missing required fields`)
      }
      if (!Array.isArray(entry.profileIds)) {
        errors.push(`Food entry ${index + 1}: Invalid profileIds format`)
      } else {
        entry.profileIds.forEach((profileId) => {
          if (!profileIds.has(profileId)) {
            warnings.push(`Food entry ${index + 1}: References non-existent profile ${profileId}`)
          }
        })
      }
    })

    // Validate symptom entries
    symptomEntries.forEach((entry, index) => {
      if (!entry.id || !entry.loggedAt || !entry.symptom || !entry.profileId) {
        errors.push(`Symptom entry ${index + 1}: Missing required fields`)
      }
      if (!profileIds.has(entry.profileId)) {
        warnings.push(`Symptom entry ${index + 1}: References non-existent profile ${entry.profileId}`)
      }
      if (entry.linkedFoodEntryId) {
        const linkedFood = foodEntries.find((f) => f.id === entry.linkedFoodEntryId)
        if (!linkedFood) {
          warnings.push(`Symptom entry ${index + 1}: References non-existent food entry`)
        }
      }
    })

    // Validate user profiles
    userProfiles.forEach((profile, index) => {
      if (!profile.id || !profile.name) {
        errors.push(`User profile ${index + 1}: Missing required fields`)
      }
    })
  } catch (error) {
    errors.push(`Data validation failed: ${error}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const createEnhancedBackup = (): string => {
  const data = {
    version: "2.0",
    timestamp: new Date().toISOString(),
    metadata: {
      totalFoodEntries: getFoodEntries().length,
      totalSymptomEntries: getSymptomEntries().length,
      totalProfiles: getUserProfiles().length,
      dataIntegrity: validateDataIntegrity(),
    },
    data: {
      foodEntries: getFoodEntries(),
      symptomEntries: getSymptomEntries(),
      userProfiles: getUserProfiles(),
      appSettings: getAppSettings(),
      premiumStatus: getPremiumStatus(),
      usageLimits: getUsageLimits(),
      backupSettings: getBackupSettings(),
    },
  }

  return JSON.stringify(data, null, 2)
}

// Hilfsfunktion für Schweregrad-Konvertierung
function getSeverityLevel(severity: string): number {
  switch (severity.toLowerCase()) {
    case "leicht":
      return 1
    case "mittel":
      return 2
    case "schwer":
      return 3
    default:
      return 1
  }
}

// User Profiles (Extended)
export const getUserProfiles = (): UserProfile[] => getFromLocalStorage(USER_PROFILES_KEY, [])

export const addUserProfile = (
  profileData: Omit<UserProfile, "id" | "createdAt" | "updatedAt">,
): UserProfile | null => {
  if (!canCreateProfile()) {
    return null // Profile limit reached
  }

  const profiles = getUserProfiles()
  const now = new Date().toISOString()
  const newProfile: UserProfile = {
    id: crypto.randomUUID(),
    ...profileData,
    createdAt: now,
    updatedAt: now,
  }
  saveToLocalStorage(USER_PROFILES_KEY, [...profiles, newProfile])
  return newProfile
}

export const updateUserProfile = (
  id: string,
  profileData: Partial<Omit<UserProfile, "id" | "createdAt">>,
): UserProfile | undefined => {
  const profiles = getUserProfiles()
  const profileIndex = profiles.findIndex((profile) => profile.id === id)
  if (profileIndex === -1) return undefined

  const updatedProfile: UserProfile = {
    ...profiles[profileIndex],
    ...profileData,
    updatedAt: new Date().toISOString(),
  }

  profiles[profileIndex] = updatedProfile
  saveToLocalStorage(USER_PROFILES_KEY, profiles)
  return updatedProfile
}

export const deleteUserProfile = (id: string): void => {
  let profiles = getUserProfiles()
  profiles = profiles.filter((profile) => profile.id !== id)
  saveToLocalStorage(USER_PROFILES_KEY, profiles)

  // Also remove this profileId from food and symptom entries
  const foodEntries = getFoodEntries()
  foodEntries.forEach((entry) => {
    entry.profileIds = entry.profileIds.filter((pid) => pid !== id)
  })
  saveToLocalStorage(FOOD_LOG_KEY, foodEntries)

  let symptomEntries = getSymptomEntries()
  symptomEntries = symptomEntries.filter((entry) => entry.profileId !== id) // Remove symptom if it belonged to deleted profile
  // Alternatively, set profileId to a default/null if preferred, but removing makes sense here.
  saveToLocalStorage(SYMPTOM_LOG_KEY, symptomEntries)
}

export const getUserProfileById = (id: string): UserProfile | undefined => {
  const profiles = getUserProfiles()
  return profiles.find((profile) => profile.id === id)
}

// Food Entries
export const getFoodEntries = (): FoodEntry[] => getFromLocalStorage(FOOD_LOG_KEY, [])
export const addFoodEntry = (entry: Omit<FoodEntry, "id" | "timestamp">): FoodEntry | null => {
  if (!incrementDailyUsage("foodEntries")) {
    return null // Limit reached
  }

  const entries = getFoodEntries()
  const newEntry: FoodEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    profileIds: entry.profileIds || [], // Ensure profileIds is initialized
  }
  saveToLocalStorage(FOOD_LOG_KEY, [...entries, newEntry])
  return newEntry
}
export const updateFoodEntry = (
  id: string,
  dataToUpdate: Omit<FoodEntry, "id" | "timestamp">,
): FoodEntry | undefined => {
  const entries = getFoodEntries()
  const entryIndex = entries.findIndex((entry) => entry.id === id)
  if (entryIndex === -1) return undefined

  const updatedEntry: FoodEntry = {
    ...entries[entryIndex],
    ...dataToUpdate,
    profileIds: dataToUpdate.profileIds || entries[entryIndex].profileIds, // Handle profileIds update
  }
  entries[entryIndex] = updatedEntry
  saveToLocalStorage(FOOD_LOG_KEY, entries)
  return updatedEntry
}
export const deleteFoodEntry = (id: string): void => {
  const entries = getFoodEntries()
  saveToLocalStorage(
    FOOD_LOG_KEY,
    entries.filter((entry) => entry.id !== id),
  )
}
export const getFoodEntryById = (id: string): FoodEntry | undefined => {
  const entries = getFoodEntries()
  return entries.find((entry) => entry.id === id)
}

// Symptom Entries
export const getSymptomEntries = (): SymptomEntry[] => getFromLocalStorage(SYMPTOM_LOG_KEY, [])
export const addSymptomEntry = (entry: Omit<SymptomEntry, "id" | "loggedAt">): SymptomEntry | null => {
  if (!incrementDailyUsage("symptomEntries")) {
    return null // Limit reached
  }

  const entries = getSymptomEntries()
  if (!entry.profileId) {
    console.error("Attempted to add symptom entry without a profileId.")
    return null
  }
  const newEntry: SymptomEntry = {
    ...entry,
    id: crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
  }
  saveToLocalStorage(SYMPTOM_LOG_KEY, [...entries, newEntry])
  return newEntry
}
export const updateSymptomEntry = (
  id: string,
  dataToUpdate: Omit<SymptomEntry, "id" | "loggedAt">,
): SymptomEntry | undefined => {
  const entries = getSymptomEntries()
  const entryIndex = entries.findIndex((entry) => entry.id === id)
  if (entryIndex === -1) return undefined

  const updatedEntry: SymptomEntry = {
    ...entries[entryIndex],
    ...dataToUpdate,
    profileId: dataToUpdate.profileId || entries[entryIndex].profileId, // Handle profileId update
  }
  entries[entryIndex] = updatedEntry
  saveToLocalStorage(SYMPTOM_LOG_KEY, entries)
  return updatedEntry
}
export const deleteSymptomEntry = (id: string): void => {
  const entries = getSymptomEntries()
  saveToLocalStorage(
    SYMPTOM_LOG_KEY,
    entries.filter((entry) => entry.id !== id),
  )
}

// App Settings (Renamed from UserProfile)
export const getAppSettings = (): AppSettings => getFromLocalStorage(APP_SETTINGS_KEY, { notes: "", name: "" })
export const saveAppSettings = (settings: AppSettings): void => saveToLocalStorage(APP_SETTINGS_KEY, settings)

// AI Suggestions - KORRIGIERT
export const getAiSuggestions = (): AiSuggestion | null => getFromLocalStorage(AI_SUGGESTIONS_KEY, null)
export const saveAiSuggestions = (suggestions: AiSuggestion): void =>
  saveToLocalStorage(AI_SUGGESTIONS_KEY, suggestions)
export const clearAiSuggestions = (): void => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AI_SUGGESTIONS_KEY)
  }
}

// Data validation and cleanup
export const validateAndCleanData = (): void => {
  const profiles = getUserProfiles()
  const profileIds = new Set(profiles.map((p) => p.id))

  // Clean food entries
  const foodEntries = getFoodEntries()
  const cleanedFoodEntries = foodEntries.map((entry) => ({
    ...entry,
    profileIds: entry.profileIds.filter((id) => profileIds.has(id)),
  }))
  saveToLocalStorage(FOOD_LOG_KEY, cleanedFoodEntries)

  // Clean symptom entries
  const symptomEntries = getSymptomEntries()
  const cleanedSymptomEntries = symptomEntries.filter((entry) => profileIds.has(entry.profileId))
  saveToLocalStorage(SYMPTOM_LOG_KEY, cleanedSymptomEntries)
}

// CSV Export (erweitert für neue Profildaten)
export const exportDataToCsv = (): boolean => {
  if (!incrementDailyUsage("exports")) {
    return false // Export limit reached
  }

  const foodEntries = getFoodEntries()
  const symptomEntries = getSymptomEntries()
  const userProfiles = getUserProfiles()
  const profileMap = new Map(userProfiles.map((p) => [p.id, p.name]))

  let csvContent = "data:text/csv;charset=utf-8,"

  csvContent += `AllergyCare Data Export\r\n`
  csvContent += `Export Date: ${new Date().toLocaleString("de-DE")}\r\n`
  csvContent += `Total Food Entries: ${foodEntries.length}\r\n`
  csvContent += `Total Symptom Entries: ${symptomEntries.length}\r\n`
  csvContent += `Total Profiles: ${userProfiles.length}\r\n\r\n`

  // Extended User Profiles Export
  csvContent += "User Profiles\r\n"
  csvContent +=
    "ID,Name,Date of Birth,Gender,Weight,Height,Known Allergies,Chronic Conditions,Medications,Dietary Preferences,Activity Level,Smoking Status,Alcohol Consumption,Stress Level,Sleep Quality,Created At,Updated At\r\n"
  userProfiles.forEach((profile) => {
    const row = [
      profile.id,
      `"${profile.name.replace(/"/g, '""')}"`,
      profile.dateOfBirth || "",
      profile.gender || "",
      profile.weight || "",
      profile.height || "",
      `"${(profile.knownAllergies || []).join("; ").replace(/"/g, '""')}"`,
      `"${(profile.chronicConditions || []).join("; ").replace(/"/g, '""')}"`,
      `"${(profile.medications || []).join("; ").replace(/"/g, '""')}"`,
      `"${(profile.dietaryPreferences || []).join("; ").replace(/"/g, '""')}"`,
      profile.activityLevel || "",
      profile.smokingStatus || "",
      profile.alcoholConsumption || "",
      profile.stressLevel || "",
      profile.sleepQuality || "",
      profile.createdAt || "",
      profile.updatedAt || "",
    ].join(",")
    csvContent += row + "\r\n"
  })
  csvContent += "\r\n"

  csvContent += "Food Entries\r\n"
  csvContent += "ID,Timestamp,Food Items,Profile IDs,Profile Names,Photo Link\r\n"
  foodEntries.forEach((entry) => {
    const profileNames = entry.profileIds.map((id) => profileMap.get(id) || "Unbekannt").join("; ")
    const row = [
      entry.id,
      entry.timestamp,
      `"${entry.foodItems.replace(/"/g, '""')}"`,
      entry.profileIds.join(";"),
      `"${profileNames.replace(/"/g, '""')}"`,
      entry.photo || "",
    ].join(",")
    csvContent += row + "\r\n"
  })

  csvContent += "\r\nSymptom Entries\r\n"
  csvContent += "ID,Logged At,Symptom,Category,Severity,Start Time,Duration,Linked Food ID,Profile ID,Profile Name\r\n"
  symptomEntries.forEach((entry) => {
    const profileName = profileMap.get(entry.profileId) || "Unbekannt"
    const row = [
      entry.id,
      entry.loggedAt,
      `"${entry.symptom.replace(/"/g, '""')}"`,
      entry.category,
      entry.severity,
      entry.startTime,
      entry.duration,
      entry.linkedFoodEntryId || "",
      entry.profileId,
      `"${profileName.replace(/"/g, '""')}"`,
    ].join(",")
    csvContent += row + "\r\n"
  })

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement("a")
  link.setAttribute("href", encodedUri)
  link.setAttribute("download", `allergy_care_data_${new Date().toISOString().split("T")[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  return true
}

export const getPremiumStatus = (): PremiumStatus => getFromLocalStorage(PREMIUM_STATUS_KEY, { isPremium: false })

export const setPremiumStatus = (status: PremiumStatus): void => {
  saveToLocalStorage(PREMIUM_STATUS_KEY, status)
}

export const getUsageLimits = (): UsageLimits => {
  const today = new Date().toDateString()
  const defaultLimits: UsageLimits = {
    dailyFoodEntries: 1,
    dailySymptomEntries: 1,
    dailyExports: 1,
    maxProfiles: 1,
    lastResetDate: today,
  }

  const limits = getFromLocalStorage(USAGE_LIMITS_KEY, defaultLimits)

  // Reset daily limits if it's a new day
  if (limits.lastResetDate !== today) {
    const resetLimits = { ...limits, lastResetDate: today }
    saveToLocalStorage(USAGE_LIMITS_KEY, resetLimits)
    // Reset daily usage
    const resetUsage: DailyUsage = { foodEntries: 0, symptomEntries: 0, exports: 0, date: today }
    saveToLocalStorage(DAILY_USAGE_KEY, resetUsage)
    return resetLimits
  }

  return limits
}

export const getDailyUsage = (): DailyUsage => {
  const today = new Date().toDateString()
  const defaultUsage: DailyUsage = { foodEntries: 0, symptomEntries: 0, exports: 0, date: today }

  const usage = getFromLocalStorage(DAILY_USAGE_KEY, defaultUsage)

  // Reset if it's a new day
  if (usage.date !== today) {
    const resetUsage = { ...defaultUsage, date: today }
    saveToLocalStorage(DAILY_USAGE_KEY, resetUsage)
    return resetUsage
  }

  return usage
}

export const incrementDailyUsage = (type: "foodEntries" | "symptomEntries" | "exports"): boolean => {
  const premiumStatus = getPremiumStatus()
  const limits = getUsageLimits()
  const usage = getDailyUsage()

  // Premium users have unlimited usage
  if (premiumStatus.isPremium) {
    const newUsage = { ...usage, [type]: usage[type] + 1 }
    saveToLocalStorage(DAILY_USAGE_KEY, newUsage)
    return true
  }

  // Check limits for free users
  const currentCount = usage[type]
  const limit =
    type === "foodEntries"
      ? limits.dailyFoodEntries
      : type === "symptomEntries"
        ? limits.dailySymptomEntries
        : limits.dailyExports

  if (currentCount >= limit) {
    return false // Limit reached
  }

  const newUsage = { ...usage, [type]: usage[type] + 1 }
  saveToLocalStorage(DAILY_USAGE_KEY, newUsage)
  return true
}

export const canCreateProfile = (): boolean => {
  const premiumStatus = getPremiumStatus()
  const limits = getUsageLimits()
  const currentProfiles = getUserProfiles().length

  if (premiumStatus.isPremium) {
    return true // Premium users can create unlimited profiles
  }

  return currentProfiles < limits.maxProfiles
}

export const getRemainingUsage = () => {
  const premiumStatus = getPremiumStatus()
  const limits = getUsageLimits()
  const usage = getDailyUsage()

  if (premiumStatus.isPremium) {
    return {
      foodEntries: "unlimited",
      symptomEntries: "unlimited",
      exports: "unlimited",
      profiles: "unlimited",
    }
  }

  return {
    foodEntries: Math.max(0, limits.dailyFoodEntries - usage.foodEntries),
    symptomEntries: Math.max(0, limits.dailySymptomEntries - usage.symptomEntries),
    exports: Math.max(0, limits.dailyExports - usage.exports),
    profiles: Math.max(0, limits.maxProfiles - getUserProfiles().length),
  }
}

export const getFormattedLogsForAI = () => {
  const foodEntries = getFoodEntries()
  const symptomEntries = getSymptomEntries()
  const userProfiles = getUserProfiles()
  const profileMap = new Map(userProfiles.map((p) => [p.id, p.name]))

  // Format food entries for AI analysis
  const foodLog = foodEntries
    .map((entry) => {
      const profileNames = entry.profileIds.map((id) => profileMap.get(id) || "Unbekannt").join(", ")
      const date = new Date(entry.timestamp).toLocaleString("de-DE")
      return `${date} - ${entry.foodItems} (Profile: ${profileNames})`
    })
    .join("\n")

  // Format symptom entries for AI analysis
  const symptomLog = symptomEntries
    .map((entry) => {
      const profileName = profileMap.get(entry.profileId) || "Unbekannt"
      const date = new Date(entry.loggedAt).toLocaleString("de-DE")
      const startTime = entry.startTime ? ` (Beginn: ${entry.startTime})` : ""
      const duration = entry.duration ? ` (Dauer: ${entry.duration})` : ""
      return `${date} - ${entry.symptom} (${entry.severity}, Kategorie: ${entry.category}${startTime}${duration}) - Profil: ${profileName}`
    })
    .join("\n")

  return {
    foodLog: foodLog || null,
    symptomLog: symptomLog || null,
  }
}
