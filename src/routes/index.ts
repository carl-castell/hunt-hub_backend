import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

import { logger } from '../middelwares/logger';
import usersRourter from "./users";
import aboutRouter from "./about"

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'));


app.use(logger)
// Index route
app.get('/', (req: Request, res: Response) => {
  const data = {
    title: 'Hunt-Hub',
    message: 'This is a simple EJS template rendered by Express!',
    users: ['Alice', 'Bob', 'Charlie'],
    currentTime: new Date().toLocaleString()
  };
  
  res.render('index', data);
});


// Other routes
app.use('/about', aboutRouter);
app.use('/users', usersRourter);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


