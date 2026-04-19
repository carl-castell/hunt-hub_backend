import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { areasTable } from '../../db/schema/areas';
import { standsTable } from '../../db/schema/stands';
import { z } from 'zod';

const areaNameSchema = z.object({
  name: z.string().min(1).max(255),
});

const deleteConfirmSchema = z.object({
  confirm: z.string(),
});

export async function getArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select()
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    res.render('manager/area', { title: 'Areas', user, area });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postCreateArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const result = areaNameSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    const [area] = await db
      .insert(areasTable)
      .values({ name: result.data.name, estateId: user.estateId! })
      .returning();

    res.redirect(`/manager/areas/${area.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postRenameArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select()
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    const result = areaNameSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    await db
      .update(areasTable)
      .set({ name: result.data.name })
      .where(eq(areasTable.id, Number(id)));

    res.redirect(`/manager/areas/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postDeleteArea(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [area] = await db
      .select()
      .from(areasTable)
      .where(eq(areasTable.id, Number(id)))
      .limit(1);

    if (!area || area.estateId !== user.estateId) return res.status(404).send('Area not found');

    const result = deleteConfirmSchema.safeParse(req.body);
    if (!result.success || result.data.confirm !== area.name) {
      return res.status(400).send('Confirmation name does not match.');
    }

    // cascade delete stands first
    await db.delete(standsTable).where(eq(standsTable.areaId, Number(id)));
    await db.delete(areasTable).where(eq(areasTable.id, Number(id)));

    res.redirect('/manager/estate');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}
