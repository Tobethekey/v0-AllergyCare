'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, Calendar, Brain, User as UserIcon } from 'lucide-react';
import type { UserProfile } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';

interface ProfileDetailsCardProps {
  profile: UserProfile;
  showTitle?: boolean;
}

export function ProfileDetailsCard({ profile, showTitle = true }: ProfileDetailsCardProps) {
  const calculateAge = (dateOfBirth: string) => {
    return Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  return (
    <Card className="w-full">
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <UserIcon className="h-4 w-4" />
            Profil: {profile.name}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="text-xs space-y-2">
        {/* Grunddaten */}
        {(profile.dateOfBirth || profile.gender || profile.weight || profile.height) && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Calendar className="h-3 w-3" />
              <span>Grunddaten</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {profile.dateOfBirth && (
                <div>Alter: {calculateAge(profile.dateOfBirth)} Jahre</div>
              )}
              {profile.gender && (
                <div>Geschlecht: {profile.gender}</div>
              )}
              {profile.weight && profile.height && (
                <div>BMI: {(profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)}</div>
              )}
            </div>
          </div>
        )}

        {/* Gesundheitsdaten */}
        {(profile.knownAllergies?.length || profile.chronicConditions?.length || profile.medications?.length) && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Heart className="h-3 w-3" />
              <span>Gesundheit</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {profile.knownAllergies?.length && (
                <div>Allergien: {profile.knownAllergies.join(', ')}</div>
              )}
              {profile.chronicConditions?.length && (
                <div>Erkrankungen: {profile.chronicConditions.join(', ')}</div>
              )}
              {profile.medications?.length && (
                <div>Medikamente: {profile.medications.join(', ')}</div>
              )}
            </div>
          </div>
        )}

        {/* Lebensstil */}
        {(profile.dietaryPreferences?.length || profile.activityLevel || profile.smokingStatus || profile.alcoholConsumption) && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Activity className="h-3 w-3" />
              <span>Lebensstil</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {profile.dietaryPreferences?.length && (
                <div>Ernährung: {profile.dietaryPreferences.join(', ')}</div>
              )}
              {profile.activityLevel && (
                <div>Aktivität: {profile.activityLevel}</div>
              )}
              {profile.smokingStatus && (
                <div>Rauchen: {profile.smokingStatus}</div>
              )}
              {profile.alcoholConsumption && (
                <div>Alkohol: {profile.alcoholConsumption}</div>
              )}
            </div>
          </div>
        )}

        {/* Wohlbefinden */}
        {(profile.stressLevel || profile.sleepQuality) && (
          <div className="space-y-1">
            <div className="flex items-center gap-1 font-medium">
              <Brain className="h-3 w-3" />
              <span>Wohlbefinden</span>
            </div>
            <div className="ml-4 space-y-0.5">
              {profile.stressLevel && (
                <div>Stress: {profile.stressLevel}</div>
              )}
              {profile.sleepQuality && (
                <div>Schlaf: {profile.sleepQuality}</div>
              )}
            </div>
          </div>
        )}

        {/* Zeitstempel */}
        {profile.updatedAt && (
          <div className="text-xs text-muted-foreground pt-1 border-t">
            Zuletzt aktualisiert: {format(parseISO(profile.updatedAt), "dd.MM.yyyy", { locale: de })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
