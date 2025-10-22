// src/index.ts (or your Express entry)
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';

import { logger } from './middelwares/logger';
import { sendMail } from './mail';
import { db } from './db';
import * as schema from './db/schema';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(logger);

app.get('/', (_req: Request, res: Response) => {
  const data = {
    title: 'Hunt-Hub',
    message: 'This is a simple EJS template rendered by Express!',
    users: ['Alice', 'Bob', 'Charlie'],
    currentTime: new Date().toLocaleString(),
  };
  res.render('index', data);
});

app.get('/about', (_req: Request, res: Response) => {
  res.render('about', {
    title: 'About Page',
    description: 'This is the about page rendered with EJS.',
  });
});

// DB test — use portable query builder
app.get('/db', async (_req: Request, res: Response) => {
  try {
    const users = await db.select().from(schema.usersTable).limit(50);
    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      error: 'An error occurred while fetching users. Please try again later.',
    });
  }
});

app.get('/1', async (_req: Request, res: Response) => {
  res.send('<a href="http://localhost:3000/1">Reload</a>');
});

// Email experiment
app.get('/email/isams', async (_req, res) => {
  try {
    await sendMail();
    res.send('Email sent successfully!');
  } catch {
    res.status(500).send('Failed to send email');
  }
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
