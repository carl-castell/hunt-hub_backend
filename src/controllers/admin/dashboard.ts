
import { Request, Response } from 'express';
import { db } from '../../db';
import { estatesTable } from '../../db/schema';

export async function getDashboard(req: Request, res: Response) {
  try {
    const user = req.session.user;

    const estates = await db.select().from(estatesTable);
    res.render('admin/admin-dashboard', {
      layout: false,
      user,
      estates
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
