import { NextRequest, NextResponse } from 'next/server';
import { sendInstagramMessage } from '@/lib/backend/instagram-messaging';
import { processWebhook, WebhookData } from '@/app/api/test-webhook/route';

interface ProcessReelRequest {
  senderId: string;
  webhookData: WebhookData;
  replyToMessageId?: string;
}

/**
 * Endpoint for processing Instagram reels in the background
 * This runs in its own execution context separate from the webhook
 * Protected by internal API secret to prevent external access
 */
export async function POST(request: NextRequest) {
  try {
    // Verify internal API secret
    const authHeader = request.headers.get('x-internal-secret');
    const internalSecret = process.env.INTERNAL_API_SECRET;
    
    if (!internalSecret) {
      console.error('INTERNAL_API_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    if (authHeader !== internalSecret) {
      console.error('Unauthorized request to process-reel endpoint');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: ProcessReelRequest = await request.json();
    const { senderId, webhookData, replyToMessageId } = body;

    // Validate required fields
    if (!senderId || !webhookData) {
      return NextResponse.json(
        { error: 'Missing required fields: senderId and webhookData' },
        { status: 400 }
      );
    }

    console.log('Starting reel processing for sender:', senderId);

    // Send initial "Thinking..." message
    const initialResult = await sendInstagramMessage({
      recipient_id: senderId,
      message: "Thinking...",
      reply_to: replyToMessageId,
    });

    if (!initialResult.success) {
      console.error('Failed to send initial reply:', initialResult.error, initialResult.errorDetails);
      // Continue processing anyway
    } else {
      console.log('Successfully sent initial reply to', senderId);
    }

    // Process the webhook
    console.log('Processing webhook with data:', webhookData);
    const output = await processWebhook(webhookData, senderId);
    console.log('Webhook processed successfully:', output.saveId);
    
    // Send completion message with link to results
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    const savePageUrl = `${baseUrl}/saves/${output.saveId}`;
    
    const completionResult = await sendInstagramMessage({
      recipient_id: senderId,
      message: `Done! View your results here: ${savePageUrl}`,
      reply_to: replyToMessageId,
    });
    
    if (!completionResult.success) {
      console.error('Failed to send completion message:', completionResult.error);
    } else {
      console.log('Successfully sent completion message to', senderId);
    }

    return NextResponse.json({
      success: true,
      saveId: output.saveId,
    });

  } catch (error) {
    console.error('Error in process-reel endpoint:', error);
    
    // Try to send an error message to the user if we have the senderId
    try {
      const body = await request.json().catch(() => null);
      if (body?.senderId) {
        await sendInstagramMessage({
          recipient_id: body.senderId,
          message: 'Sorry, there was an error processing your reel. Please try again.',
          reply_to: body.replyToMessageId,
        });
      }
    } catch (msgError) {
      console.error('Failed to send error message:', msgError);
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

