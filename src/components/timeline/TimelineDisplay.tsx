'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { getFoodEntries, getSymptomEntries, deleteFoodEntry, deleteSymptomEntry, getFoodEntryById, getUserProfiles, getUserProfileById } from '@/lib/data-service';
import type { FoodEntry, SymptomEntry, UserProfile } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Apple, ClipboardPlus, Trash2, AlertCircle, LinkIcon, Edit, Users, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { useToast } from "@/hooks/use-toast";
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
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodLogForm } from '@/components/forms/FoodLogForm';
import { SymptomLogForm } from '@/components/forms/SymptomLogForm';


type TimelineItem = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });

export function TimelineDisplay() {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [userProfilesMap, setUserProfilesMap] = useState<Map<string, string>>(new Map());

  const [foodEntryToEdit, setFoodEntryToEdit] = useState<FoodEntry | null>(null);
  const [symptomEntryToEdit, setSymptomEntryToEdit] = useState<SymptomEntry | null>(null);

  const fetchData = () => {
    setIsLoading(true);
    const profiles = getUserProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p.name]));
    setUserProfilesMap(profileMap);

    const foodItems = getFoodEntries().map(entry => ({ ...entry, type: 'food' as const }));
    const symptomItems = getSymptomEntries().map(entry => ({ ...entry, type: 'symptom' as const }));
    
    const allItems = [...foodItems, ...symptomItems];
    allItems.sort((a, b) => {
      const dateA = new Date(a.type === 'food' ? a.timestamp : a.startTime).getTime();
      const dateB = new Date(b.type === 'food' ? b.timestamp : b.startTime).getTime();
      return dateB - dateA; 
    });
    setTimelineItems(allItems);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id: string, type: 'food' | 'symptom') => {
    if (type === 'food') {
      deleteFoodEntry(id);
    } else {
      deleteSymptomEntry(id);
    }
    fetchData(); 
    toast({
      title: "Eintrag gelöscht",
      description: "Der Eintrag wurde erfolgreich entfernt.",
    });
  };

  const handleEditFoodEntry = (entry: FoodEntry) => {
    setFoodEntryToEdit(entry);
  };

  const handleEditSymptomEntry = (entry: SymptomEntry) => {
    setSymptomEntryToEdit(entry);
  };

  const handleFormSubmit = () => {
    fetchData();
    setFoodEntryToEdit(null);
    setSymptomEntryToEdit(null);
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="shadow-md"><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle><CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card className="shadow-md"><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle><CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        <Card className="shadow-md"><CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle><CardDescription><Skeleton className="h-4 w-3/4" /></CardDescription></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Noch keine Einträge vorhanden.</p>
          <p className="text-sm text-muted-foreground">Beginnen Sie mit der Dokumentation von Mahlzeiten oder Symptomen.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {timelineItems.map((item) => {
        let linkedFood: FoodEntry | undefined;
        if (item.type === 'symptom' && item.linkedFoodEntryId) {
          linkedFood = getFoodEntryById(item.linkedFoodEntryId);
        }

        const itemProfileNames = item.type === 'food' 
          ? item.profileIds.map(id => userProfilesMap.get(id) || 'Unbekannt').join(', ')
          : userProfilesMap.get(item.profileId) || 'Unbekannt';

        return (
          <Card key={item.id} className="shadow-md transition-all duration-300 ease-in-out hover:shadow-lg">
            <CardHeader className="flex flex-row justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 font-headline text-lg text-primary">
                  {item.type === 'food' ? <Apple className="h-5 w-5" /> : <ClipboardPlus className="h-5 w-5" />}
                  {item.type === 'food' ? 'Mahlzeit' : 'Symptom'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {item.type === 'food' 
                    ? `Dokumentiert: ${format(parseISO(item.timestamp), "dd.MM.yyyy HH:mm", { locale: de })} Uhr`
                    : `Beginn: ${format(parseISO(item.startTime), "dd.MM.yyyy HH:mm", { locale: de })} Uhr (Protokolliert: ${format(parseISO(item.loggedAt), "dd.MM.yyyy HH:mm", { locale: de })} Uhr)`}
                </CardDescription>
                <CardDescription className="text-xs mt-0.5 flex items-center gap-1">
                  {item.type === 'food' ? <Users className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                  {itemProfileNames}
                </CardDescription>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => item.type === 'food' ? handleEditFoodEntry(item as FoodEntry) : handleEditSymptomEntry(item as SymptomEntry)}
                  aria-label="Eintrag bearbeiten"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" aria-label="Eintrag löschen">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchten Sie diesen Eintrag wirklich unwiderruflich löschen?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id, item.type)} className="bg-destructive hover:bg-destructive/90">
                        Löschen
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              {item.type === 'food' ? (
                <div className="space-y-2">
                  <p><span className="font-semibold">Nahrungsmittel:</span> {item.foodItems}</p>
                  {item.photo && (
                    <div className="mt-2 relative w-full max-w-xs h-48 rounded overflow-hidden border border-input">
                      <Image src={item.photo} alt="Mahlzeit Foto" layout="fill" objectFit="cover" data-ai-hint="food meal"/>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <p><span className="font-semibold">Beschreibung:</span> {item.symptom}</p>
                  <p><span className="font-semibold">Kategorie:</span> {item.category}</p>
                  <p><span className="font-semibold">Schweregrad:</span> {item.severity}</p>
                  <p><span className="font-semibold">Dauer:</span> {item.duration}</p>
                  {linkedFood && (
                    <div className="mt-2 pt-2 border-t border-dashed">
                       <p className="text-sm flex items-center gap-1">
                        <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">Verknüpfte Mahlzeit:</span> 
                        <span className="text-muted-foreground">
                           {format(parseISO(linkedFood.timestamp), "dd.MM.yy HH:mm", { locale: de })} - {linkedFood.foodItems.substring(0,50)}{linkedFood.foodItems.length > 50 ? '...' : ''}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      <Dialog open={!!foodEntryToEdit} onOpenChange={(isOpen) => !isOpen && setFoodEntryToEdit(null)}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mahlzeit bearbeiten</DialogTitle>
          </DialogHeader>
          {foodEntryToEdit && (
            <FoodLogForm entryToEdit={foodEntryToEdit} onFormSubmit={handleFormSubmit} />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!symptomEntryToEdit} onOpenChange={(isOpen) => !isOpen && setSymptomEntryToEdit(null)}>
        <DialogContent className="sm:max-w-[425px] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Symptom bearbeiten</DialogTitle>
          </DialogHeader>
          {symptomEntryToEdit && (
            <SymptomLogForm entryToEdit={symptomEntryToEdit} onFormSubmit={handleFormSubmit} />
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
