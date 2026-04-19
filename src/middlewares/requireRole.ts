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

export async function requireManager(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');

  try {
    const [freshUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.session.user.id))
      .limit(1);

    if (!freshUser || freshUser.role !== 'manager') return res.status(403).send('Forbidden');

    req.session.user.role = freshUser.role;
    next();
  } catch (err) {
    console.error('[requireManager]', err);
    res.status(500).send('Server error');
  }
}


export function requireStaff(req: Request, res: Response, next: NextFunction) {
  if (!req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'staff') return res.status(403).send('Forbidden');
  next();
}

export function requireEstateAccess(req: Request, res: Response, next: NextFunction) {
  const user = req.session.user;
  if (!user) return res.redirect('/login');

  if (user.role === 'admin') return next();

  const estateId = Number(req.params.id);
  if (user.estateId !== estateId) return res.status(403).send('Forbidden');

  next();
}

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
