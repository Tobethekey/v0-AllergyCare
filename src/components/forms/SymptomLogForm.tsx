"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { addSymptomLog } from "@/lib/local-storage";

const formSchema = z.object({
  startDate: z.string().min(1, "Beginn ist erforderlich"),
  description: z.string().min(1, "Beschreibung ist erforderlich"),
  category: z.string().min(1, "Kategorie ist erforderlich"),
  severity: z.number().min(1).max(10),
  duration: z.number().min(0, "Dauer darf nicht negativ sein"),
});

export function SymptomLogForm() {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: new Date().toISOString().substring(0, 16),
      description: "",
      category: "Haut",
      severity: 5,
      duration: 60,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newLog = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
    };

    addSymptomLog(newLog);

    toast({
      title: "Gespeichert",
      description: "Symptom wurde erfolgreich hinzugefügt.",
    });

    // WICHTIG: Seite neu laden für Datenkonsistenz
    setTimeout(() => {
        window.location.reload();
    }, 500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... (der Rest des Formulars bleibt unverändert) ... */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beginn</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Beschreibung</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Juckreiz am Arm" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kategorie</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wähle eine Kategorie" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Haut">Haut</SelectItem>
                  <SelectItem value="Magen-Darm">Magen-Darm</SelectItem>
                  <SelectItem value="Atemwege">Atemwege</SelectItem>
                  <SelectItem value="Allgemein">Allgemein</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Schweregrad: {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  defaultValue={[field.value]}
                  onValueChange={(value) => field.onChange(value[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dauer (in Minuten)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Symptom speichern</Button>
      </form>
    </Form>
  );
}
