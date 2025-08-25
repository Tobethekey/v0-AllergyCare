'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getFoodEntries, getSymptomEntries, getUserProfiles } from '@/lib/data-service';
import { Search, Apple, HeartPulse, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import type { FoodEntry, SymptomEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';

type SearchResult = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });

interface GlobalSearchProps {
  onResultClick?: (result: SearchResult) => void;
}

export function GlobalSearch({ onResultClick }: GlobalSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [allItems, setAllItems] = useState<SearchResult[]>([]);
  const [profilesMap, setProfilesMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const profiles = getUserProfiles();
    const profileMap = new Map(profiles.map(p => [p.id, p.name]));
    setProfilesMap(profileMap);

    const foodEntries = getFoodEntries().map(entry => ({ ...entry, type: 'food' as const }));
    const symptomEntries = getSymptomEntries().map(entry => ({ ...entry, type: 'symptom' as const }));
    
    const items = [...foodEntries, ...symptomEntries];
    items.sort((a, b) => {
      const dateA = new Date(a.type === 'food' ? a.timestamp : a.startTime).getTime();
      const dateB = new Date(b.type === 'food' ? b.timestamp : b.startTime).getTime();
      return dateB - dateA;
    });
    
    setAllItems(items);
  }, []);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return allItems.filter(item => {
      if (item.type === 'food') {
        const profileNames = item.profileIds.map(id => profilesMap.get(id) || '').join(' ');
        return item.foodItems.toLowerCase().includes(lowerSearchTerm) ||
               profileNames.toLowerCase().includes(lowerSearchTerm);
      } else {
        const profileName = profilesMap.get(item.profileId) || '';
        return item.symptom.toLowerCase().includes(lowerSearchTerm) ||
               item.category.toLowerCase().includes(lowerSearchTerm) ||
               profileName.toLowerCase().includes(lowerSearchTerm);
      }
    }).slice(0, 10);
  }, [searchTerm, allItems, profilesMap]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    onResultClick?.(result);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Suche in Mahlzeiten und Symptomen..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && searchTerm && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 right-0 mt-1 z-20 max-h-96 overflow-y-auto shadow-lg">
            <CardContent className="p-0">
              {filteredResults.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Keine Ergebnisse gefunden
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredResults.map((result) => {
                    const timestamp = result.type === 'food' ? result.timestamp : result.startTime;
                    const profileNames = result.type === 'food' 
                      ? result.profileIds.map(id => profilesMap.get(id) || 'Unbekannt').join(', ')
                      : profilesMap.get(result.profileId) || 'Unbekannt';

                    return (
                      <div
                        key={result.id}
                        className="flex items-start gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleResultClick(result)}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {result.type === 'food' ? (
                            <Apple className="h-4 w-4 text-green-600" />
                          ) : (
                            <HeartPulse className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {result.type === 'food' ? result.foodItems : result.symptom}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {profileNames} • {format(parseISO(timestamp), "dd.MM.yyyy HH:mm", { locale: de })}
                          </p>
                          {result.type === 'symptom' && (
                            <p className="text-xs text-muted-foreground">
                              {result.category} • {result.severity}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
