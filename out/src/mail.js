"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
require("dotenv/config");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
// Render template
const templatePath = path_1.default.join(__dirname, 'mail-views', 'isams.ejs');
// current time
const getCurrentTime = () => {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};
// current year
const getCurrentYear = () => {
    const currentDate = new Date();
    return currentDate.getFullYear();
};
// current year in 2 digits
const getCurrentYearTwoDigits = () => {
    const currentDate = new Date();
    return currentDate.getFullYear().toString().slice(-2);
};
// current month
const getCurrentMonth = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentDate = new Date();
    return monthNames[currentDate.getMonth()];
};
// get day
const getCurrentDayOfMonth = () => {
    const currentDate = new Date();
    return currentDate.getDate();
};
const data = {
    email: '', //recipient email address
    name: '', //recipient name
    message: '', //detention message
    time: getCurrentTime(),
    date: {
        day: getCurrentDayOfMonth(),
        month: getCurrentMonth(),
        year: getCurrentYear(),
        year_two_digits: getCurrentYearTwoDigits(),
    }
};
// Function to render HTML and send email
const sendMail = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const renderedHtml = yield ejs_1.default.renderFile(templatePath, data);
        // Create a transporter using SMTP
        const transporter = nodemailer_1.default.createTransport({
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
        const info = yield transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    }
    catch (error) {
        console.error('Error sending email:', error);
    }
});
exports.sendMail = sendMail;
