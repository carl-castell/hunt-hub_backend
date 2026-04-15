import { Request, Response, NextFunction } from 'express';

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
