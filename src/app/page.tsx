import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Utensils, HeartPulse, FileText, Users, Clock, Shield } from "lucide-react"
import PageHeader from "@/components/PageHeader"
import { QuickStats } from "@/components/dashboard/QuickStats"
import { RecentActivity } from "@/components/dashboard/RecentActivity"
import { GlobalSearch } from "@/components/search/GlobalSearch"
import { NotificationCenter } from "@/components/notifications/NotificationCenter"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-8 border-b">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16">
            <svg
              width="64"
              height="64"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              <path
                d="M16 2L24 6V14C24 20.5 20.5 26 16 28C11.5 26 8 20.5 8 14V6L16 2Z"
                fill="#10B981"
                stroke="#059669"
                strokeWidth="1"
              />
              <path
                d="M16 8C13.5 8 11.5 10 11.5 12.5C11.5 15 13.5 17 16 17C18.5 17 20.5 15 20.5 12.5C20.5 10 18.5 8 16 8Z"
                fill="#FFFFFF"
              />
              <path d="M15 20H17V22H15V20ZM15 18H17V20H15V18Z" fill="#FFFFFF" />
              <path d="M14 19H18V21H14V19Z" fill="#FFFFFF" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold font-display text-primary mb-2">AllergyCare</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Dokumentiere Mahlzeiten und Symptome - einfach und sicher auf deinem Gerät.
        </p>
      </div>

      <PageHeader title="Dashboard" description="Deine Allergie-Übersicht auf einen Blick">
        <div className="flex items-center gap-4">
          <GlobalSearch />
          <NotificationCenter />
        </div>
      </PageHeader>

      <QuickStats />

      <div className="grid gap-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-headline text-xl text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Utensils className="h-8 w-8" />
                </div>
                Essen dokumentieren
              </CardTitle>
              <CardDescription className="text-base">
                Fotografiere oder notiere deine Mahlzeiten mit einem Klick.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/food-log" passHref>
                <Button className="w-full h-12 text-lg font-semibold" size="lg">
                  <Utensils className="mr-3 h-5 w-5" />
                  Mahlzeit hinzufügen
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 font-headline text-xl text-primary">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <HeartPulse className="h-8 w-8" />
                </div>
                Symptom erfassen
              </CardTitle>
              <CardDescription className="text-base">
                Notiere Beschwerden und deren Schweregrad schnell und einfach.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/symptom-log" passHref>
                <Button className="w-full h-12 text-lg font-semibold bg-transparent" size="lg" variant="outline">
                  <HeartPulse className="mr-3 h-5 w-5" />
                  Symptom hinzufügen
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-blue-50 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Zeitstrahl</h3>
                <p className="text-sm text-muted-foreground mb-3">Erkenne Muster und Zusammenhänge</p>
                <Link href="/timeline" passHref>
                  <Button variant="ghost" size="sm" className="w-full">
                    Ansehen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-green-50 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Berichte</h3>
                <p className="text-sm text-muted-foreground mb-3">Erstelle Arztberichte als PDF</p>
                <Link href="/reports" passHref>
                  <Button variant="ghost" size="sm" className="w-full">
                    Erstellen
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-purple-50 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">Verwalte Familienmitglieder</p>
                <Link href="/profiles" passHref>
                  <Button variant="ghost" size="sm" className="w-full">
                    Verwalten
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivity />
          </div>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="font-headline text-primary flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Datenschutz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Alle Daten bleiben auf deinem Gerät</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Keine Cloud-Übertragung</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Vollständige Kontrolle über deine Gesundheitsdaten</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
