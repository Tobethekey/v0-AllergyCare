'use client';

import PageHeader from '@/components/PageHeader';
import { FoodLogForm } from '@/components/forms/FoodLogForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function FoodLogPage() {
  const handleFormSubmitted = () => {
    // This function is called when the FoodLogForm is successfully submitted.
    // In the context of FoodLogPage, the form already resets itself and shows a toast.
    // If there were a list of entries on this page, we might refresh it here.
    // For now, a console log or no-op is sufficient.
    // console.log('FoodLogForm submitted and handled by FoodLogPage.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nahrungsmittel dokumentieren"
        description="Erfassen Sie hier Ihre Mahlzeiten und Getränke."
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary">Neue Mahlzeit hinzufügen</CardTitle>
        </CardHeader>
        <CardContent>
          <FoodLogForm onFormSubmit={handleFormSubmitted} />
        </CardContent>
      </Card>
    </div>
  );
}
