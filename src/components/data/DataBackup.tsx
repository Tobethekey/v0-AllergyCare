"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Download, Upload, AlertTriangle, Clock, Trash2, RotateCcw, Settings } from "lucide-react"
import {
  saveAppSettings,
  getAutoBackups,
  restoreFromAutoBackup,
  deleteAutoBackup,
  getBackupSettings,
  saveBackupSettings,
  createEnhancedBackup,
  validateDataIntegrity,
} from "@/lib/data-service"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Die Schlüssel sind hier nicht mehr nötig, da wir die Logik in data-service kapseln
const FOOD_LOG_KEY = "ALLERGYCARE_FOOD_LOGS"
const SYMPTOM_LOG_KEY = "ALLERGYCARE_SYMPTOM_LOGS"
const APP_SETTINGS_KEY = "ALLERGYCARE_APP_SETTINGS"
const USER_PROFILES_KEY = "ALLERGYCARE_USER_PROFILES"

// Helper-Funktion, die wir direkt hier verwenden, da die Originale nicht exportiert ist
function saveRawToLocalStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.setItem(key, JSON.stringify(value))
  window.localStorage.setItem("ALLERGYCARE_LAST_ACTIVITY", new Date().toISOString())
}

export function DataBackup() {
  const [isImporting, setIsImporting] = useState(false)
  const [showAutoBackups, setShowAutoBackups] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    try {
      const dataStr = createEnhancedBackup()
      const dataBlob = new Blob([dataStr], { type: "application/json" })

      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `allergycare-backup-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Backup erstellt",
        description: "Ihre Daten wurden erfolgreich exportiert.",
      })
    } catch (error) {
      toast({
        title: "Fehler beim Export",
        description: "Die Daten konnten nicht exportiert werden.",
        variant: "destructive",
      })
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      let foodEntries, symptomEntries, userProfiles, appSettings

      if (data.version === "2.0" && data.data) {
        // New enhanced format
        foodEntries = data.data.foodEntries
        symptomEntries = data.data.symptomEntries
        userProfiles = data.data.userProfiles
        appSettings = data.data.appSettings
      } else {
        // Legacy format
        foodEntries = data.foodEntries
        symptomEntries = data.symptomEntries
        userProfiles = data.userProfiles
        appSettings = data.appSettings
      }

      if (!foodEntries || !symptomEntries || !userProfiles) {
        throw new Error("Invalid backup file format")
      }

      const isValidFoodEntry = foodEntries.every(
        (entry: any) => entry.id && entry.timestamp && entry.foodItems && Array.isArray(entry.profileIds),
      )
      const isValidSymptomEntry = symptomEntries.every(
        (entry: any) =>
          entry.id &&
          entry.loggedAt &&
          entry.symptom &&
          entry.category &&
          entry.severity &&
          entry.startTime &&
          entry.duration &&
          entry.profileId,
      )
      const isValidUserProfile = userProfiles.every((profile: any) => profile.id && profile.name)

      if (!isValidFoodEntry || !isValidSymptomEntry || !isValidUserProfile) {
        throw new Error("Ungültiges Datenformat in der Backup-Datei")
      }

      // *** KORREKTUR: Wir verwenden die lokale Helper-Funktion ***
      saveRawToLocalStorage(FOOD_LOG_KEY, foodEntries)
      saveRawToLocalStorage(SYMPTOM_LOG_KEY, symptomEntries)
      saveRawToLocalStorage(USER_PROFILES_KEY, userProfiles)

      if (appSettings) {
        // Für die App-Settings können wir die exportierte Funktion nutzen
        saveAppSettings(appSettings)
      }

      toast({
        title: "Import erfolgreich",
        description: "Ihre Daten wurden erfolgreich importiert. Die Seite wird neu geladen.",
      })

      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Import error:", error)
      toast({
        title: "Fehler beim Import",
        description: error instanceof Error ? error.message : "Die Backup-Datei konnte nicht gelesen werden.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      if (event.target) {
        event.target.value = ""
      }
    }
  }

  const autoBackups = getAutoBackups()
  const backupSettings = getBackupSettings()
  const dataIntegrity = validateDataIntegrity()

  const handleRestoreAutoBackup = (backupId: string) => {
    if (restoreFromAutoBackup(backupId)) {
      toast({
        title: "Wiederherstellung erfolgreich",
        description: "Die Daten wurden aus dem automatischen Backup wiederhergestellt.",
      })
      setTimeout(() => window.location.reload(), 1500)
    } else {
      toast({
        title: "Fehler bei Wiederherstellung",
        description: "Das Backup konnte nicht wiederhergestellt werden.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAutoBackup = (backupId: string) => {
    deleteAutoBackup(backupId)
    toast({
      title: "Backup gelöscht",
      description: "Das automatische Backup wurde entfernt.",
    })
  }

  const handleSaveBackupSettings = (newSettings: any) => {
    saveBackupSettings(newSettings)
    toast({
      title: "Einstellungen gespeichert",
      description: "Die Backup-Einstellungen wurden aktualisiert.",
    })
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Download className="h-5 w-5" />
            Datensicherung
          </CardTitle>
          {!dataIntegrity.isValid && (
            <div className="flex items-center gap-2 text-orange-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Datenintegritätsprobleme erkannt
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Vollständiges Backup erstellen</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Erstellen Sie eine erweiterte Sicherungskopie mit Metadaten und Integritätsprüfung.
              </p>
              <Button onClick={exportData} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Erweiterte Sicherung herunterladen
              </Button>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Daten importieren</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Stellen Sie Ihre Daten aus einer Backup-Datei wieder her.
              </p>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full bg-transparent" disabled={isImporting}>
                    <Upload className="mr-2 h-4 w-4" />
                    {isImporting ? "Importiere..." : "Backup wiederherstellen"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Daten importieren
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      <strong>Achtung:</strong> Beim Import werden alle aktuellen Daten überschrieben. Stellen Sie
                      sicher, dass Sie vorher ein Backup erstellt haben.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={handleImportClick} disabled={isImporting}>
                      Fortfahren & Datei auswählen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Input
                ref={fileInputRef}
                id="backup-file"
                type="file"
                accept=".json"
                onChange={importData}
                disabled={isImporting}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowAutoBackups(!showAutoBackups)} className="flex-1">
              <Clock className="mr-2 h-4 w-4" />
              Automatische Backups ({autoBackups.length})
            </Button>
            <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {showSettings && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Backup-Einstellungen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-backup">Automatische Backups</Label>
                  <Switch
                    id="auto-backup"
                    checked={backupSettings.enabled}
                    onCheckedChange={(enabled) => handleSaveBackupSettings({ ...backupSettings, enabled })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Backup-Häufigkeit</Label>
                  <Select
                    value={backupSettings.frequency}
                    onValueChange={(frequency) => handleSaveBackupSettings({ ...backupSettings, frequency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Maximale Anzahl Backups</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={backupSettings.maxBackups}
                    onChange={(e) =>
                      handleSaveBackupSettings({ ...backupSettings, maxBackups: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {showAutoBackups && (
            <Card className="border-dashed">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Automatische Backups</CardTitle>
              </CardHeader>
              <CardContent>
                {autoBackups.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine automatischen Backups vorhanden
                  </p>
                ) : (
                  <div className="space-y-2">
                    {autoBackups.map((backup) => (
                      <div key={backup.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <div className="text-sm font-medium">
                            {new Date(backup.timestamp).toLocaleString("de-DE")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {backup.data.foodEntries.length} Mahlzeiten, {backup.data.symptomEntries.length} Symptome,{" "}
                            {backup.data.userProfiles.length} Profile
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => handleRestoreAutoBackup(backup.id)}>
                            <RotateCcw className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteAutoBackup(backup.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="p-4 bg-muted/50 rounded-md">
            <h5 className="font-medium mb-2">Wichtige Hinweise:</h5>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Automatische Backups werden lokal auf Ihrem Gerät erstellt</li>
              <li>• Erweiterte Backups enthalten Metadaten und Integritätsprüfungen</li>
              <li>• Bewahren Sie manuelle Backup-Dateien sicher auf</li>
              <li>• Backup-Dateien enthalten alle persönlichen Gesundheitsdaten</li>
              <li>• Der Import überschreibt alle aktuellen Daten</li>
            </ul>
            {dataIntegrity.warnings.length > 0 && (
              <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                <div className="text-sm font-medium text-yellow-800">Warnungen:</div>
                <ul className="text-xs text-yellow-700 mt-1">
                  {dataIntegrity.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
