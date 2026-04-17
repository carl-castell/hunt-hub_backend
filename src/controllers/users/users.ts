import { Request, Response } from 'express';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable, userAuthTokensTable } from '../../db/schema';
import { updateUserSchema } from '@/schemas';

export async function getUser(req: Request, res: Response) {
  try {
    const sessionUser = req.session.user!;
    const { id } = req.params;

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)))
      .limit(1);

    if (!user) return res.status(404).send('User not found');

    const [authToken] = await db
      .select()
      .from(userAuthTokensTable)
      .where(eq(userAuthTokensTable.userId, user.id))
      .limit(1);

    const domain = process.env.DOMAIN || 'http://localhost:3000';

    res.render('users/user', {
      sessionUser,
      targetUser: user,
      domain,
      activationToken: authToken?.token || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)))
      .limit(1);

    if (!existing) return res.status(404).send('User not found');

    // ── Zod validation ────────────────────────────────────────────────────────
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).send(result.error.issues[0].message);
    }

    const { firstName, lastName, email } = result.data;

    await db
      .update(usersTable)
      .set({ firstName, lastName, email })
      .where(eq(usersTable.id, Number(id)));

    res.redirect(`/users/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function deactivateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)))
      .limit(1);

    if (!existing) return res.status(404).send('User not found');

    await db.update(usersTable).set({ active: false }).where(eq(usersTable.id, Number(id)));
    res.redirect(`/users/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const sessionUser = req.session.user!;

    const [targetUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)))
      .limit(1);

    if (!targetUser) return res.status(404).send('User not found');

    await db.delete(usersTable).where(eq(usersTable.id, Number(id)));

    if (sessionUser.role === 'admin') {
      if (targetUser.estateId) {
        return res.redirect(`/admin/estates/${targetUser.estateId}`);
      }
      return res.redirect('/admin');
    } else {
      res.redirect('/manager');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function resendActivation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)))
      .limit(1);

    if (!existing) return res.status(404).send('User not found');

    await db.delete(userAuthTokensTable).where(eq(userAuthTokensTable.userId, Number(id)));

    const token = crypto.randomUUID();
    await db.insert(userAuthTokensTable).values({
      userId: Number(id),
      token,
      type: 'activation',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
    });

    res.redirect(`/users/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function reactivateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const [existing] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)))
      .limit(1);

    if (!existing) return res.status(404).send('User not found');

    await db.update(usersTable).set({ active: true }).where(eq(usersTable.id, Number(id)));
    res.redirect(`/users/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}