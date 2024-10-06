import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { logger } from './middelwares/logger';
import { sendMail } from "./mail";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(logger)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get('/api/test', (res: Response) => {
  '<h1>In Construction</h1>'
})

// app.get('/send-email', (req, res) => {
//   sendMail(
//     'carlcastell4@gmail.com',
//     'Hey you, awesome!',
//     '<b>Wow Big powerful letters</b>',
//     'Mailgun rocks, pow pow!'
//   )
// })

app.get('/send-email', async (req, res) => {
  try {
    await sendMail(
      'max@mustermann.de',
      'message to max',
      'hallo'
    );
    res.send('Email sent successfully!');
  } catch (error) {
    res.status(500).send('Failed to send email');
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});