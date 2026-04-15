import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";

import { logger } from '../middelwares/logger';
import usersRourter from "./users";
import aboutRouter from "./about";
import homeRouter from "./home";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '../views'));


app.use(logger)

app.use('/', homeRouter);
app.use('/about', aboutRouter);
app.use('/users', usersRourter);


app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});


