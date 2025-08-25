"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Utensils, XCircle } from "lucide-react"
import { addFoodEntry, updateFoodEntry, getUserProfiles, addSymptomEntry } from "@/lib/data-service"
import type { FoodEntry, UserProfile } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { PhotoAnalysisCard } from "./PhotoAnalysisCard"

const getLocalDateTimeString = (isoDateString?: string) => {
  const date = isoDateString ? new Date(isoDateString) : new Date()
  if (isNaN(date.getTime())) {
    const fallbackDate = new Date()
    const offset = fallbackDate.getTimezoneOffset() * 60000
    const localDate = new Date(fallbackDate.getTime() - offset)
    return localDate.toISOString().substring(0, 16)
  }
  const offset = date.getTimezoneOffset() * 60000
  const localDate = new Date(date.getTime() - offset)
  return localDate.toISOString().substring(0, 16)
}

const foodLogFormSchema = z
  .object({
    foodItems: z.string().min(2, {
      message: "Bitte geben Sie mindestens ein Nahrungsmittel an.",
    }),
    photoFile: z.instanceof(File).optional().nullable(),
    profileIds: z.array(z.string()).min(1, {
      message: "Bitte wählen Sie mindestens ein Profil aus.",
    }),
    logSymptom: z.boolean().default(false),
    symptom: z.string().optional(),
    category: z.string().optional(),
    severity: z.string().optional(),
    startTime: z.string().optional(),
    duration: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.logSymptom) {
        return (
          data.symptom &&
          data.symptom.length >= 2 &&
          data.category &&
          data.category.length >= 1 &&
          data.severity &&
          data.severity.length >= 1 &&
          data.startTime &&
          data.duration &&
          data.duration.length >= 1
        )
      }
      return true
    },
    {
      message: "Wenn Sie ein Symptom protokollieren, müssen alle Symptomfelder ausgefüllt sein.",
      path: ["logSymptom"],
    },
  )

type FoodLogFormValues = z.infer<typeof foodLogFormSchema>

interface FoodLogFormProps {
  entryToEdit?: FoodEntry
  onFormSubmit: () => void
}

export function FoodLogForm({ entryToEdit, onFormSubmit }: FoodLogFormProps) {
  const { toast } = useToast()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null | undefined>(null)
  const [availableProfiles, setAvailableProfiles] = useState<UserProfile[]>([])
  const [logSymptom, setLogSymptom] = useState(false)

  useEffect(() => {
    setAvailableProfiles(getUserProfiles())
  }, [])

  const defaultValues: Partial<FoodLogFormValues> = {
    foodItems: entryToEdit?.foodItems || "",
    photoFile: undefined,
    profileIds: entryToEdit?.profileIds || [],
    logSymptom: false,
    symptom: "",
    category: "",
    severity: "",
    startTime: getLocalDateTimeString(),
    duration: "",
  }

  const form = useForm<FoodLogFormValues>({
    resolver: zodResolver(foodLogFormSchema),
    defaultValues,
    mode: "onChange",
  })

  useEffect(() => {
    if (entryToEdit) {
      form.reset({
        foodItems: entryToEdit.foodItems,
        photoFile: undefined,
        profileIds: entryToEdit.profileIds || [],
      })
      setPhotoPreview(entryToEdit.photo || null)
      setExistingPhotoUrl(entryToEdit.photo)
    } else {
      form.reset(defaultValues)
      setPhotoPreview(null)
      setExistingPhotoUrl(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryToEdit, form.reset])

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      form.setValue("photoFile", file, { shouldValidate: true })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      form.setValue("photoFile", undefined)
      setPhotoPreview(existingPhotoUrl || null)
    }
  }

  const removePhoto = () => {
    form.setValue("photoFile", null, { shouldValidate: true })
    setPhotoPreview(null)
    setExistingPhotoUrl(null)
  }

  const handlePhotoAnalysisComplete = (detectedFoods: string[]) => {
    // Füge erkannte Nahrungsmittel zum bestehenden Text hinzu
    const currentFoods = form.getValues("foodItems")
    const newFoods = detectedFoods.join(", ")
    const combinedFoods = currentFoods ? `${currentFoods}, ${newFoods}` : newFoods

    form.setValue("foodItems", combinedFoods, { shouldValidate: true })

    toast({
      title: "Nahrungsmittel hinzugefügt",
      description: `${detectedFoods.length} erkannte Nahrungsmittel wurden automatisch eingetragen.`,
    })
  }

  async function onSubmit(data: FoodLogFormValues) {
    try {
      const foodEntryData = {
        foodItems: data.foodItems,
        photoFile: data.photoFile,
        profileIds: data.profileIds,
      }

      const newOrUpdatedFoodEntry = entryToEdit
        ? await updateFoodEntry(entryToEdit.id, foodEntryData)
        : await addFoodEntry(foodEntryData)

      if (data.logSymptom && data.symptom) {
        const symptomData = {
          symptom: data.symptom,
          category: data.category!,
          severity: data.severity!,
          startTime: data.startTime!,
          duration: data.duration!,
          linkedFoodEntryId: newOrUpdatedFoodEntry.id,
        }

        for (const profileId of data.profileIds) {
          await addSymptomEntry({ ...symptomData, profileId })
        }
      }

      toast({
        title: "Erfolgreich gespeichert",
        description: `Die Mahlzeit${data.logSymptom ? " und das Symptom wurden" : " wurde"} erfolgreich protokolliert.`,
        variant: "success",
      })
      form.reset(defaultValues)
      setPhotoPreview(null)
      setExistingPhotoUrl(null)
      setLogSymptom(false)
      onFormSubmit()

      // *** HIER IST DIE KORREKTUR ***
      // Erzwingt das Neuladen der Seite, damit alle Komponenten die neuen Daten sehen.
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern des Eintrags ist ein Fehler aufgetreten.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="foodItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nahrungsmittel</FormLabel>
              <FormControl>
                <Textarea placeholder="Was haben Sie gegessen oder getrunken?" {...field} />
              </FormControl>
              <FormDescription>Listen Sie alle konsumierten Nahrungsmittel und Getränke auf.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoFile"
          render={({ field: { onChange, value, ...field } }) => (
            <FormItem>
              <FormLabel>Foto (optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input type="file" accept="image/*" onChange={handlePhotoChange} {...field} />
                  {photoPreview && (
                    <div className="relative">
                      <Image
                        src={photoPreview || "/placeholder.svg"}
                        alt="Mahlzeit Vorschau"
                        width={200}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removePhoto}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <PhotoAnalysisCard
                    photoFile={form.getValues("photoFile")}
                    onAnalysisComplete={handlePhotoAnalysisComplete}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Fügen Sie optional ein Foto Ihrer Mahlzeit hinzu. Premium-Nutzer erhalten automatische KI-Analyse.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="profileIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile</FormLabel>
              <div className="flex flex-wrap gap-4">
                {availableProfiles.map((profile) => (
                  <FormField
                    key={profile.id}
                    control={form.control}
                    name="profileIds"
                    render={({ field }) => {
                      return (
                        <FormItem key={profile.id} className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(profile.id)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), profile.id])
                                  : field.onChange(field.value?.filter((value) => value !== profile.id))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">{profile.name}</FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormDescription>Wählen Sie die Profile aus, für die dieser Eintrag gilt.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logSymptom"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    const isChecked = Boolean(checked)
                    field.onChange(isChecked)
                    setLogSymptom(isChecked)
                    if (isChecked) {
                      form.setValue("startTime", getLocalDateTimeString())
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Symptom gleichzeitig erfassen</FormLabel>
                <FormDescription>
                  Wählen Sie diese Option, um direkt mit der Mahlzeit ein Symptom zu protokollieren.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {logSymptom && (
          <div className="space-y-8 rounded-md border p-4 shadow-inner">
            <FormField
              control={form.control}
              name="symptom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Symptom</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Bauchschmerzen, Hautausschlag" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie eine Kategorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Magen-Darm">Magen-Darm</SelectItem>
                        <SelectItem value="Haut">Haut</SelectItem>
                        <SelectItem value="Atemwege">Atemwege</SelectItem>
                        <SelectItem value="Herz-Kreislauf">Herz-Kreislauf</SelectItem>
                        <SelectItem value="Allgemein">Allgemein</SelectItem>
                        <SelectItem value="Andere">Andere</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schweregrad</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen Sie den Schweregrad" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Leicht">Leicht</SelectItem>
                        <SelectItem value="Mittel">Mittel</SelectItem>
                        <SelectItem value="Schwer">Schwer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Startzeitpunkt</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dauer</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. 2 Stunden, 30 Minuten" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <Button type="submit" className="w-full md:w-auto">
          <Utensils className="mr-2 h-4 w-4" />
          {entryToEdit ? "Änderungen speichern" : "Eintrag speichern"}
        </Button>
      </form>
    </Form>
  )
}
