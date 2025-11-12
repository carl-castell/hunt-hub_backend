// routes/users.ts

import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// List of x users
router.get('/', async (req: Request, res: Response) => {
  const users = await db.query.usersTable.findMany({
    limit: 2,
  });
  res.render('users', { users, title: 'Users List' });
});


router.get('/db', async (req: Request, res: Response) => {
  try {
    const users = await db.query.usersTable.findMany();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

export default router;
