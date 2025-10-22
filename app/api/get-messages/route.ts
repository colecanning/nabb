import { NextResponse } from 'next/server';

interface Conversation {
  id: string;
  updated_time: string;
  participants?: {
    data: Array<{
      id: string;
      username?: string;
      name?: string;
    }>;
  };
}

interface Share {
  id: string;
  link?: string;
}

interface Attachment {
  id: string;
  image_data?: {
    url: string;
    preview_url?: string;
    width?: number;
    height?: number;
  };
  video_data?: {
    url: string;
    preview_url?: string;
    width?: number;
    height?: number;
  };
  mime_type?: string;
  name?: string;
  size?: number;
}

interface Message {
  id: string;
  created_time: string;
  from: {
    id: string;
    username?: string;
    name?: string;
  };
  to: {
    data: Array<{
      id: string;
      username?: string;
      name?: string;
    }>;
  };
  message?: string;
  shares?: {
    data: Share[];
  };
  attachments?: {
    data: Attachment[];
  };
}

interface ConversationWithMessages extends Conversation {
  messages?: {
    data: Message[];
  };
  recipient_id?: string;
}

export async function GET() {
  try {
    // Validate environment variables
    const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
    const igUserId = process.env.IG_USER_ID;

    if (!pageAccessToken || !igUserId) {
      return NextResponse.json(
        { error: 'Missing required environment variables: PAGE_ACCESS_TOKEN or IG_USER_ID' },
        { status: 500 }
      );
    }

    // Get conversations with pagination
    const allConversations: Conversation[] = [];
    let conversationsUrl = `https://graph.facebook.com/v21.0/${igUserId}/conversations?platform=instagram&limit=100&access_token=${pageAccessToken}`;
    
    console.log('Fetching conversations from:', conversationsUrl);
    
    // Fetch all pages of conversations
    while (conversationsUrl) {
      const conversationsResponse = await fetch(conversationsUrl);
      const conversationsData = await conversationsResponse.json();

      if (!conversationsResponse.ok || conversationsData.error) {
        const errorMessage = conversationsData.error?.message || 'Unknown error';
        const errorCode = conversationsData.error?.code;
        
        // Provide helpful error message for common issues
        let helpfulMessage = errorMessage;
        if (errorCode === 190) {
          helpfulMessage = 'Invalid or expired access token. Please generate a new Page Access Token (not User Access Token) with the required permissions: pages_messaging, instagram_manage_messages, pages_read_engagement.';
        } else if (errorCode === 100) {
          helpfulMessage = 'Your Facebook Page is not linked to an Instagram Business/Creator account. Please: 1) Convert your Instagram to a Business or Creator account in Instagram settings, 2) Link it to your Facebook Page, 3) Make sure IG_USER_ID is your Instagram Business Account ID (not your personal Instagram ID).';
        } else if (errorMessage.includes('Page Access Token')) {
          helpfulMessage = 'You must use a Page Access Token, not a User Access Token. Follow the instructions in the README to get the correct token from /me/accounts.';
        } else if (errorMessage.includes('not linked') || errorMessage.includes('professional account')) {
          helpfulMessage = 'Instagram account must be a Business or Creator account linked to your Facebook Page. Check your Instagram account settings and Facebook Page settings to link them.';
        }
        
        return NextResponse.json(
          {
            error: helpfulMessage,
            details: conversationsData.error || conversationsData,
          },
          { status: conversationsResponse.status || 500 }
        );
      }

      // Add conversations from this page
      if (conversationsData.data && conversationsData.data.length > 0) {
        allConversations.push(...conversationsData.data);
        console.log(`Fetched ${conversationsData.data.length} conversations. Total so far: ${allConversations.length}`);
      }

      // Check if there's a next page
      conversationsUrl = conversationsData.paging?.next || '';
    }

    console.log(`Total conversations fetched: ${allConversations.length}`);

    // Get messages for each conversation
    const conversations: Conversation[] = allConversations;
    const conversationsWithMessages: ConversationWithMessages[] = await Promise.all(
      conversations.map(async (conversation: Conversation) => {
        try {
          // Fetch all messages with pagination
          const allMessages: Message[] = [];
          let messagesUrl = `https://graph.facebook.com/v21.0/${conversation.id}?fields=id,updated_time,participants,messages.limit(100){id,created_time,from,to,message,shares,attachments}&access_token=${pageAccessToken}`;
          
          while (messagesUrl) {
            const messagesResponse = await fetch(messagesUrl);
            const messagesData = await messagesResponse.json();

            if (messagesResponse.ok && !messagesData.error) {
              // Collect messages from this page
              if (messagesData.messages?.data && messagesData.messages.data.length > 0) {
                allMessages.push(...messagesData.messages.data);
              }

              // Check if there's a next page of messages
              messagesUrl = messagesData.messages?.paging?.next || '';
              
              // If this is the last page, process the conversation data
              if (!messagesUrl) {
                // Add the recipient_id by finding the user ID from messages
                // Check messages to find the ID that is NOT the business account
                if (allMessages.length > 0) {
                  const firstMessage = allMessages[0];
                  
                  // If the message is FROM the user (to the business), use from.id
                  if (firstMessage.from?.id !== igUserId) {
                    messagesData.recipient_id = firstMessage.from.id;
                  } 
                  // If the message is FROM the business (to the user), use to.data[0].id
                  else if (firstMessage.to?.data && firstMessage.to.data.length > 0) {
                    const recipientInTo = firstMessage.to.data.find((p: any) => p.id !== igUserId);
                    messagesData.recipient_id = recipientInTo?.id;
                  }
                }
                
                // Replace the messages data with all collected messages
                messagesData.messages = {
                  data: allMessages
                };
                
                return messagesData;
              }
            } else {
              // Error fetching messages, break the loop
              break;
            }
          }
          
          return conversation;
        } catch (error) {
          console.error('Error fetching messages for conversation:', conversation.id, error);
          return conversation;
        }
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: conversationsWithMessages,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching Instagram messages:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

