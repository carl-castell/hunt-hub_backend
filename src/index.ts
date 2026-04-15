import express, { Express } from "express";
import dotenv from "dotenv";
import path from "path";
import session from "express-session";

import { logger } from "./middlewares/logger";
import usersRouter from "./routes/users";
import aboutRouter from "./routes/about";
import homeRouter from "./routes/home";
import authRouter from "./routes/auth";
import adminRouter from "./routes/admin";
import managerRouter from "./routes/manager";
import staffRouter from "./routes/staff";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "changeme_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

app.use(logger);

app.use(express.static(path.join(__dirname, '../public')));


app.use("/", homeRouter);
app.use("/about", aboutRouter);
app.use("/users", usersRouter);
app.use("/", authRouter);
app.use("/admin", adminRouter);
app.use("/manager", managerRouter);
app.use("/staff", staffRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
