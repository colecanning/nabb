import { NextRequest, NextResponse } from 'next/server';

/**
 * Webhook endpoint for Instagram API
 * 
 * GET: Handles webhook verification from Instagram
 * POST: Receives webhook notifications for new messages
 */

// GET handler for webhook verification
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    // Verify the token matches your verify token
    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN;

    if (!verifyToken) {
      console.error('WEBHOOK_VERIFY_TOKEN is not set in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check if a token and mode were sent
    if (mode && token) {
      // Check the mode and token sent are correct
      if (mode === 'subscribe' && token === verifyToken) {
        // Respond with 200 OK and challenge token from the request
        console.log('Webhook verified successfully');
        return new NextResponse(challenge, { status: 200 });
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        console.error('Webhook verification failed: token mismatch');
        return NextResponse.json(
          { error: 'Verification failed' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Missing verification parameters' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST handler for receiving webhook events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Received webhook:', JSON.stringify(body, null, 2));

    // Check if this is a page webhook
    if (body.object === 'page') {
      // Iterate over each entry (there may be multiple if batched)
      for (const entry of body.entry || []) {
        // Get the messaging events
        const messagingEvents = entry.messaging || [];

        for (const event of messagingEvents) {
          const senderId = event.sender?.id;
          const recipientId = event.recipient?.id;
          const timestamp = event.timestamp;

          // Check if the event contains a message
          if (event.message) {
            const messageId = event.message.mid;
            const messageText = event.message.text;
            const attachments = event.message.attachments;

            console.log(`New message from ${senderId}:`, {
              messageId,
              messageText,
              attachments: attachments?.length || 0,
              timestamp,
            });

            // TODO: Add your custom logic here to handle incoming messages
            // Examples:
            // - Store the message in a database
            // - Trigger an automated response
            // - Send a notification
            // - Process the message with AI/NLP
            
            // Example: You could call your send-message API to auto-reply
            // const autoReplyUrl = `${request.nextUrl.origin}/api/send-message`;
            // await fetch(autoReplyUrl, {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     recipient_id: senderId,
            //     message: 'Thanks for your message! We will get back to you soon.',
            //   }),
            // });
          }

          // Check if the event contains a read receipt
          if (event.read) {
            console.log(`Message read by ${senderId} at ${event.read.watermark}`);
          }

          // Check if the event contains a delivery confirmation
          if (event.delivery) {
            console.log(`Message delivered to ${senderId}:`, event.delivery.mids);
          }

          // Check if the event is a postback (button click)
          if (event.postback) {
            const payload = event.postback.payload;
            console.log(`Postback from ${senderId}:`, payload);
          }
        }
      }

      // Return a 200 OK response to acknowledge receipt of the event
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // If it's not a page webhook, log it and return 404
    console.log('Received non-page webhook:', body.object);
    return NextResponse.json(
      { error: 'Not a page webhook' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    // Always return 200 even on error to prevent Instagram from retrying
    // You can change this behavior based on your needs
    return NextResponse.json(
      { status: 'error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 200 }
    );
  }
}

