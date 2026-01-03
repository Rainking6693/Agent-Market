import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? 'no-reply@swarmsync.ai';
const RECIPIENT = process.env.PROVIDER_APPLICATION_RECIPIENT ?? 'rainking6693@gmail.com';

const createTransporter = () => {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string input to prevent XSS
 */
function sanitize(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 2000); // Limit length
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Server-side validation for required fields
    const name = sanitize(payload.name);
    const email = sanitize(payload.email);
    const agentName = sanitize(payload.agentName);
    const agentDescription = sanitize(payload.agentDescription || payload.whatItDoes);
    const endpointType = sanitize(payload.endpointType);

    // Validate required fields
    if (!name || name.length < 2) {
      return NextResponse.json({ error: 'Name is required and must be at least 2 characters' }, { status: 400 });
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    if (!agentName || agentName.length < 2) {
      return NextResponse.json({ error: 'Agent name is required and must be at least 2 characters' }, { status: 400 });
    }

    if (!agentDescription || agentDescription.length < 10) {
      return NextResponse.json({ error: 'Agent description is required and must be at least 10 characters' }, { status: 400 });
    }

    if (!endpointType || !['public', 'private', 'config'].includes(endpointType)) {
      return NextResponse.json({ error: 'Valid endpoint type is required (public, private, or config)' }, { status: 400 });
    }

    // Sanitize optional fields
    const sanitizedPayload = {
      name,
      email,
      xHandle: sanitize(payload.xHandle || payload.twitter),
      agentName,
      agentDescription,
      endpointType,
      docsLink: sanitize(payload.docsLink),
      notes: sanitize(payload.notes),
    };

    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Mail transport not configured – logging provider application payload.');
      console.warn('SMTP_HOST:', SMTP_HOST ? 'SET' : 'MISSING');
      console.warn('SMTP_PORT:', SMTP_PORT ? 'SET' : 'MISSING');
      console.warn('SMTP_USER:', SMTP_USER ? 'SET' : 'MISSING');
      console.warn('SMTP_PASS:', SMTP_PASS ? 'SET' : 'MISSING');
      console.info('[Provider Application]', JSON.stringify(sanitizedPayload, null, 2));
      return NextResponse.json({ status: 'received' });
    }

    const subject = `Provider Application: ${sanitizedPayload.agentName} (${sanitizedPayload.name})`;
    const body = `
      Name: ${sanitizedPayload.name}
      Email: ${sanitizedPayload.email}
      X Handle: ${sanitizedPayload.xHandle || '-'}
      Agent name: ${sanitizedPayload.agentName}
      What it does: ${sanitizedPayload.agentDescription}
      Endpoint type: ${sanitizedPayload.endpointType}
      Docs/repo: ${sanitizedPayload.docsLink || '-'}
      Notes: ${sanitizedPayload.notes || '-'}
    `;

    console.log('[Provider Application] Attempting to send email...');
    console.log('[Provider Application] From:', SMTP_FROM);
    console.log('[Provider Application] To:', RECIPIENT);
    console.log('[Provider Application] Subject:', subject);

    await transporter.sendMail({
      from: SMTP_FROM,
      to: RECIPIENT,
      replyTo: sanitizedPayload.email,
      subject,
      text: body,
    });

    console.log('[Provider Application] Email sent successfully!');
    return NextResponse.json({ status: 'sent' });
  } catch (error) {
    console.error('[Provider Application] failed', error);
    return NextResponse.json({ error: 'Unable to capture application' }, { status: 500 });
  }
}
