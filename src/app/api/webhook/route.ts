import { NextRequest, NextResponse } from 'next/server';
import { sendInstagramMessage } from '@/lib/backend/instagram-messaging';
import { processWebhook, WebhookData } from '@/app/api/test-webhook/route';

/**
 * Webhook endpoint for Instagram API
 * 
 * GET: Handles webhook verification from Instagram
 * POST: Receives webhook notifications for new messages
 */

// Type definitions for Instagram webhook payloads

interface InstagramWebhookSender {
  id: string;
}

interface InstagramWebhookRecipient {
  id: string;
}

interface InstagramReelPayload {
  reel_video_id: string;
  title?: string;
  url: string;
}

interface InstagramAttachment {
  type: 'ig_reel' | 'image' | 'video' | 'audio' | 'file';
  payload: InstagramReelPayload | {
    url: string;
    [key: string]: any;
  };
}

interface InstagramMessage {
  mid: string;
  text?: string;
  attachments?: InstagramAttachment[];
}

interface InstagramMessagingItem {
  sender: InstagramWebhookSender;
  recipient: InstagramWebhookRecipient;
  timestamp: number;
  message?: InstagramMessage;
}

interface InstagramChangeValue {
  sender?: InstagramWebhookSender;
  recipient?: InstagramWebhookRecipient;
  timestamp?: number;
  message?: InstagramMessage;
}

interface InstagramChange {
  field: string;
  value: InstagramChangeValue;
}

interface InstagramWebhookEntry {
  time: number;
  id: string;
  messaging?: InstagramMessagingItem[];
  changes?: InstagramChange[];
}

interface InstagramWebhookPayload {
  object: string;
  entry: InstagramWebhookEntry[];
}

type WebhookPayload = InstagramWebhookPayload;

/**
 * Handles sending an automated Instagram reply when a reel is received and processes the webhook
 * @param senderId - The Instagram user ID to send the message to
 * @param webhookData - The webhook data containing title and videoUrl
 * @param replyToMessageId - Optional message ID to reply to (for threading)
 */
async function handleReelAutoReply(
  senderId: string, 
  webhookData: WebhookData,
  replyToMessageId?: string
) {
  try {
    const result = await sendInstagramMessage({
      recipient_id: senderId,
      message: "Thinking...",
      reply_to: replyToMessageId,
    });

    if (!result.success) {
      console.error('Failed to send reply:', result.error, result.errorDetails);
      return;
    }
    
    console.log('Successfully sent reply to', senderId);

    // Process the webhook after sending the message
    console.log('Processing webhook with data:', webhookData);
    const output = await processWebhook(webhookData, senderId);
    console.log('Webhook processed successfully:', output.saveId);
    
    // Send completion message with link to results
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
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
    }
  } catch (error) {
    console.error('Error in handleReelAutoReply:', error);
  }
}

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
    const body: WebhookPayload = await request.json();

    console.log('Received webhook:', JSON.stringify(body, null, 2));
    console.log("--- 0")

    // Check if this is an Instagram webhook
    if (body.object === 'instagram') {
      console.log("--- 1")
      // Iterate over each entry (there may be multiple if batched)
      for (const entry of body.entry || []) {
        console.log("--- 2")

        const instagramBusinessAccountId = entry.id;
        const time = entry.time;

        // Handle messaging array (direct message format)
        const messaging = entry.messaging || [];
        for (const messagingItem of messaging) {
          console.log("--- 3")
          const senderId = messagingItem.sender.id;
          const recipientId = messagingItem.recipient.id;
          const timestamp = messagingItem.timestamp;

          if (messagingItem.message) {
            console.log("--- 4")
            const messageId = messagingItem.message.mid;
            const messageText = messagingItem.message.text;
            const attachments = messagingItem.message.attachments;

            console.log(`New Instagram message from ${senderId}:`, {
              messageId,
              messageText,
              attachments: attachments?.length || 0,
              timestamp,
              recipientId,
            });

            // Check if message contains an ig_reel attachment
            const reelAttachment = attachments?.find(
              (attachment) => attachment.type === 'ig_reel'
            );

            if (reelAttachment && reelAttachment.payload) {
              console.log("--- 5")
              console.log("--- 6", senderId)
              
              // Extract reel data
              const webhookData: WebhookData = {
                title: 'title' in reelAttachment.payload ? reelAttachment.payload.title || null : null,
                videoUrl: reelAttachment.payload.url || null,
              };
              
              // Send "Thinking..." message as auto-reply and process webhook
              await handleReelAutoReply(senderId, webhookData);
            }

            // TODO: Add your custom logic here to handle incoming messages
            // Examples:
            // - Store the message in a database
            // - Trigger an automated response
            // - Send a notification
            // - Process the message with AI/NLP
          }
        }

        // Handle changes array (alternative format used by some webhook types)
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

              // Check if message contains an ig_reel attachment
              const reelAttachment = attachments?.find(
                (attachment) => attachment.type === 'ig_reel'
              );

              if (reelAttachment && reelAttachment.payload && senderId) {
                // Extract reel data
                const webhookData: WebhookData = {
                  title: 'title' in reelAttachment.payload ? reelAttachment.payload.title || null : null,
                  videoUrl: reelAttachment.payload.url || null,
                };
                
                // Send "Thinking..." message as auto-reply and process webhook
                await handleReelAutoReply(senderId, webhookData, messageId);
              }

              // TODO: Add your custom logic here to handle incoming messages
              // Examples:
              // - Store the message in a database
              // - Trigger an automated response
              // - Send a notification
              // - Process the message with AI/NLP
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