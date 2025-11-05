import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { WebhookOutput } from '@/app/api/test-webhook/route';

export interface LLMInput {
    author: string | null;
    title: string | null;
    videoDuration?: number | null;
    videoTranscription?: string;
}

export interface Entity {
  name: string;
  type: 'restaurant' | 'product' | 'place' | 'service' | 'other';
  description: string;
  reason: string;
  urls?: string[];
}

export interface EntityExtractionResult {
  success: boolean;
  entities?: Array<Entity>;
  prompt?: string;
  response?: string;
  llmInput?: LLMInput;
  error?: string;
}

/**
 * Convert WebhookOutput to LLMInput
 * @param webhookOutput - The webhook output containing video and match data
 * @returns LLMInput for entity extraction
 */
export function convertWebhookOutputToLLMInput(webhookOutput: WebhookOutput): LLMInput {
  return {
    author: webhookOutput.result?.bestMatch?.author || null,
    title: webhookOutput.result?.title || null,
    videoDuration: webhookOutput.result?.videoDuration || null,
    videoTranscription: webhookOutput.result?.videoTranscription || undefined,
  };
}

/**
 * Extract entities from LLM input using AI
 * @param llmInput - The LLM input containing author, title, duration, and transcription
 * @param promptTemplate - Optional prompt template string. If not provided, reads from v2.md file
 * @returns Entity extraction result with entities, prompt, and metadata
 */
export async function extractEntities(llmInput: LLMInput, promptTemplate?: string): Promise<EntityExtractionResult> {
  try {

    // Read the prompt template if not provided
    let template = promptTemplate;
    if (!template) {
      const promptTemplatePath = join(process.cwd(), 'src', 'lib', 'prompt', 'v2.md');
      template = await readFile(promptTemplatePath, 'utf-8');
    }

    // Replace JSON_INPUT with the actual data
    const prompt = template.replace('JSON_INPUT', JSON.stringify(llmInput, null, 2));

    // Call OpenAI using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-5'),
      prompt: prompt,
    });

    // Try to parse the response as JSON to extract entities
    let entities;
    try {
      const parsed = JSON.parse(text);
      entities = parsed.entities;
    } catch (e) {
      // If parsing fails, return the raw response
      console.warn('Failed to parse AI response as JSON:', e);
    }

    return {
      success: true,
      entities,
      prompt,
      response: text,
      llmInput,
    };

  } catch (error) {
    console.error('Entity extraction error:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract entities',
    };
  }
}

