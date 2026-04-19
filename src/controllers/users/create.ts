import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../../db';
import { usersTable, userAuthTokensTable } from '../../db/schema';
import { createManagerSchema } from '@/schemas';
import { renderTemplate, sendMail } from '@/mail';

export async function createManager(req: Request, res: Response) {
  try {
    // ── Zod validation ────────────────────────────────────────────────────────
    const result = createManagerSchema.safeParse(req.body);
    if (!result.success) {
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
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48);

    await db.insert(userAuthTokensTable).values({
      userId: newManager.id,
      token,
      type: 'activation',
      expiresAt,
    });

    // Send activation email
    try {
      const domain = process.env.DOMAIN ?? 'http://localhost:3000';
      const activationLink = `${domain}/activate/${token}`;

      const html = await renderTemplate('activation', {
        firstName,
        activationLink,
        year: new Date().getFullYear(),
        expiresAt,
      });

      await sendMail({
        to: email,
        subject: 'Activate your Hunt Hub account',
        html,
      });
    } catch (emailErr) {
      console.error('[email error] Failed to send activation email:', emailErr);
      // User and token are already created — just log the error and continue
    }

    res.redirect(`/admin/estates/${estateId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
