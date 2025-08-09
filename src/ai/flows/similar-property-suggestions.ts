'use server';

/**
 * @fileOverview AI-powered similar property suggestion agent.
 *
 * - getSimilarPropertySuggestions - A function that provides suggestions for similar properties.
 * - SimilarPropertySuggestionsInput - The input type for the getSimilarPropertySuggestions function.
 * - SimilarPropertySuggestionsOutput - The return type for the getSimilarPropertySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimilarPropertySuggestionsInputSchema = z.object({
  propertyFeatures: z
    .string()
    .describe(
      'The features of the property, including price, location, type, and size.'
    ),
  userPreferences: z
    .string()
    .describe('The user preferences based on search criteria and viewed properties.'),
});
export type SimilarPropertySuggestionsInput = z.infer<
  typeof SimilarPropertySuggestionsInputSchema
>;

const SimilarPropertySuggestionsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('Suggestions for similar properties based on the provided criteria.'),
});
export type SimilarPropertySuggestionsOutput = z.infer<
  typeof SimilarPropertySuggestionsOutputSchema
>;

export async function getSimilarPropertySuggestions(
  input: SimilarPropertySuggestionsInput
): Promise<SimilarPropertySuggestionsOutput> {
  return similarPropertySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'similarPropertySuggestionsPrompt',
  input: {schema: SimilarPropertySuggestionsInputSchema},
  output: {schema: SimilarPropertySuggestionsOutputSchema},
  prompt: `Eres un agente inmobiliario experto especializado en recomendaciones de propiedades.

Utilizarás las características de la propiedad y las preferencias del usuario para proporcionar sugerencias de propiedades similares.

Características de la Propiedad: {{{propertyFeatures}}}
Preferencias del Usuario: {{{userPreferences}}}

Basado en la información anterior, sugiere propiedades similares.`,
});

const similarPropertySuggestionsFlow = ai.defineFlow(
  {
    name: 'similarPropertySuggestionsFlow',
    inputSchema: SimilarPropertySuggestionsInputSchema,
    outputSchema: SimilarPropertySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
