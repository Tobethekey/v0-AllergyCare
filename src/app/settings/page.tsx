import PageHeader from "@/components/PageHeader"
import { DataBackup } from "@/components/data/DataBackup"
import { SubscriptionManagement } from "@/components/settings/SubscriptionManagement"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Einstellungen"
        description="Verwalten Sie Ihre App-Einstellungen, Abonnements und Datensicherung."
      />
      <SubscriptionManagement />
      <DataBackup />
    </div>
  )
}
