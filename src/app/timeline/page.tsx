import PageHeader from '@/components/PageHeader';
import { TimelineDisplay } from '@/components/timeline/TimelineDisplay';
import { AiAnalysis } from '@/components/timeline/AiAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TimelinePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Zeitstrahl & Analyse"
        description="Chronologische Übersicht Ihrer Mahlzeiten und Symptome, sowie KI-basierte Auslösererkennung."
      />
      
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="timeline">Zeitstrahl</TabsTrigger>
          <TabsTrigger value="analysis">KI-Analyse</TabsTrigger>
        </TabsList>
        <TabsContent value="timeline">
          <TimelineDisplay />
        </TabsContent>
        <TabsContent value="analysis">
          <AiAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
