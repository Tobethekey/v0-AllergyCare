'use client';

import PageHeader from '@/components/PageHeader';
import { SymptomLogForm } from '@/components/forms/SymptomLogForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SymptomLogPage() {
  const handleFormSubmitted = () => {
    // This function is called when the SymptomLogForm is successfully submitted.
    // The form already resets itself and shows a toast.
    // If there were a list of entries on this page, we might refresh it here.
    // For now, a console log or no-op is sufficient.
    // console.log('SymptomLogForm submitted and handled by SymptomLogPage.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Symptome erfassen"
        description="Dokumentieren Sie hier aufgetretene gesundheitliche Beschwerden."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Neues Symptom hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <SymptomLogForm onFormSubmit={handleFormSubmitted} />
        </CardContent>
      </Card>
    </div>
  );
}
