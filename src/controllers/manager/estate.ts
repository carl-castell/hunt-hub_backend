import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { estatesTable } from '../../db/schema/estates';
import { areasTable } from '../../db/schema/areas';
import { z } from 'zod';

const renameEstateSchema = z.object({
  name: z.string().min(1).max(256),
});

export async function getEstate(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const [estate] = await db
      .select()
      .from(estatesTable)
      .where(eq(estatesTable.id, user.estateId!))
      .limit(1);

    if (!estate) return res.status(404).send('Estate not found');

    const areas = await db
      .select()
      .from(areasTable)
      .where(eq(areasTable.estateId, user.estateId!));

    res.render('manager/estate', {
      title: 'Estate',
      user,
      estate,
      areas,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postRenameEstate(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const result = renameEstateSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    await db
      .update(estatesTable)
      .set({ name: result.data.name })
      .where(eq(estatesTable.id, user.estateId!));

    res.redirect('/manager/estate');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
