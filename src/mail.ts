import nodemailer from 'nodemailer';
import ejs from 'ejs';
import path from 'path';

const transporter = nodemailer.createTransport({
  host: 'smtp.eu.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_SMTP_USER,
    pass: process.env.MAILGUN_SMTP_PASSWORD,
  },
});

export async function renderTemplate(template: string, data: Record<string, unknown>): Promise<string> {
  const templatePath = path.join(process.cwd(), 'src', 'mail-views', `${template}.ejs`);
  return ejs.renderFile(templatePath, data);
}

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  return transporter.sendMail({
    from: `"Hunt Hub" <${process.env.MAIL_FROM}>`,
    to,
    subject,
    html,
  });
}

export default transporter;
