import { NextRequest, NextResponse } from 'next/server';
import { sendInstagramMessage } from '@/lib/backend/instagram-messaging';

interface SendMessageRequest {
  recipient_id: string;
  message: string;
  reply_to?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SendMessageRequest = await request.json();
    const { recipient_id, message, reply_to } = body;

    // Call the reusable sendInstagramMessage function
    const result = await sendInstagramMessage({
      recipient_id,
      message,
      reply_to,
    });

    // Return response based on result
    if (result.success) {
      return NextResponse.json(
        {
          success: true,
          data: result.data,
        },
        { status: result.statusCode }
      );
    } else {
      return NextResponse.json(
        {
          error: result.error,
          details: result.errorDetails,
        },
        { status: result.statusCode }
      );
    }
  } catch (error) {
    console.error('Error in send-message route:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

