import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Find the invite
    const invite = await prisma.betaInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invalid invite link' }, { status: 404 });
    }

    // Check if expired
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite expired' }, { status: 400 });
    }

    // Check if already used up
    if (invite.currentUses >= invite.maxUses) {
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
    }

    // Check if this specific user already used it
    if (invite.usedBy && invite.maxUses === 1) {
      return NextResponse.json({ error: 'Invite already used' }, { status: 400 });
    }

    // Grant beta access to the user
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        providerBeta: true,
        betaAccess: true,
      },
    });

    // Mark invite as used
    await prisma.betaInvite.update({
      where: { token },
      data: {
        currentUses: invite.currentUses + 1,
        usedAt: new Date(),
        usedBy: user.id,
      },
    });

    console.log(`[Beta Invite] User ${user.email} accepted invite ${token}`);

    return NextResponse.json({
      success: true,
      message: 'Beta access granted!',
    });
  } catch (error) {
    console.error('[Beta Invite] Accept error:', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
