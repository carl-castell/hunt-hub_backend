import express, { Router, Request, Response } from "express";
import { requireLogin, requireManager } from "../middlewares/auth";

const managerRouter: Router = express.Router();

managerRouter.get("/", requireLogin, requireManager, (req: Request, res: Response) => {
  res.render("manager", { user: req.session.user });
});

export default managerRouter;
