import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    // Hard-coded prompt
    const prompt = "Explain the concept of Test-Driven Development in 3 sentences.";

    // Call OpenAI using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    });

    return NextResponse.json({
      success: true,
      prompt: prompt,
      response: text,
    });

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

// Optional GET endpoint to test the route easily
export async function GET(request: NextRequest) {
  try {
    // Hard-coded prompt
    const prompt = "Explain the concept of Test-Driven Development in 3 sentences.";

    // Call OpenAI using Vercel AI SDK
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: prompt,
    });

    return NextResponse.json({
      success: true,
      prompt: prompt,
      response: text,
    });

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

