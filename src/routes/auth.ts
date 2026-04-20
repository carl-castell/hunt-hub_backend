import express, { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { usersTable } from '../db/schema/users';
import { loginSchema } from '../schemas';
import { authLimiter } from '@/middlewares/rateLimiter';
import { audit } from '@/audit';

const authRouter: Router = express.Router();

// GET /login
authRouter.get('/login', (req: Request, res: Response) => {
  if (req.session.user) return redirectByRole(req, res);
  res.render('login', { layout: false, title: 'Hunt-Hub | Login', error: null });
});

// POST /login
authRouter.post('/login', authLimiter, async (req: Request, res: Response) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.render('login', {
      layout: false,
      title: 'Hunt-Hub | Login',
      error: result.error.issues[0].message,
    });
  }

  const { email, password } = result.data;

  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (!user || !user.password) {
      await audit({ event: 'failed_login', ip: req.ip, metadata: { email } });
      return res.render('login', { layout: false, title: 'Hunt-Hub | Login', error: 'Invalid email or password.' });
    }

    if (!user.active) {
      await audit({ event: 'failed_login', ip: req.ip, metadata: { email, reason: 'inactive account' } });
      return res.render('login', {
        layout: false,
        title: 'Hunt-Hub | Login',
        error: 'Your account is inactive. Please reach out to management or an admin.',
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      await audit({ event: 'failed_login', ip: req.ip, metadata: { email } });
      return res.render('login', { layout: false, title: 'Hunt-Hub | Login', error: 'Invalid email or password.' });
    }

    req.session.user = {
      id:        user.id,
      firstName: user.firstName,
      lastName:  user.lastName,
      email:     user.email,
      role:      user.role,
      active:    user.active,
      estateId:  user.estateId ?? null,
    };

    req.session.save(async (err) => {
      if (err) {
        console.error('[session save error]', err);
        return res.render('login', { layout: false, title: 'Hunt-Hub | Login', error: 'Something went wrong. Please try again.' });
      }
      await audit({ userId: user.id, event: 'login', ip: req.ip });
      return redirectByRole(req, res);
    });

  } catch (err) {
    console.error('[login error]', err);
    return res.render('login', { layout: false, title: 'Hunt-Hub | Login', error: 'Something went wrong. Please try again.' });
  }
});

// POST /logout
authRouter.post('/logout', async (req: Request, res: Response) => {
  const userId = req.session.user?.id;
  const ip = req.ip;
  req.session.destroy(async () => {
    await audit({ userId, event: 'logout', ip });
    res.redirect('/login');
  });
});

function redirectByRole(req: Request, res: Response) {
  switch (req.session.user?.role) {
    case 'admin':   return res.redirect('/admin');
    case 'manager': return res.redirect('/manager');
    case 'staff':   return res.redirect('/staff');
    default:        return res.redirect('/login');
  }
}

export default authRouter;
