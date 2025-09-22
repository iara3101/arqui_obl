import nodemailer from "nodemailer";

export function makeTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendInviteEmail(to, token) {
  const transport = makeTransport();
  const url = `${process.env.APP_URL}/accept-invite?token=${token}`;
  await transport.sendMail({
    from: process.env.SMTP_FROM || "no-reply@crm.local",
    to,
    subject: "You’re invited to CRM",
    text: `Welcome! Click to accept your invite: ${url}`,
    html: `<p>Welcome! Click to accept your invite:</p><p><a href="${url}">${url}</a></p>`,
  });
}