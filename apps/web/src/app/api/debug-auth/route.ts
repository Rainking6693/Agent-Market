import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  return NextResponse.json({
    providers: authOptions.providers?.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type,
    })),
    hasSecret: !!authOptions.secret,
    hasAdapter: !!authOptions.adapter,
    sessionStrategy: authOptions.session?.strategy,
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT SET',
      NEXTAUTH_SECRET_exists: !!process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID_exists: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET_exists: !!process.env.GOOGLE_CLIENT_SECRET,
      DATABASE_URL_exists: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    },
  });
}
