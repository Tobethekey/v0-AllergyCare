'use server';

import { suggestPossibleTriggers } from '@/ai/flows/suggest-possible-triggers';
import type { SuggestPossibleTriggersInput, SuggestPossibleTriggersOutput } from '@/ai/flows/suggest-possible-triggers';

export async function analyzeTriggersAction(
  input: SuggestPossibleTriggersInput
): Promise<SuggestPossibleTriggersOutput> {
  try {
    const result = await suggestPossibleTriggers(input);
    return result;
  } catch (error) {
    console.error("Error in AI analysis:", error);
    // Return a structured error or rethrow, depending on how you want to handle it client-side
    return {
      possibleTriggers: [],
      reasoning: "Bei der Analyse ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut."
    };
  }
}
