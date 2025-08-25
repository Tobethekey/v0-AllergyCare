'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, User, Heart, Activity, Brain } from 'lucide-react';
import { addUserProfile, updateUserProfile } from '@/lib/data-service';
import type { UserProfile, DietaryPreference } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const extendedUserProfileFormSchema = z.object({
  name: z.string().min(1, { message: 'Bitte geben Sie einen Namen ein.' }),
  
  // Grunddaten
  dateOfBirth: z.string().optional(),
  gender: z.enum(['männlich', 'weiblich', 'divers', 'keine Angabe']).optional(),
  weight: z.coerce.number().min(1).max(300).optional().or(z.literal('')),
  height: z.coerce.number().min(50).max(250).optional().or(z.literal('')),
  
  // Gesundheitsdaten
  knownAllergies: z.string().optional(),
  chronicConditions: z.string().optional(),
  medications: z.string().optional(),
  
  // Lifestyle
  dietaryPreferences: z.array(z.enum(['vegetarisch', 'vegan', 'glutenfrei', 'laktosefrei', 'andere'])).optional(),
  activityLevel: z.enum(['niedrig', 'mittel', 'hoch']).optional(),
  smokingStatus: z.enum(['nie', 'früher', 'gelegentlich', 'regelmäßig']).optional(),
  alcoholConsumption: z.enum(['nie', 'selten', 'mäßig', 'häufig']).optional(),
  
  // Wohlbefinden
  stressLevel: z.enum(['niedrig', 'mittel', 'hoch']).optional(),
  sleepQuality: z.enum(['schlecht', 'mittelmäßig', 'gut', 'sehr gut']).optional(),
});

type ExtendedUserProfileFormValues = z.infer<typeof extendedUserProfileFormSchema>;

interface ExtendedUserProfileFormProps {
  profileToEdit?: UserProfile | null;
  onFormSubmit: () => void;
}

const dietaryOptions: { value: DietaryPreference; label: string }[] = [
  { value: 'vegetarisch', label: 'Vegetarisch' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'glutenfrei', label: 'Glutenfrei' },
  { value: 'laktosefrei', label: 'Laktosefrei' },
  { value: 'andere', label: 'Andere' },
];

export function ExtendedUserProfileForm({ profileToEdit, onFormSubmit }: ExtendedUserProfileFormProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  
  const form = useForm<ExtendedUserProfileFormValues>({
    resolver: zodResolver(extendedUserProfileFormSchema),
    defaultValues: {
      name: profileToEdit?.name || '',
      dateOfBirth: profileToEdit?.dateOfBirth || '',
      gender: profileToEdit?.gender || undefined,
      weight: profileToEdit?.weight || '',
      height: profileToEdit?.height || '',
      knownAllergies: profileToEdit?.knownAllergies?.join(', ') || '',
      chronicConditions: profileToEdit?.chronicConditions?.join(', ') || '',
      medications: profileToEdit?.medications?.join(', ') || '',
      dietaryPreferences: profileToEdit?.dietaryPreferences || [],
      activityLevel: profileToEdit?.activityLevel || undefined,
      smokingStatus: profileToEdit?.smokingStatus || undefined,
      alcoholConsumption: profileToEdit?.alcoholConsumption || undefined,
      stressLevel: profileToEdit?.stressLevel || undefined,
      sleepQuality: profileToEdit?.sleepQuality || undefined,
    },
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset({
      name: profileToEdit?.name || '',
      dateOfBirth: profileToEdit?.dateOfBirth || '',
      gender: profileToEdit?.gender || undefined,
      weight: profileToEdit?.weight || '',
      height: profileToEdit?.height || '',
      knownAllergies: profileToEdit?.knownAllergies?.join(', ') || '',
      chronicConditions: profileToEdit?.chronicConditions?.join(', ') || '',
      medications: profileToEdit?.medications?.join(', ') || '',
      dietaryPreferences: profileToEdit?.dietaryPreferences || [],
      activityLevel: profileToEdit?.activityLevel || undefined,
      smokingStatus: profileToEdit?.smokingStatus || undefined,
      alcoholConsumption: profileToEdit?.alcoholConsumption || undefined,
      stressLevel: profileToEdit?.stressLevel || undefined,
      sleepQuality: profileToEdit?.sleepQuality || undefined,
    });
  }, [profileToEdit, form]);

  function onSubmit(data: ExtendedUserProfileFormValues) {
    const processedData: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      name: data.name,
      dateOfBirth: data.dateOfBirth || undefined,
      gender: data.gender,
      weight: typeof data.weight === 'number' && data.weight > 0 ? data.weight : undefined,
      height: typeof data.height === 'number' && data.height > 0 ? data.height : undefined,
      knownAllergies: data.knownAllergies ? data.knownAllergies.split(',').map(s => s.trim()).filter(s => s) : undefined,
      chronicConditions: data.chronicConditions ? data.chronicConditions.split(',').map(s => s.trim()).filter(s => s) : undefined,
      medications: data.medications ? data.medications.split(',').map(s => s.trim()).filter(s => s) : undefined,
      dietaryPreferences: data.dietaryPreferences?.length ? data.dietaryPreferences : undefined,
      activityLevel: data.activityLevel,
      smokingStatus: data.smokingStatus,
      alcoholConsumption: data.alcoholConsumption,
      stressLevel: data.stressLevel,
      sleepQuality: data.sleepQuality,
    };

    if (profileToEdit) {
      updateUserProfile(profileToEdit.id, processedData);
      toast({
        title: 'Profil aktualisiert',
        description: `Das Profil "${data.name}" wurde erfolgreich geändert.`,
      });
    } else {
      addUserProfile(processedData);
      toast({
        title: 'Profil erstellt',
        description: `Das Profil "${data.name}" wurde erfolgreich angelegt.`,
      });
    }
    onFormSubmit();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Grunddaten
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Gesundheit
            </TabsTrigger>
            <TabsTrigger value="lifestyle" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Lebensstil
            </TabsTrigger>
            <TabsTrigger value="wellbeing" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Wohlbefinden
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Grunddaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name des Profils *</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Max Mustermann, Kind Anna" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geburtsdatum (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        Hilft bei der Einschätzung altersabhängiger Allergieentwicklung
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Geschlecht (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="männlich">Männlich</SelectItem>
                          <SelectItem value="weiblich">Weiblich</SelectItem>
                          <SelectItem value="divers">Divers</SelectItem>
                          <SelectItem value="keine Angabe">Keine Angabe</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gewicht (kg, optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="70"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Größe (cm, optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="175"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gesundheitsdaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="knownAllergies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bekannte Allergien (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="z.B. Nüsse, Milch, Gluten (durch Kommas getrennt)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Bereits diagnostizierte Allergien, durch Kommas getrennt
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chronicConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chronische Erkrankungen (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="z.B. Asthma, Neurodermitis, Diabetes (durch Kommas getrennt)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Können Allergiesymptome beeinflussen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktuelle Medikamente (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="z.B. Antihistaminika, Inhalator (durch Kommas getrennt)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Medikamente können Allergiesymptome maskieren oder verstärken
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lebensstil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="dietaryPreferences"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel className="text-base">Ernährungsweise (optional)</FormLabel>
                        <FormDescription>
                          Mehrfachauswahl möglich
                        </FormDescription>
                      </div>
                      {dietaryOptions.map((item) => (
                        <FormField
                          key={item.value}
                          control={form.control}
                          name="dietaryPreferences"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), item.value])
                                        : field.onChange(
                                            (field.value || []).filter(
                                              (value) => value !== item.value
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktivitätsniveau (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="niedrig">Niedrig (wenig Sport)</SelectItem>
                          <SelectItem value="mittel">Mittel (regelmäßig aktiv)</SelectItem>
                          <SelectItem value="hoch">Hoch (sehr sportlich)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Körperliche Aktivität kann Allergiesymptome beeinflussen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="smokingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Raucherstatus (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nie">Nie geraucht</SelectItem>
                          <SelectItem value="früher">Früher geraucht</SelectItem>
                          <SelectItem value="gelegentlich">Gelegentlich</SelectItem>
                          <SelectItem value="regelmäßig">Regelmäßig</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alcoholConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alkoholkonsum (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nie">Nie</SelectItem>
                          <SelectItem value="selten">Selten</SelectItem>
                          <SelectItem value="mäßig">Mäßig</SelectItem>
                          <SelectItem value="häufig">Häufig</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="wellbeing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Wohlbefinden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="stressLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aktuelles Stressniveau (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="niedrig">Niedrig</SelectItem>
                          <SelectItem value="mittel">Mittel</SelectItem>
                          <SelectItem value="hoch">Hoch</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Stress kann Allergiesymptome verstärken
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sleepQuality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schlafqualität (optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Bitte auswählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="schlecht">Schlecht</SelectItem>
                          <SelectItem value="mittelmäßig">Mittelmäßig</SelectItem>
                          <SelectItem value="gut">Gut</SelectItem>
                          <SelectItem value="sehr gut">Sehr gut</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Schlechter Schlaf kann das Immunsystem schwächen
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            * Pflichtfeld | Alle anderen Angaben sind freiwillig und helfen bei der Analyse
          </div>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="mr-2 h-4 w-4" /> 
            {profileToEdit ? 'Änderungen speichern' : 'Profil speichern'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
