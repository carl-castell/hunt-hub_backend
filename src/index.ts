import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";

import { logger } from './middelwares/logger';
import { sendMail } from "./mail";
import { db } from "./db";
import { json } from "stream/consumers";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', './mail-views')




app.use(logger)

app.get('/allusers', async (req: Request, res: Response) => {
  try {
    // Assuming db.query.posts.findMany is a valid method to fetch posts
    const data = await db.query.usersTable.findMany();
    res.json({
      data,
    });
  } catch (error) {
    // Log error for debugging
    console.error('Error fetching posts:', error);

    // Send a more descriptive error response
    res.status(500).json({
      error: 'An error occurred while fetching posts. Please try again later.',
    });
  }
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