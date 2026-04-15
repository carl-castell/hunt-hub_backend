import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') return res.status(403).send('Forbidden');
  next();
}

export function requireManager(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'manager') return res.status(403).send('Forbidden');
  next();
}

export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'staff') return res.status(403).send('Forbidden');
  next();
}

export function requireEstateAccess(req: Request, res: Response, next: NextFunction) {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  // Admins can access everything
  if (user.role === 'admin') return next();

  // Managers and staff can only access their own estate
  const estateId = Number(req.params.id);
  if (user.estateId !== estateId) return res.status(403).send('Forbidden');

  next();
}

// for example like this
//import { requireEstateAccess } from '../middlewares/requireRole';

//router.get('/estates/:id', requireEstateAccess, getEstate);
//router.get('/estates/:id/events', requireEstateAccess, getEvents);

export async function requireUserAccess(req: Request, res: Response, next: NextFunction) {
  const sessionUser = req.session.user;
  if (!sessionUser) return res.redirect('/login');

  if (sessionUser.role === 'admin') return next();

  const { id } = req.params;
  const [targetUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, Number(id)))
    .limit(1);

  if (!targetUser) return res.status(404).send('User not found');
  if (targetUser.estateId !== sessionUser.estateId) return res.status(403).send('Forbidden');

  next();
}