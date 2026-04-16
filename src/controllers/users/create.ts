import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../../db';
import { usersTable, userAuthTokensTable } from '../../db/schema';
import { createManagerSchema } from '@/schemas';

export async function createManager(req: Request, res: Response) {
  try {
    // ── Zod validation ────────────────────────────────────────────────────────
    const result = createManagerSchema.safeParse(req.body);
    if (!result.success) {
      // Redirect back with error — or render if you have a form page
      return res.status(400).send(result.error.issues[0].message);
    }

    const { firstName, lastName, email, estateId } = result.data;

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
