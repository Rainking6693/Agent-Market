import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.info('[Provider Application]', JSON.stringify(body, null, 2));

    return NextResponse.json({ status: 'received' });
  } catch (error) {
    console.error('[Provider Application] failed', error);
    return NextResponse.json({ error: 'Unable to capture application' }, { status: 500 });
  }
}
