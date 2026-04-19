import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable } from '../../db/schema/users';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const changePasswordSchema = z.object({
  oldPassword:     z.string().min(1),
  newPassword:     z.string().min(8),
  confirmPassword: z.string().min(1),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'New passwords do not match.',
  path:    ['confirmPassword'],
});

export async function getAccount(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const [fullUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (!fullUser) return res.status(404).send('User not found');

    res.render('manager/account', { title: 'Account', user, fullUser, error: null, success: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postChangePassword(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      const [fullUser] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .limit(1);

      return res.render('manager/account', {
        title: 'Account',
        user,
        fullUser,
        error:   result.error.issues[0].message,
        success: null,
      });
    }

    const { oldPassword, newPassword } = result.data;

    // Fetch full user record to get hashed password
    const [fullUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1);

    if (!fullUser) return res.status(404).send('User not found');

    // Verify old password
    const match = await bcrypt.compare(oldPassword, fullUser.password);
    if (!match) {
      return res.render('manager/account', {
        title: 'Account',
        user,
        fullUser,
        error:   'Current password is incorrect.',
        success: null,
      });
    }

    // Hash and save new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db
      .update(usersTable)
      .set({ password: hashed })
      .where(eq(usersTable.id, user.id));

    res.render('manager/account', {
      title: 'Account', 
      user,
      fullUser,
      error:   null,
      success: 'Password changed successfully.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
