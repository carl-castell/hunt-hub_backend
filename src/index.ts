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
