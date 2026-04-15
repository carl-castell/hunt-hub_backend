import express, { Router, Request, Response } from "express";
import { requireLogin, requireAdmin } from "../middlewares/auth";

const adminRouter: Router = express.Router();

adminRouter.get("/", requireLogin, requireAdmin, (req: Request, res: Response) => {
  res.render("admin", { user: req.session.user });
});

export default adminRouter;
