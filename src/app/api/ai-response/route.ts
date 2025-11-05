import { NextRequest, NextResponse } from 'next/server';
import { WebhookOutput } from '@/app/api/test-webhook/route';
import { extractEntities, convertWebhookOutputToLLMInput } from '@/lib/backend/entity-extraction';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body
    const body = await request.json();
    
    // Extract customPrompt if provided
    const customPrompt = body.customPrompt;
    
    // Parse the WebhookOutput (removing customPrompt from it)
    const webhookOutput: WebhookOutput = body;
    delete (webhookOutput as any).customPrompt;

    // Convert to LLMInput
    const llmInput = convertWebhookOutputToLLMInput(webhookOutput);

    // Extract entities using the reusable function, passing custom prompt if available
    const result = await extractEntities(llmInput, customPrompt);

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate AI response'
      },
      { status: 500 }
    );
  }
}

// Optional GET endpoint to test the route easily with sample data
export async function GET(request: NextRequest) {
  try {
    // Sample WebhookOutput for testing
    const sampleWebhookOutput: WebhookOutput = {
      result: {
        title: "Amazing coffee review at Starbucks",
        videoUrl: "https://example.com/video.mp4",
        videoDuration: 30,
        videoTranscription: "This is the best pumpkin cream cold brew I've ever had at Starbucks!",
        bestMatch: {
          title: "Starbucks Pumpkin Cream Cold Brew Review",
          videoUrl: "https://instagram.com/reel/example",
          author: "@coffeelover123",
        }
      }
    };

    // Convert to LLMInput
    const llmInput = convertWebhookOutputToLLMInput(sampleWebhookOutput);

    // Extract entities using the reusable function
    const result = await extractEntities(llmInput);

    return NextResponse.json(result);

  } catch (error) {
    console.error('AI API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate AI response'
      },
      { status: 500 }
    );
  }
}

