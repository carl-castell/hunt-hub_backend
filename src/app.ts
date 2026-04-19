import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";
import ejsLayouts from 'express-ejs-layouts';

import { logger } from "./middlewares/logger";
import { requireAdmin, requireManager, requireAuth } from './middlewares/requireRole';

import homeRouter from "./routes/home";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import managerRouter from "./routes/manager";
import usersRouter from './routes/users';
import activateRouter from './routes/activate';

import { estatesTable } from './db/schema/estates';
import { db } from './db';
import { eq } from 'drizzle-orm';


dotenv.config();

const app: Express = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(ejsLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2,
    },
  })
);

app.use(logger);
app.use(express.static(path.join(__dirname, '../public')));

app.use("/", homeRouter);
app.use("/", authRouter);
app.use("/admin", requireAdmin, adminRouter);

app.use('/manager', requireManager, async (req, res, next) => {
  res.locals.layout = 'manager/layout';
  
  const [estate] = await db
    .select()
    .from(estatesTable)
    .where(eq(estatesTable.id, req.session.user!.estateId!))
    .limit(1);

  res.locals.estateName = estate?.name ?? '';
  next();
});
app.use("/manager", requireManager, managerRouter);

app.use('/users', requireAuth, usersRouter);
app.use('/activate', activateRouter);

export default app;