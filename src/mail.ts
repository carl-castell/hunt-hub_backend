import nodemailer from 'nodemailer';
import 'dotenv/config';
import path from 'path';
import ejs from 'ejs';

// Render template
const templatePath = path.join(__dirname, 'mail-views', 'isams.ejs');

// current time
const getCurrentTime = (): string => {
  const currentDate = new Date();
  const hours = currentDate.getHours().toString().padStart(2, '0');
  const minutes = currentDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// current year
const getCurrentYear = (): number => {
  const currentDate = new Date();
  return currentDate.getFullYear();
};

// current year in 2 digits
const getCurrentYearTwoDigits = (): string => {
  const currentDate = new Date();
  return currentDate.getFullYear().toString().slice(-2);
};

// current month
const getCurrentMonth = (): string => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  return monthNames[currentDate.getMonth()];
};

// get day
const getCurrentDayOfMonth = (): number => {
  const currentDate = new Date();
  return currentDate.getDate();
};

const data = {
  email: '', //recipient email address
  name: '', //recipient name
  message: '', //detention message
  time: getCurrentTime(),
  date: {
    day:getCurrentDayOfMonth(),
    month:getCurrentMonth(),
    year: getCurrentYear(),
    year_two_digits: getCurrentYearTwoDigits(),
  }

};

// Function to render HTML and send email
export const sendMail = async () => {
  try {
    const renderedHtml = await ejs.renderFile(templatePath, data);

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

    const mailOptions = {
      from: '"iSAMS Notification" <isams-noreply@ampleforth.org.uk>', // Sender address
      to: data.email, // Recipient address
      subject: `iSAMS Notification - ${data.name}`, // Subject line
      html: renderedHtml, // Rendered HTML
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};