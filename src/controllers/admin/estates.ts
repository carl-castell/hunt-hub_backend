import { Request, Response } from 'express';
import { db } from '../../db';
import { estatesTable, usersTable } from '../../db/schema';
import { eq } from 'drizzle-orm';

export async function createEstate(req: Request, res: Response) {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const { name } = req.body;
    const [newEstate] = await db
      .insert(estatesTable)
      .values({ name })
      .returning();

    res.redirect(`/admin/estates/${newEstate.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function getEstate(req: Request, res: Response) {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const { id } = req.params;

    const [estate] = await db
      .select()
      .from(estatesTable)
      .where(eq(estatesTable.id, Number(id)))
      .limit(1);

    if (!estate) return res.status(404).send('Estate not found');

    const managers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.estateId, Number(id)));

    res.render('admin/estate', { user, estate, managers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function renameEstate(req: Request, res: Response) {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const { id } = req.params;
    const { name } = req.body;

    await db
      .update(estatesTable)
      .set({ name })
      .where(eq(estatesTable.id, Number(id)));

    res.redirect(`/admin/estates/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function deleteEstate(req: Request, res: Response) {
  try {
    const user = req.session.user;
    if (!user) return res.redirect('/login');

    const { id } = req.params;

    await db
      .delete(estatesTable)
      .where(eq(estatesTable.id, Number(id)));

    res.redirect('/admin');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

