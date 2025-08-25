import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LifeBuoy, Info } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Hilfe & Informationen"
        description="Antworten auf häufige Fragen und Tipps zur Nutzung von AllergyCare."
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <LifeBuoy className="h-6 w-6" />
            Häufig gestellte Fragen (FAQ)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wie dokumentiere ich eine Mahlzeit?</AccordionTrigger>
              <AccordionContent>
                Navigieren Sie zur Seite &quot;Essen Doku&quot; über das Menü. Geben Sie die konsumierten Nahrungsmittel in das Textfeld ein. Optional können Sie ein Foto Ihrer Mahlzeit hinzufügen. Klicken Sie anschließend auf &quot;Mahlzeit speichern&quot;.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Wie erfasse ich ein Symptom?</AccordionTrigger>
              <AccordionContent>
                Wählen Sie im Menü den Punkt &quot;Symptom Doku&quot;. Beschreiben Sie das Symptom, wählen Sie eine Kategorie und einen Schweregrad. Geben Sie den Beginn (Datum und Uhrzeit) sowie die Dauer des Symptoms an. Speichern Sie den Eintrag über den Button &quot;Symptom speichern&quot;.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Wo werden meine Daten gespeichert?</AccordionTrigger>
              <AccordionContent>
                Alle Ihre Daten werden ausschließlich lokal auf Ihrem Gerät im Browser-Speicher gesichert. Es findet keine Übertragung an externe Server statt. Sie haben die volle Kontrolle über Ihre Informationen. Beachten Sie, dass beim Löschen Ihrer Browserdaten auch die App-Daten verloren gehen können, wenn Sie kein Backup erstellt haben (z.B. per CSV-Export).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Was macht die KI-Analyse?</AccordionTrigger>
              <AccordionContent>
                Die KI-Analyse auf der &quot;Zeitstrahl & Analyse&quot;-Seite versucht, Muster zwischen Ihren protokollierten Mahlzeiten und Symptomen zu erkennen. Sie schlägt mögliche Lebensmittel vor, die Auslöser für Ihre Symptome sein könnten. Diese Funktion dient nur zur Unterstützung und ersetzt keine ärztliche Beratung.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-5">
              <AccordionTrigger>Wie erstelle ich einen Bericht?</AccordionTrigger>
              <AccordionContent>
                Auf der Seite &quot;Berichte&quot; können Sie Ihre dokumentierten Daten filtern (z.B. nach Zeitraum oder Suchbegriffen) und anschließend als PDF drucken oder als CSV-Datei exportieren. Dies ist nützlich für Arztbesuche oder persönliche Auswertungen.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-primary flex items-center gap-2">
            <Info className="h-6 w-6" />
            Allgemeine Tipps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-foreground">
          <p><strong>Regelmäßige Dokumentation:</strong> Je konsequenter Sie Mahlzeiten und Symptome erfassen, desto genauer können Muster erkannt werden.</p>
          <p><strong>Detaillierte Beschreibungen:</strong> Versuchen Sie, Symptome und auch die Zusammensetzung von Mahlzeiten möglichst genau zu beschreiben.</p>
          <p><strong>Zeitnahe Erfassung:</strong> Protokollieren Sie Ereignisse möglichst bald nachdem sie aufgetreten sind, um Details nicht zu vergessen.</p>
          <p><strong>Datensicherung:</strong> Nutzen Sie regelmäßig die Exportfunktion, um Ihre Daten zu sichern, da diese lokal gespeichert werden.</p>
          <p><strong>Ärztliche Konsultation:</strong> AllergyCare ist ein Hilfsmittel. Bei gesundheitlichen Beschwerden oder Fragen zu Allergien und Unverträglichkeiten konsultieren Sie bitte immer einen Arzt oder qualifizierten medizinischen Fachpersonal.</p>
        </CardContent>
      </Card>
    </div>
  );
}
