'use server';

/**
 * @fileOverview An AI agent that suggests possible food triggers based on logged food intake and symptoms.
 *
 * - suggestPossibleTriggers - A function that handles the suggestion of possible food triggers.
 * - SuggestPossibleTriggersInput - The input type for the suggestPossibleTriggers function.
 * - SuggestPossibleTriggersOutput - The return type for the suggestPossibleTriggers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestPossibleTriggersInputSchema = z.object({
  foodLog: z
    .string()
    .describe('A log of the user\u2019s food intake, including the date and time of consumption.'),
  symptomLog: z
    .string()
    .describe(
      'A log of the user\u2019s symptoms, including the date and time of occurrence, and severity.'
    ),
});
export type SuggestPossibleTriggersInput = z.infer<typeof SuggestPossibleTriggersInputSchema>;

const SuggestPossibleTriggersOutputSchema = z.object({
  possibleTriggers: z
    .array(z.string())
    .describe(
      'A list of possible food triggers based on recurring patterns between food intake and symptoms.'
    ),
  reasoning: z
    .string()
    .describe(
      'The AI\u2019s reasoning for suggesting the possible food triggers, explaining the patterns observed.'
    ),
});
export type SuggestPossibleTriggersOutput = z.infer<typeof SuggestPossibleTriggersOutputSchema>;

export async function suggestPossibleTriggers(
  input: SuggestPossibleTriggersInput
): Promise<SuggestPossibleTriggersOutput> {
  return suggestPossibleTriggersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestPossibleTriggersPrompt',
  input: {schema: SuggestPossibleTriggersInputSchema},
  output: {schema: SuggestPossibleTriggersOutputSchema},
  prompt: `You are an AI assistant designed to analyze a user's food and symptom logs to identify potential food triggers.

  Analyze the following food log and symptom log to identify recurring patterns between food intake and symptoms.
  Based on these patterns, suggest possible food triggers that may be causing the user's symptoms.

  Food Log:
  {{foodLog}}

  Symptom Log:
  {{symptomLog}}

  Provide a list of possible food triggers and explain your reasoning for suggesting them.
  Make sure to only return the food that the user has eaten, and not suggest any foods that are not present in the user's food log.

  Format your response as follows:
  Possible Triggers: [list of possible food triggers]
  Reasoning: [explanation of the patterns observed]
  `,
});

const suggestPossibleTriggersFlow = ai.defineFlow(
  {
    name: 'suggestPossibleTriggersFlow',
    inputSchema: SuggestPossibleTriggersInputSchema,
    outputSchema: SuggestPossibleTriggersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
