import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { logger } from './middelwares/logger';
import { sendMail } from "./mail";
import { db } from "./db";
import { estatesTable, guestsTable } from "./db/schema";



dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', './mail-views')




app.use(logger)

app.get('/', async (req: Request, res: Response) => {
  try {
    const users = await db.query.usersTable.findMany();
    res.json({
      users,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: 'An error occurred while fetching posts. Please try again later.',
    });
  }
});

app.get('/1', async (req: Request, res: Response) => {
  res.send('hallo');
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
