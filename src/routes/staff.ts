import express, { Router, Request, Response } from "express";
import { requireLogin, requireStaff } from "../middlewares/auth";

const staffRouter: Router = express.Router();

staffRouter.get("/", requireLogin, requireStaff, (req: Request, res: Response) => {
  res.render("staff", { user: req.session.user });
});

export default staffRouter;
