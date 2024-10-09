import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { logger } from './middelwares/logger';
import { sendMail } from "./mail";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', './mail-views')




app.use(logger)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.get('/api/test', (req: Request, res: Response) => {
  res.send("<h1>In Construction...</h1>")
});




app.get('/email/isams', async (req, res) => {
  try {
    await sendMail();
    res.send('Email sent successfully!');
  } catch (error) {
    res.status(500).send('Failed to send email');
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});