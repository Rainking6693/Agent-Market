import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Get authenticated user (supports both OAuth and email/password)
    const authUser = await getAuthenticatedUser();
    if (!authUser?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: authUser.email },
      select: { id: true, role: true },
    });

    if (user?.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { email, expiresInDays, maxUses, notes } = await request.json();

    // Calculate expiration date if provided
    let expiresAt: Date | undefined;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Create the invite
    const invite = await prisma.betaInvite.create({
      data: {
        email: email || null,
        createdBy: user.id,
        expiresAt: expiresAt || null,
        maxUses: maxUses || 1,
        notes: notes || null,
      },
    });

    const inviteUrl = `${process.env.NEXTAUTH_URL || 'https://swarmsync.ai'}/invite/${invite.token}`;

    console.log(`[Beta Invite] Admin ${authUser.email} created invite: ${inviteUrl}`);

    return NextResponse.json({
      success: true,
      invite: {
        id: invite.id,
        token: invite.token,
        url: inviteUrl,
        email: invite.email,
        expiresAt: invite.expiresAt,
        maxUses: invite.maxUses,
        createdAt: invite.createdAt,
      },
    });
  } catch (error) {
    console.error('[Beta Invite] Create error:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
