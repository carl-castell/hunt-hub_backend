import express, { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { usersTable } from "../db/schema/users";

const authRouter: Router = express.Router();

// GET /login
authRouter.get("/login", (req: Request, res: Response) => {
  if (req.session.user) {
    return redirectByRole(req, res);
  }
  res.render("login", { error: null });
});

// POST /login
authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user || !user.password) {
      return res.render("login", { error: "Invalid email or password." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.render("login", { error: "Invalid email or password." });
    }

    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      estateId: user.estateId ?? null,
    };

    return redirectByRole(req, res);

  } catch (err) {
    console.error("[login error]", err);
    return res.render("login", { error: "Something went wrong. Please try again." });
  }
});

// POST /logout
authRouter.post("/logout", (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

function redirectByRole(req: Request, res: Response) {
  switch (req.session.user?.role) {
    case "admin":   return res.redirect("/admin");
    case "manager": return res.redirect("/manager");
    case "staff":   return res.redirect("/staff");
    default:        return res.redirect("/login");
  }
}

export default authRouter;
