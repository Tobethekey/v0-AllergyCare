'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFoodEntries, getSymptomEntries, getUserProfiles } from '@/lib/data-service';
import { Apple, HeartPulse, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { FoodEntry, SymptomEntry } from '@/lib/types';

type ActivityItem = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });

export function RecentActivity() {
  const [recentItems, setRecentItems] = useState<ActivityItem[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const profiles = getUserProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p.name]));
    setProfilesMap(profileMap);

    const foodEntries = getFoodEntries().map(entry => ({ ...entry, type: 'food' as const }));
    const symptomEntries = getSymptomEntries().map(entry => ({ ...entry, type: 'symptom' as const }));
    
    const allItems = [...foodEntries, ...symptomEntries];
    allItems.sort((a, b) => {
      const dateA = new Date(a.type === 'food' ? a.timestamp : a.startTime).getTime();
      const dateB = new Date(b.type === 'food' ? b.timestamp : b.startTime).getTime();
      return dateB - dateA;
    });
    
    setRecentItems(allItems.slice(0, 5));
  }, []);

  if (recentItems.length === 0) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Letzte Aktivitäten
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            Noch keine Einträge vorhanden.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="font-headline text-primary flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Letzte Aktivitäten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentItems.map((item) => {
          const timestamp = item.type === 'food' ? item.timestamp : item.startTime;
          const profileNames = item.type === 'food' 
            ? item.profileIds.map(id => profilesMap.get(id) || 'Unbekannt').join(', ')
            : profilesMap.get(item.profileId) || 'Unbekannt';

          return (
            <div key={item.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 mt-1">
                {item.type === 'food' ? (
                  <Apple className="h-4 w-4 text-green-600" />
                ) : (
                  <HeartPulse className="h-4 w-4 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {item.type === 'food' ? item.foodItems : item.symptom}
                </p>
                <p className="text-xs text-muted-foreground">
                  {profileNames} • {format(parseISO(timestamp), "dd.MM.yyyy HH:mm", { locale: de })}
                </p>
                {item.type === 'symptom' && (
                  <p className="text-xs text-muted-foreground">
                    {item.category} • {item.severity}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
