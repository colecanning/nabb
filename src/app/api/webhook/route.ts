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
    console.log('Webhook verification request received');
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

    // Check if this is an Instagram webhook
    if (body.object === 'instagram') {
      // Iterate over each entry (there may be multiple if batched)
      for (const entry of body.entry || []) {
        const instagramBusinessAccountId = entry.id;
        const time = entry.time;

        // Get the changes (Instagram uses 'changes' array, not 'messaging')
        const changes = entry.changes || [];

        for (const change of changes) {
          // Check if this is a messages field
          if (change.field === 'messages') {
            const value = change.value;
            const senderId = value.sender?.id;
            const recipientId = value.recipient?.id;
            const timestamp = value.timestamp;

            // Check if the change contains a message
            if (value.message) {
              const messageId = value.message.mid;
              const messageText = value.message.text;
              const attachments = value.message.attachments;

              console.log(`New Instagram message from ${senderId}:`, {
                messageId,
                messageText,
                attachments: attachments?.length || 0,
                timestamp,
                recipientId,
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
          }

          // Handle other field types if needed
          if (change.field === 'comments') {
            console.log('Received comment event:', change.value);
          }

          if (change.field === 'mentions') {
            console.log('Received mention event:', change.value);
          }
        }
      }

      // Return a 200 OK response to acknowledge receipt of the event
      return NextResponse.json({ status: 'ok' }, { status: 200 });
    }

    // If it's not an Instagram webhook, log it and return 404
    console.log('Received non-Instagram webhook:', body.object);
    return NextResponse.json(
      { error: 'Not an Instagram webhook' },
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

/*
Example Webhook
Received webhook: {
  "object": "instagram",
  "entry": [
    {
      "time": 1761172378459,
      "id": "17841477359317156",
      "messaging": [
        {
          "sender": {
            "id": "3113785858790603"
          },
          "recipient": {
            "id": "17841477359317156"
          },
          "timestamp": 1761172375330,
          "message": {
            "mid": "aWdfZAG1faXRlbToxOklHTWVzc2FnZAUlEOjE3ODQxNDc3MzU5MzE3MTU2OjM0MDI4MjM2Njg0MTcxMDMwMTI0NDI2MDAyODQ1MTA3MzEzMjg1NTozMjQ4Nzg5NjA3NzQwMTMzMDI3Nzc3MDY2NzYwMjQ3NzA1NgZDZD",
            "attachments": [
              {
                "type": "ig_reel",
                "payload": {
                  "reel_video_id": "17873858025351922",
                  "title": "You can not build a business without doubting something along the way. Moving past it is just a part of the process. #entrepreneur #doubts #startup #building",
                  "url": "https://lookaside.fbsbx.com/ig_messaging_cdn/?asset_id=17873858025351922&signature=AYd2HENtt2pTmKBPqpk1U8Ry4ruk-FysXleWRRwz-IL-d5emxHA1o671vDFWAIlVo2WjzLv3BnCVQ3FwNJdA0wjKuKTKSkpLvClj6LnnO354W-TWjUQ8VSv9Ox9AmR1y0JeLinMi41q0yjv4XkVSnmUN2DPh-92yKAHW1jb34BWCQV27iOv0yVDiqT2vHa8x-tEg9bfytOLGVUG_4pUmDASfq4c9k1u1"
                }
              }
            ]
          }
        }
      ]
    }
  ]
}


*/