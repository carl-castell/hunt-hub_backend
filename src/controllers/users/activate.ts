import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable, userAuthTokensTable } from '../../db/schema';
import { activateSchema } from '@/schemas';

export async function getActivate(req: Request, res: Response) {
  try {
    const { token } = req.params;

    const [authToken] = await db
      .select()
      .from(userAuthTokensTable)
      .where(eq(userAuthTokensTable.token, token))
      .limit(1);

    if (!authToken) return res.render('activate', { error: 'Invalid or expired activation link.', token });
    if (authToken.expiresAt < new Date()) return res.render('activate', { error: 'This activation link has expired.', token });

    res.render('activate', { error: null, token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postActivate(req: Request, res: Response) {
  try {
    const { token } = req.params;

    // ── Zod validation ────────────────────────────────────────────────────────
    const result = activateSchema.safeParse(req.body);
    if (!result.success) {
      return res.render('activate', {
        error: result.error.issues[0].message,
        token,
      });
    }

    const { password } = result.data;

    const [authToken] = await db
      .select()
      .from(userAuthTokensTable)
      .where(eq(userAuthTokensTable.token, token))
      .limit(1);

    if (!authToken) return res.render('activate', { error: 'Invalid or expired activation link.', token });
    if (authToken.expiresAt < new Date()) return res.render('activate', { error: 'This activation link has expired.', token });

    // Hash new password and activate user
    const hashedPassword = await bcrypt.hash(password, 10);
    await db
      .update(usersTable)
      .set({ password: hashedPassword, active: true })
      .where(eq(usersTable.id, authToken.userId));

    // Delete token so it can't be used again
    await db
      .delete(userAuthTokensTable)
      .where(eq(userAuthTokensTable.id, authToken.id));

    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
