import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

import { logger } from '../middelwares/logger';
import { sendMail } from "../mail";
import { db } from "../db";


dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'));


app.use(logger)
app.get('/', (req: Request, res: Response) => {
  const data = {
    title: 'Hunt-Hub',
    message: 'This is a simple EJS template rendered by Express!',
    users: ['Alice', 'Bob', 'Charlie'],
    currentTime: new Date().toLocaleString()
  };
  
  res.render('index', data);
});

app.get('/about', (req: Request, res: Response) => {
  res.render('about', { 
    title: 'About Page',
    description: 'This is the about page rendered with EJS.'
  });
});

app.get('/users', async (req, res) => {
  // Query first 10 users
     const users = await db.query.usersTable.findMany({
     limit: 10,
   });


  // Render EJS template, passing users
  res.render('users', { users, title: 'Users List' });
});


// DB test

app.get('/db', async (req: Request, res: Response) => {
  try {
    const users = await db.query.usersTable.findMany();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});




// Experiment

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


