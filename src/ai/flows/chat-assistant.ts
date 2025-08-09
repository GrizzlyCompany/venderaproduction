'use server';

/**
 * @fileOverview A chat assistant that helps users connect with sellers.
 *
 * - chatAssistant - A function that generates a response from the seller.
 * - ChatAssistantInput - The input type for the chatAssistant function.
 * - ChatAssistantOutput - The return type for the chatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatAssistantInputSchema = z.object({
  buyerName: z.string().describe("The name of the potential buyer."),
  sellerName: z.string().describe("The name of the seller."),
  propertyName: z.string().describe("The name or title of the property being discussed."),
  messageHistory: z.string().describe("The history of the conversation so far, formatted as a dialogue."),
  locale: z.enum(['en', 'es']).optional().describe("The locale for the response language."),
});
export type ChatAssistantInput = z.infer<typeof ChatAssistantInputSchema>;

const ChatAssistantOutputSchema = z.object({
  response: z.string().describe('The generated response from the seller.'),
});
export type ChatAssistantOutput = z.infer<typeof ChatAssistantOutputSchema>;

export async function chatAssistant(
  input: ChatAssistantInput
): Promise<ChatAssistantOutput> {
  return chatAssistantFlow(input);
}

const spanishPrompt = `Eres un vendedor de bienes raíces llamado {{{sellerName}}}. Eres profesional, amable y estás dispuesto a ayudar.

Un posible comprador llamado {{{buyerName}}} está interesado en tu propiedad: "{{{propertyName}}}".

Aquí está el historial de la conversación:
{{{messageHistory}}}

Basado en el historial, genera una respuesta útil y alentadora al último mensaje del comprador. Mantén tu respuesta concisa, amigable y enfocada en responder su pregunta o programar una visita.
Tu respuesta solo debe ser desde la perspectiva de {{{sellerName}}}. No agregues ningún prefijo como "Vendedor:" o "{{{sellerName}}}:".`;

const englishPrompt = `You are a real estate seller named {{{sellerName}}}. You are professional, friendly, and eager to help.

A potential buyer named {{{buyerName}}} is interested in your property: "{{{propertyName}}}".

Here is the conversation history:
{{{messageHistory}}}

Based on the history, generate a helpful and encouraging response to the buyer's last message. Keep your response concise, friendly, and focused on answering their question or scheduling a viewing.
Your response should only be from the perspective of {{{sellerName}}}. Do not add any prefixes like "Seller:" or "{{{sellerName}}}:".`;

const prompt = ai.definePrompt({
  name: 'chatAssistantPrompt',
  input: {schema: ChatAssistantInputSchema},
  output: {schema: ChatAssistantOutputSchema},
  prompt: `{{#if (eq locale "es")}}
${spanishPrompt}
{{else}}
${englishPrompt}
{{/if}}
`,
});

const chatAssistantFlow = ai.defineFlow(
  {
    name: 'chatAssistantFlow',
    inputSchema: ChatAssistantInputSchema,
    outputSchema: ChatAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
