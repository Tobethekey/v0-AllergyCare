'use client';

import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, FileDown, Filter, AlertCircle, Apple, ClipboardPlus, LinkIcon, Users, User as UserIcon, Heart, Activity, Calendar } from 'lucide-react';
import { getFoodEntries, getSymptomEntries, exportDataToCsv, getFoodEntryById, getUserProfiles } from '@/lib/data-service';
import type { FoodEntry, SymptomEntry, UserProfile } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type ReportItem = (FoodEntry & { type: 'food' }) | (SymptomEntry & { type: 'symptom' });

export function ReportGenerator() {
  const [allFoodEntries, setAllFoodEntries] = useState<FoodEntry[]>([]);
  const [allSymptomEntries, setAllSymptomEntries] = useState<SymptomEntry[]>([]);
  const [allUserProfiles, setAllUserProfiles] = useState<UserProfile[]>([]);
  const [userProfilesMap, setUserProfilesMap] = useState<Map<string, UserProfile>>(new Map());
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  
  const [filteredItems, setFilteredItems] = useState<ReportItem[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const reportPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const food = getFoodEntries();
    const symptoms = getSymptomEntries();
    const profiles = getUserProfiles();
    setAllFoodEntries(food);
    setAllSymptomEntries(symptoms);
    setAllUserProfiles(profiles);
    setUserProfilesMap(new Map(profiles.map(p => [p.id, p])));
    setLoadingInitialData(false);
  }, []);

  useEffect(() => {
    filterAndSortData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allFoodEntries, allSymptomEntries, startDate, endDate, searchTerm, allUserProfiles]);

  const filterAndSortData = () => {
    let items: ReportItem[] = [
      ...allFoodEntries.map(e => ({ ...e, type: 'food' as const })),
      ...allSymptomEntries.map(e => ({ ...e, type: 'symptom' as const }))
    ];

    if (startDate) {
      const start = parseISO(startDate).getTime();
      items = items.filter(item => {
        const itemDate = parseISO(item.type === 'food' ? item.timestamp : item.startTime).getTime();
        return itemDate >= start;
      });
    }

    if (endDate) {
      const end = parseISO(endDate).getTime() + (24 * 60 * 60 * 1000 -1); 
      items = items.filter(item => {
        const itemDate = parseISO(item.type === 'food' ? item.timestamp : item.startTime).getTime();
        return itemDate <= end;
      });
    }

    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      items = items.filter(item => {
        if (item.type === 'food') {
          const profileNames = item.profileIds.map(id => userProfilesMap.get(id)?.name?.toLowerCase() || '').join(' ');
          const profileAllergies = item.profileIds
            .map(id => userProfilesMap.get(id)?.knownAllergies?.join(' ').toLowerCase() || '')
            .join(' ');
          return item.foodItems.toLowerCase().includes(lowerSearchTerm) || 
                 profileNames.includes(lowerSearchTerm) ||
                 profileAllergies.includes(lowerSearchTerm);
        } else { // Symptom
          const profile = userProfilesMap.get(item.profileId);
          const profileName = profile?.name?.toLowerCase() || '';
          const profileAllergies = profile?.knownAllergies?.join(' ').toLowerCase() || '';
          const profileMedications = profile?.medications?.join(' ').toLowerCase() || '';
          
          let match = item.symptom.toLowerCase().includes(lowerSearchTerm) || 
                 item.category.toLowerCase().includes(lowerSearchTerm) ||
                 profileName.includes(lowerSearchTerm) ||
                 profileAllergies.includes(lowerSearchTerm) ||
                 profileMedications.includes(lowerSearchTerm);
          
          if (item.linkedFoodEntryId) {
            const linkedFood = getFoodEntryById(item.linkedFoodEntryId);
            if (linkedFood && linkedFood.foodItems.toLowerCase().includes(lowerSearchTerm)) {
              match = true;
            }
          }
          return match;
        }
      });
    }
    
    items.sort((a, b) => {
      const dateA = new Date(a.type === 'food' ? a.timestamp : a.startTime).getTime();
      const dateB = new Date(b.type === 'food' ? b.timestamp : b.startTime).getTime();
      return dateA - dateB; 
    });
    
    setFilteredItems(items);
  };
  
  const handleDirectPdfDownload = async () => {
    if (loadingInitialData || filteredItems.length === 0 || !reportPreviewRef.current) {
      console.warn('PDF generation conditions not met.');
      return;
    }

    const reportElement = reportPreviewRef.current;
    
    const originalStyles = {
        width: reportElement.style.width,
        height: reportElement.style.height,
        padding: reportElement.style.padding,
        overflow: reportElement.style.overflow,
        position: reportElement.style.position,
        left: reportElement.style.left,
        top: reportElement.style.top,
    };
    
    reportElement.style.width = '210mm'; 
    reportElement.style.height = 'auto'; 
    reportElement.style.padding = '15mm'; 
    reportElement.style.overflow = 'visible'; 
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    reportElement.style.top = '-9999px';

    const canvas = await html2canvas(reportElement, {
      scale: 2, 
      useCORS: true,
      logging: false, 
      onclone: (documentClone) => {
        const clonedReportElement = documentClone.getElementById('report-preview-area');
        if (clonedReportElement) {
            clonedReportElement.style.background = 'white';
            clonedReportElement.style.color = 'black';
            clonedReportElement.style.fontFamily = 'Arial, sans-serif';

            const allElements = clonedReportElement.querySelectorAll<HTMLElement>('*');
            allElements.forEach(el => {
                el.style.color = 'black';
                el.style.fontFamily = 'Arial, sans-serif';
                if (el.classList.contains('text-primary')) el.style.color = 'black';
                if (el.classList.contains('text-muted-foreground')) el.style.color = 'black';
                if (el.classList.contains('font-headline')) el.style.fontFamily = 'Arial, sans-serif';
            });
            
            clonedReportElement.querySelectorAll<HTMLElement>('img').forEach(img => {
                img.style.maxWidth = '100px';
                img.style.maxHeight = '100px';
                img.style.border = '1px solid #ccc';
            });
            clonedReportElement.querySelectorAll<HTMLElement>('.report-item').forEach(item => {
                item.style.breakInside = 'avoid'; 
            });
        }
      }
    });
    
    reportElement.style.width = originalStyles.width;
    reportElement.style.height = originalStyles.height;
    reportElement.style.padding = originalStyles.padding;
    reportElement.style.overflow = originalStyles.overflow;
    reportElement.style.position = originalStyles.position;
    reportElement.style.left = originalStyles.left;
    reportElement.style.top = originalStyles.top;

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let currentPosition = 0;
    let remainingImgHeight = imgHeight;

    pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
    remainingImgHeight -= pdfHeight;

    while (remainingImgHeight > 0) {
      currentPosition -= pdfHeight; 
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, currentPosition, imgWidth, imgHeight);
      remainingImgHeight -= pdfHeight;
    }

    pdf.save('AllergyCare-Bericht.pdf');
  };

  // Hilfsfunktion zur Formatierung der Profil-Zusatzinformationen
  const formatProfileDetails = (profile: UserProfile) => {
    const details = [];
    
    if (profile.dateOfBirth) {
      const age = Math.floor((new Date().getTime() - new Date(profile.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      details.push(`${age} Jahre`);
    }
    
    if (profile.gender) {
      details.push(profile.gender);
    }
    
    if (profile.knownAllergies && profile.knownAllergies.length > 0) {
      details.push(`Allergien: ${profile.knownAllergies.join(', ')}`);
    }
    
    if (profile.medications && profile.medications.length > 0) {
      details.push(`Medikamente: ${profile.medications.join(', ')}`);
    }
    
    if (profile.dietaryPreferences && profile.dietaryPreferences.length > 0) {
      details.push(`Ernährung: ${profile.dietaryPreferences.join(', ')}`);
    }
    
    return details;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg no-print">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Filter /> Filteroptionen
          </CardTitle>
          <CardDescription>Passen Sie den Zeitraum und Suchbegriffe für Ihren Bericht an. Jetzt auch durchsuchbar nach Profildaten wie Allergien und Medikamenten.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingInitialData ? (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div><Label htmlFor="startDate">Startdatum</Label><Skeleton className="h-10 w-full" /></div>
                <div><Label htmlFor="endDate">Enddatum</Label><Skeleton className="h-10 w-full" /></div>
              </div>
              <div><Label htmlFor="searchTerm">Suchbegriff</Label><Skeleton className="h-10 w-full" /></div>
            </>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Startdatum</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="endDate">Enddatum</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="searchTerm">Suchbegriff (Nahrungsmittel/Symptom/Profil/Allergien/Medikamente)</Label>
                <Input id="searchTerm" type="text" placeholder="z.B. Milch, Hautausschlag, Max, Nüsse, Antihistaminikum" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 justify-end no-print">
        <Button onClick={handleDirectPdfDownload} className="bg-primary hover:bg-primary/90" disabled={loadingInitialData || filteredItems.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Download als PDF
        </Button>    
        <Button onClick={() => exportDataToCsv()} className="bg-primary hover:bg-primary/90" disabled={loadingInitialData || (allFoodEntries.length === 0 && allSymptomEntries.length === 0)}>
          <FileDown className="mr-2 h-4 w-4" /> Download als CSV
        </Button>      
      </div>

      <Card className="shadow-lg print-container" id="report-preview-area">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary text-center">Gesundheitsbericht AllergyCare</CardTitle>
          <CardDescription className="text-center">
            Zeitraum: {startDate && isValid(parseISO(startDate)) ? format(parseISO(startDate), "dd.MM.yyyy", { locale: de }) : 'Unbegrenzt'} - {endDate && isValid(parseISO(endDate)) ? format(parseISO(endDate), "dd.MM.yyyy", { locale: de }) : 'Unbegrenzt'}
            {searchTerm && <span className="block">Suchbegriff: {searchTerm}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent ref={reportPreviewRef} className="report-preview space-y-4">
          {loadingInitialData ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
                <AlertCircle className="mx-auto h-10 w-10 mb-2" />
                {allFoodEntries.length === 0 && allSymptomEntries.length === 0 && allUserProfiles.length === 0
                  ? "Es sind noch keine Daten vorhanden. Bitte dokumentieren Sie zuerst Mahlzeiten, Symptome oder legen Sie Profile an."
                  : "Keine Daten für die ausgewählten Filter gefunden."
                }
            </div>
          ) : (
            filteredItems.map(item => {
              let linkedFoodDetails: FoodEntry | undefined;
              if (item.type === 'symptom' && item.linkedFoodEntryId) {
                linkedFoodDetails = getFoodEntryById(item.linkedFoodEntryId);
              }
              
              const itemProfileNames = item.type === 'food' 
                ? item.profileIds.map(id => userProfilesMap.get(id)?.name || 'Unbekannt').join(', ')
                : userProfilesMap.get(item.profileId)?.name || 'Unbekannt';

              const relevantProfiles = item.type === 'food' 
                ? item.profileIds.map(id => userProfilesMap.get(id)).filter(Boolean) as UserProfile[]
                : [userProfilesMap.get(item.profileId)].filter(Boolean) as UserProfile[];

              return (
                <div key={item.id} className="p-3 border rounded-md break-inside-avoid-page report-item">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    {item.type === 'food' ? <Apple size={18} /> : <ClipboardPlus size={18} />}
                    {item.type === 'food' ? 'Mahlzeit' : 'Symptom'} - {format(parseISO(item.type === 'food' ? item.timestamp : item.startTime), "dd.MM.yyyy HH:mm", { locale: de })} Uhr
                  </h4>
                  
                  {/* Profil-Information mit erweiterten Details */}
                  <div className="text-xs text-muted-foreground mb-2">
                    <div className="flex items-center gap-1 mb-1">
                      {item.type === 'food' ? <Users className="h-3 w-3" /> : <UserIcon className="h-3 w-3" />}
                      <span className="font-semibold">Profile: {itemProfileNames}</span>
                    </div>
                    
                    {/* Erweiterte Profil-Details anzeigen */}
                    {relevantProfiles.map(profile => {
                      const details = formatProfileDetails(profile);
                      if (details.length > 0) {
                        return (
                          <div key={profile.id} className="ml-4 text-xs bg-gray-50 p-2 rounded mt-1">
                            <div className="flex items-center gap-1 mb-1">
                              <Heart className="h-3 w-3" />
                              <span className="font-medium">{profile.name}:</span>
                            </div>
                            <div className="ml-4 space-y-0.5">
                              {details.map((detail, idx) => (
                                <div key={idx} className="text-xs">{detail}</div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {item.type === 'food' ? (
                    <div className="text-sm mt-1">
                      <p><strong>Nahrungsmittel:</strong> {item.foodItems}</p>
                      {item.photo && (
                          <div className="mt-2 relative w-32 h-32 rounded overflow-hidden border border-input">
                              <Image src={item.photo} alt="Mahlzeit Foto" layout="fill" objectFit="cover" data-ai-hint="food meal"/>
                          </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm mt-1 space-y-0.5">
                      <p><strong>Beschreibung:</strong> {item.symptom}</p>
                      <p><strong>Kategorie:</strong> {item.category}</p>
                      <p><strong>Schweregrad:</strong> {item.severity}</p>
                      <p><strong>Dauer:</strong> {item.duration}</p>
                      <p className="text-xs text-muted-foreground">Protokolliert am: {format(parseISO(item.loggedAt), "dd.MM.yyyy HH:mm", { locale: de })} Uhr</p>
                      {linkedFoodDetails && (
                        <div className="mt-2 pt-1 border-t border-dashed">
                           <p className="text-xs flex items-center gap-1">
                            <LinkIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="font-semibold">Verkn. Mahlzeit:</span> 
                            <span className="text-muted-foreground">
                              {format(parseISO(linkedFoodDetails.timestamp), "dd.MM.yy HH:mm", { locale: de })} - {linkedFoodDetails.foodItems.substring(0,30)}{linkedFoodDetails.foodItems.length > 30 ? '...' : ''}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
      
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          html, body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          #report-preview-area, 
          #report-preview-area * {
            visibility: visible !important;
          }

          #report-preview-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 15mm !important; 
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-size: 10pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          #report-preview-area .report-item {
            border: 1px solid #ccc !important; 
            page-break-inside: avoid; 
          }
          
          #report-preview-area .text-primary,
          #report-preview-area .text-muted-foreground,
          #report-preview-area .font-headline,
          #report-preview-area .CardTitle, 
          #report-preview-area .CardDescription { 
             color: black !important;
             font-family: Arial, sans-serif !important; 
          }
          #report-preview-area .CardHeader, #report-preview-area .CardContent {
            background: white !important;
          }
          
          #report-preview-area h4 { 
            font-family: Arial, sans-serif !important;
            font-size: 12pt !important;
            font-weight: bold !important;
            color: black !important;
          }
           #report-preview-area p, #report-preview-area div, #report-preview-area strong {
             font-family: Arial, sans-serif !important;
             color: black !important;
           }

          #report-preview-area img {
            max-width: 100px !important; 
            max-height: 100px !important;
            height: auto !important;
            width: auto !important;
            object-fit: contain !important;
            display: block !important;
            margin-top: 8px !important;
            margin-bottom: 8px !important;
            border: 1px solid #eee !important; 
          }
          
          .no-print {
            display: none !important;
          }

          @page {
            size: A4 portrait; 
            margin: 0; 
          }
        }
        .report-preview h4 { font-family: 'Belleza', sans-serif; } 
        .report-preview p, .report-preview div { font-family: 'Alegreya', serif; } 
      `}</style>
    </div>
  );
}
