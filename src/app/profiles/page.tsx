import PageHeader from '@/components/PageHeader';
import { ProfileListPage } from '@/components/profiles/ProfileListPage'; // Corrected import path

export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile verwalten"
        description="Legen Sie hier Profile für Familienmitglieder oder verschiedene Personen an."
      />
      <ProfileListPage />
    </div>
  );
}
