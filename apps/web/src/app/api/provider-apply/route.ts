import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM ?? 'no-reply@swarmsync.ai';
const RECIPIENT = process.env.PROVIDER_APPLICATION_RECIPIENT ?? 'bullrushinvestments@gmail.com';

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

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const transporter = createTransporter();
    if (!transporter) {
      console.warn('Mail transport not configured – logging provider application payload.');
      console.info('[Provider Application]', JSON.stringify(payload, null, 2));
      return NextResponse.json({ status: 'received' });
    }

    const subject = `Provider Application: ${payload.agentName} (${payload.name})`;
    const body = `
      Name: ${payload.name}
      Email: ${payload.email}
      Twitter: ${payload.twitter || '–'}
      Agent name: ${payload.agentName}
      What it does: ${payload.whatItDoes}
      Endpoint type: ${payload.endpointType}
      Docs/repo: ${payload.docsLink || '–'}
      Notes: ${payload.notes || '–'}
    `;

    await transporter.sendMail({
      from: SMTP_FROM,
      to: RECIPIENT,
      replyTo: payload.email,
      subject,
      text: body,
    });

    return NextResponse.json({ status: 'sent' });
  } catch (error) {
    console.error('[Provider Application] failed', error);
    return NextResponse.json({ error: 'Unable to capture application' }, { status: 500 });
  }
}
