# Instagram Message Sender

A Next.js application that enables sending messages to Instagram users on behalf of a business account using the Instagram Graph API.

## Features

- ✅ Send direct messages via Instagram Graph API
- ✅ View received Instagram messages and conversations
- ✅ Receive real-time webhook notifications for new messages
- ✅ Interactive web interface for sending messages
- ✅ Real-time message display with refresh capability
- ✅ Clean API endpoints with proper error handling
- ✅ TypeScript support for type safety
- ✅ Production-ready code structure

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or later) installed
2. **pnpm** (v8 or later) - Install with: `npm install -g pnpm`
3. **An Instagram Business or Creator Account** (NOT a personal account)
4. **A Facebook Page** linked to your Instagram Business account
5. **Facebook Developer Account** with an app configured for Instagram messaging

> ⚠️ **Important:** Your Instagram account MUST be converted to a Business or Creator account and linked to a Facebook Page. Personal Instagram accounts will NOT work. See [INSTAGRAM_SETUP.md](./INSTAGRAM_SETUP.md) for detailed setup instructions.

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
PAGE_ACCESS_TOKEN=your_page_access_token_here
IG_USER_ID=your_instagram_user_id_here
WEBHOOK_VERIFY_TOKEN=your_custom_verify_token_here
```

> **Note:** The `WEBHOOK_VERIFY_TOKEN` can be any string you choose. You'll need to use this same token when setting up the webhook in the Facebook Developer Console.

#### How to Get Your Credentials:

**PAGE_ACCESS_TOKEN:**
1. Go to [Facebook Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app
3. Select "Get User Access Token"
4. Add permissions: 
   - `pages_show_list` (required to see pages)
   - `pages_messaging` (required for messaging)
   - `pages_read_engagement` (required to read messages)
   - `instagram_basic` (basic Instagram access)
   - `instagram_manage_messages` (required to send and read messages)
5. Generate token and copy it
6. Exchange it for a long-lived token (recommended for production)

**IG_USER_ID:**
1. Use the Graph API Explorer to call: `GET /me/accounts`
2. Find your Facebook Page ID
3. Call: `GET /{page-id}?fields=instagram_business_account`
4. Copy the `instagram_business_account.id` value (this is your Instagram **Business** Account ID, not your personal Instagram ID)

> 📘 **Need Help?** See [INSTAGRAM_SETUP.md](./INSTAGRAM_SETUP.md) for detailed step-by-step instructions on converting your Instagram to a Business account and linking it to your Facebook Page.

### 3. Run the Development Server

```bash
pnpm dev
```

The server will start at [http://localhost:3000](http://localhost:3000)

## Usage

### Web Interface

Visit [http://localhost:3000](http://localhost:3000) to access the interactive web interface where you can:
- Send messages directly through a form
- View all received Instagram messages and conversations
- Auto-refresh messages every 10 seconds (or manually with the refresh button)
- See conversation history with each user
- Easily copy recipient IDs with one click
- See which conversations are within the 24-hour messaging window

### Sending a Message via API

Send a POST request to `/api/send-message` with the following JSON payload:

```json
{
  "recipient_id": "USER_INSTAGRAM_ID",
  "message": "Hello there!"
}
```

#### Using cURL:

```bash
# Send a new message
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "123456789",
    "message": "Hello from Instagram API!"
  }'

# Reply to a specific message
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "recipient_id": "123456789",
    "message": "This is a reply!",
    "reply_to": "mid.xxxxx"
  }'
```

#### Using Postman:

1. Create a new POST request
2. URL: `http://localhost:3000/api/send-message`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
   ```json
   {
     "recipient_id": "123456789",
     "message": "Hello from Instagram API!"
   }
   ```
5. Click Send

### Getting Messages via API

Fetch received messages programmatically:

```bash
curl -X GET http://localhost:3000/api/get-messages
```

This will return all recent conversations with their messages.

### Setting Up Webhooks for Real-Time Notifications

To receive real-time notifications when users send messages to your Instagram business account:

#### 1. Deploy Your Application

Your webhook endpoint needs to be publicly accessible. For local development, you can use tools like:
- [ngrok](https://ngrok.com/)
- [localtunnel](https://localtunnel.github.io/www/)
- [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

Example using ngrok:
```bash
# Start your dev server
pnpm dev

# In another terminal, expose it publicly
ngrok http 3000
```

Copy the HTTPS URL provided by ngrok (e.g., `https://abc123.ngrok.io`).

#### 2. Configure Webhook in Facebook Developer Console

1. Go to your [Facebook App Dashboard](https://developers.facebook.com/apps/)
2. Select your app
3. Navigate to **Webhooks** in the left sidebar (under Products)
4. Click **Add Subscription** for your Page
5. Enter your webhook URL: `https://your-domain.com/api/webhook`
6. Enter your **Verify Token** (must match your `WEBHOOK_VERIFY_TOKEN` from `.env.local`)
7. Subscribe to the following fields:
   - `messages` (to receive new messages)
   - `messaging_postbacks` (optional, for button interactions)
   - `message_deliveries` (optional, for delivery confirmations)
   - `message_reads` (optional, for read receipts)
8. Click **Verify and Save**

#### 3. Test Your Webhook

Once configured, your webhook endpoint will:
- Receive a POST request whenever someone sends a message to your Instagram business account
- Log the message details to your console
- Return a 200 OK response to acknowledge receipt

The webhook logs will show:
```
New message from [sender_id]: {
  messageId: 'mid.xxx',
  messageText: 'Hello!',
  attachments: 0,
  timestamp: 1234567890
}
```

#### 4. Customize Webhook Logic

Edit `/app/api/webhook/route.ts` to add your custom logic for handling incoming messages. Examples:
- Store messages in a database
- Send automated responses
- Trigger notifications to your team
- Process messages with AI/NLP
- Forward messages to other systems

### Response Format

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "recipient_id": "123456789",
    "message_id": "mid.xxx"
  }
}
```

**Error Response (400/500):**
```json
{
  "error": "Error description",
  "details": {
    "message": "Detailed error message",
    "type": "OAuthException",
    "code": 190
  }
}
```

## Important Notes

### Instagram Messaging Requirements

⚠️ **Important:** You can only send messages to users who have:
1. Initiated a conversation with your business account first, OR
2. Sent a message to your business within the last 24 hours

Otherwise, the API will return an error. This is an Instagram platform restriction.

### Rate Limits

Be aware of Instagram API rate limits. Monitor your usage to avoid hitting limits.

### Production Deployment

For production:
1. Use long-lived access tokens (60-day tokens)
2. Implement token refresh logic
3. Add proper logging and monitoring
4. Consider implementing a queue for message sending
5. Add authentication/authorization for your API endpoint

## API Endpoint Documentation

### POST `/api/send-message`

Sends a text message to an Instagram user.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `recipient_id` | string | Yes | Instagram User ID of the recipient |
| `message` | string | Yes | Text message to send |
| `reply_to` | string | No | Message ID to reply to (creates a threaded reply). The API will automatically format this as `{"message_id": "your_id"}` |

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "recipient_id": "123456789",
    "message_id": "mid.xxx"
  }
}
```

### GET `/api/get-messages`

Retrieves recent Instagram conversations and messages for your business account.

### POST/GET `/api/webhook`

Webhook endpoint for receiving real-time Instagram message notifications.

**GET (Webhook Verification):**
Instagram sends a GET request to verify your webhook during setup.

**Query Parameters:**
| Field | Type | Description |
|-------|------|-------------|
| `hub.mode` | string | Will be "subscribe" |
| `hub.verify_token` | string | Your verify token |
| `hub.challenge` | string | Challenge string to echo back |

**POST (Receiving Events):**
Instagram sends POST requests when new messages arrive.

**Request Body:**
```json
{
  "object": "instagram",
  "entry": [
    {
      "id": "instagram_business_account_id",
      "time": 1569262486134,
      "changes": [
        {
          "field": "messages",
          "value": {
            "sender": {
              "id": "sender_instagram_id"
            },
            "recipient": {
              "id": "your_instagram_business_id"
            },
            "timestamp": "1527459824",
            "message": {
              "mid": "message_id",
              "text": "Message text",
              "attachments": []
            }
          }
        }
      ]
    }
  ]
}
```

**Query Parameters:**
None required.

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation_id",
      "updated_time": "2024-01-01T12:00:00+0000",
      "participants": {
        "data": [
          {
            "id": "user_id",
            "username": "instagram_username"
          }
        ]
      },
      "messages": {
        "data": [
          {
            "id": "message_id",
            "created_time": "2024-01-01T12:00:00+0000",
            "from": {
              "id": "sender_id",
              "username": "sender_username"
            },
            "message": "Hello!"
          }
        ]
      }
    }
  ]
}
```

**Environment Variables:**
| Variable | Description |
|----------|-------------|
| `PAGE_ACCESS_TOKEN` | Facebook Page Access Token |
| `IG_USER_ID` | Instagram Business Account ID |
| `WEBHOOK_VERIFY_TOKEN` | Custom token for webhook verification (you choose this) |

## Troubleshooting

### Common Errors

**"Missing required environment variables"**
- Ensure `.env.local` exists and contains both `PAGE_ACCESS_TOKEN` and `IG_USER_ID`
- Restart the dev server after adding environment variables

**"Instagram API error"**
- Verify your access token is valid and not expired
- Check that your app has the correct permissions
- Ensure the recipient has messaged your business recently

**"OAuthException"**
- Your access token may be invalid or expired
- Generate a new token with the correct permissions

**"No conversations found" or empty messages**
- Make sure you have the `instagram_manage_messages` permission
- Users must have initiated a conversation with your business account
- Check that your Instagram account is a Business or Creator account

**Error #100: "not linked to an Instagram account" or "not professional account"**
- Your Instagram must be a **Business or Creator** account (not personal)
- Your Instagram must be **linked to your Facebook Page**
- Make sure `IG_USER_ID` is the Instagram **Business Account ID** (not personal Instagram ID)

**Error #10: "sent outside of allowed window"**
- You can only message users within 24 hours of their last message to you
- Make sure you're using the correct **Instagram-scoped ID** from the conversation (not their username or public profile ID)
- Check the "Received Messages" section on the homepage to find active conversations with the correct recipient IDs
- Look for conversations marked with "CAN REPLY" badge - these are within the 24-hour window
- Click the "Use This ID" button to automatically populate the correct recipient ID

## License

MIT

## Support

For Instagram Graph API documentation, visit:
- [Instagram Messaging API Docs](https://developers.facebook.com/docs/messenger-platform/instagram)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api)

## Misc

Seems like the webhook gets a different sender id? 
was able to send with the app in prod, which is the pld PAT. 
Looked at the message from the webhook and voila
 "sender": {
            "id": "1122050090040890"
          },
