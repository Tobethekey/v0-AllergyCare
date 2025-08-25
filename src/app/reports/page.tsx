import PageHeader from '@/components/PageHeader';
import { ReportGenerator } from '@/components/reports/ReportGenerator';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Berichte erstellen & exportieren"
        description="Generieren Sie Übersichten Ihrer dokumentierten Daten für Arztbesuche oder persönliche Analysen."
      />
      <ReportGenerator />
    </div>
  );
}
