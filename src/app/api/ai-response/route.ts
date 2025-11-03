import { NextRequest, NextResponse } from 'next/server';
import { WebhookOutput } from '@/app/api/test-webhook/route';
import { extractEntities } from '@/lib/backend/entity-extraction';

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming WebhookOutput
    const webhookOutput: WebhookOutput = await request.json();

    // Extract entities using the reusable function
    const result = await extractEntities(webhookOutput);

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

    // Extract entities using the reusable function
    const result = await extractEntities(sampleWebhookOutput);

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

