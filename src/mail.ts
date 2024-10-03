
import nodemailer from 'nodemailer';
//import mg from 'nodemailer-mailgun-transport';
import 'dotenv/config';

//smtp method

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // SMTP server host
  port: Number(process.env.SMTP_PORT), // SMTP server port
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // SMTP username
    pass: process.env.SMTP_PASS, // SMTP password
  },
});

// Function to send an email
export const sendMail = async (to: string, subject: string, text: string) => {
  const mailOptions = {
    from: '"Ferdinand Castell" <ferdinand@castell.de>', // Sender address
    to, // Recipient address
    subject, // Subject line
    text

  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


// api method
// const auth = {
//   auth: {
//     apiKey: process.env.MAILGUN_API_KEY || '',
//     domain: process.env.MAILGUN_DOMAIN || '',
//   },
// };

// const nodemailerMailgun = nodemailer.createTransport(mg(auth));

// export const sendMail = (to: string, subject: string, html: string, text: string) => {
//   const mailOptions = {
//     from: 'no-reply@hunt-hub.de',
//     to,
//     //bcc: 'secretagent@company.gov',
//     subject,
//     //replyTo: 'reply2this@company.com',
//     html,
//     text,
//   };

//   nodemailerMailgun.sendMail(mailOptions, (err, info) => {
//     if (err) {
//       console.error(`Error: ${err}`);
//     } else {
//       console.log(`Response: ${info}`);
//     }
//   });
// };