import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const pageAccessToken = process.env.PAGE_ACCESS_TOKEN;
    const igUserId = process.env.IG_USER_ID;

    if (!pageAccessToken || !igUserId) {
      return NextResponse.json(
        { error: 'Missing required environment variables: PAGE_ACCESS_TOKEN or IG_USER_ID' },
        { status: 500 }
      );
    }

    // Debug the access token
    const debugUrl = `https://graph.facebook.com/debug_token?input_token=${pageAccessToken}&access_token=${pageAccessToken}`;
    const debugResponse = await fetch(debugUrl);
    const debugData = await debugResponse.json();

    // Get token info
    const meUrl = `https://graph.facebook.com/v21.0/me?access_token=${pageAccessToken}`;
    const meResponse = await fetch(meUrl);
    const meData = await meResponse.json();

    return NextResponse.json({
      success: true,
      token_debug: debugData.data,
      token_owner: meData,
      ig_user_id: igUserId,
      recommendations: {
        is_valid: debugData.data?.is_valid || false,
        type: debugData.data?.type || 'unknown',
        expected_type: 'PAGE',
        scopes: debugData.data?.scopes || [],
        required_scopes: [
          'pages_messaging',
          'instagram_manage_messages',
          'pages_read_engagement',
          'instagram_basic'
        ]
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to debug token',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

