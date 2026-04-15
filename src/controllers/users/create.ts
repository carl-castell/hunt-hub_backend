import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../../db';
import { usersTable, userAuthTokensTable } from '../../db/schema';

export async function createManager(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, estateId } = req.body;

    // Create user with random password and active: false
    const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);

    const [newManager] = await db
      .insert(usersTable)
      .values({
        firstName,
        lastName,
        email,
        role: 'manager',
        estateId: Number(estateId),
        password: randomPassword,
        active: false,
      })
      .returning();

    // Create activation token — expires in 48 hours
    const token = crypto.randomUUID();
    await db.insert(userAuthTokensTable).values({
      userId: newManager.id,
      token,
      type: 'activation',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
    });

    res.redirect(`/admin/estates/${estateId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
