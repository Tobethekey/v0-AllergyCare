'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { addUserProfile, updateUserProfile } from '@/lib/data-service';
import type { UserProfile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const userProfileFormSchema = z.object({
  name: z.string().min(1, { message: 'Bitte geben Sie einen Namen ein.' }),
});

type UserProfileFormValues = z.infer<typeof userProfileFormSchema>;

interface NewUserProfileFormProps {
  profileToEdit?: UserProfile | null;
  onFormSubmit: () => void;
}

export function NewUserProfileForm({ profileToEdit, onFormSubmit }: NewUserProfileFormProps) {
  const { toast } = useToast();
  const form = useForm<UserProfileFormValues>({
    resolver: zodResolver(userProfileFormSchema),
    defaultValues: {
      name: profileToEdit?.name || '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    form.reset({ name: profileToEdit?.name || '' });
  }, [profileToEdit, form]);

  function onSubmit(data: UserProfileFormValues) {
    if (profileToEdit) {
      updateUserProfile(profileToEdit.id, data.name);
      toast({
        title: 'Profil aktualisiert',
        description: `Das Profil "${data.name}" wurde erfolgreich geändert.`,
      });
    } else {
      addUserProfile(data.name);
      toast({
        title: 'Profil erstellt',
        description: `Das Profil "${data.name}" wurde erfolgreich angelegt.`,
      });
    }
    onFormSubmit();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name des Profils</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Max Mustermann, Kind Anna" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Save className="mr-2 h-4 w-4" /> {profileToEdit ? 'Änderungen speichern' : 'Profil speichern'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
