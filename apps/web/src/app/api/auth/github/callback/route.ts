import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { code } = (await request.json()) as { code: string };

    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: 'GitHub OAuth not configured' }, { status: 500 });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      return NextResponse.json({ error: 'Failed to exchange code for token' }, { status: 400 });
    }

    const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };

    if (tokenData.error || !tokenData.access_token) {
      return NextResponse.json({ error: tokenData.error || 'No access token received' }, {
        status: 400,
      });
    }

    return NextResponse.json({ token: tokenData.access_token });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    );
  }
}

