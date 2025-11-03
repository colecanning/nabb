interface SendInstagramMessageParams {
  recipient_id: string;
  message: string;
  reply_to?: string;
}

interface InstagramApiResponse {
  recipient_id?: string;
  message_id?: string;
  error?: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface SendMessageResult {
  success: boolean;
  data?: InstagramApiResponse;
  error?: string;
  errorDetails?: any;
  statusCode: number;
}

/**
 * Sends an Instagram direct message via the Instagram Graph API
 * @param params - The message parameters (recipient_id, message, optional reply_to)
 * @returns Result object with success status and data/error information
 */
export async function sendInstagramMessage(
  params: SendInstagramMessageParams
): Promise<SendMessageResult> {
  const { recipient_id, message, reply_to } = params;

  // Validate required fields
  if (!recipient_id || !message) {
    return {
      success: false,
      error: 'Missing required fields: recipient_id and message',
      statusCode: 400,
    };
  }

  // Validate environment variables
  const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
  const igUserId = process.env.IG_USER_ID;

  if (!pageAccessToken || !igUserId) {
    return {
      success: false,
      error: 'Missing required environment variables: PAGE_ACCESS_TOKEN or IG_USER_ID',
      statusCode: 500,
    };
  }

  try {
    // Call Instagram Graph API
    const apiUrl = `https://graph.facebook.com/v24.0/${igUserId}/messages`;
    
    // Build the request payload
    const payload: any = {
      recipient: {
        id: recipient_id,
      },
      message: {
        text: message,
      },
      access_token: pageAccessToken,
    };

    // Add reply_to if provided (must be an object with message_id field)
    if (reply_to) {
      payload.reply_to = {
        mid: reply_to
      };
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: InstagramApiResponse = await response.json();

    // Check if the API returned an error
    if (!response.ok || data.error) {
      const errorMessage = data.error?.message || 'Unknown error';
      const errorCode = data.error?.code;
      
      // Provide helpful error message for common issues
      let helpfulMessage = errorMessage;
      if (errorCode === 190) {
        helpfulMessage = 'Invalid or expired access token. Please generate a new Page Access Token with the required permissions.';
      } else if (errorCode === 100) {
        helpfulMessage = 'Your Facebook Page is not linked to an Instagram Business/Creator account. Please convert your Instagram to a Business account and link it to your Facebook Page.';
      } else if (errorCode === 10) {
        helpfulMessage = 'Message sent outside allowed window. This can happen if: 1) The recipient ID is incorrect (use the Instagram-scoped ID from conversations, not their username or profile ID), 2) The user has never messaged your business, or 3) More than 24 hours have passed since their last message. Check the "Received Messages" section to find the correct recipient ID from active conversations.';
      } else if (errorMessage.includes('Page Access Token')) {
        helpfulMessage = 'You must use a Page Access Token, not a User Access Token.';
      } else if (errorMessage.includes('allowed window')) {
        helpfulMessage = 'You can only message users who have messaged your business within the last 24 hours. Make sure you are using the correct Instagram-scoped ID from your conversations list, not their username or public profile ID.';
      }
      
      return {
        success: false,
        error: helpfulMessage,
        errorDetails: data.error || data,
        statusCode: response.status || 500,
      };
    }

    // Return successful response
    return {
      success: true,
      data,
      statusCode: 200,
    };
  } catch (error) {
    console.error('Error sending Instagram message:', error);
    
    return {
      success: false,
      error: 'Internal server error',
      errorDetails: error instanceof Error ? error.message : 'Unknown error',
      statusCode: 500,
    };
  }
}

