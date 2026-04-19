import { Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { guestsTable } from '../../db/schema/guests';
import { z } from 'zod';

const updateGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  phone:     z.string().min(1),
});

const createGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName:  z.string().min(1),
  email:     z.string().email(),
  phone:     z.string().min(1),
});

export async function getGuests(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { search, sortBy } = req.query as { search?: string; sortBy?: string };

    let guests = await db
      .select()
      .from(guestsTable)
      .where(eq(guestsTable.estateId, user.estateId!));

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      guests = guests.filter(g => {
        const full = `${g.firstName} ${g.lastName}`.toLowerCase();
        return full.includes(term) || levenshteinDistance(full, term) <= 3;
      });
    }

    if (sortBy === 'firstName') {
      guests.sort((a, b) => a.firstName.localeCompare(b.firstName));
    } else if (sortBy === 'lastName') {
      guests.sort((a, b) => a.lastName.localeCompare(b.lastName));
    }

    res.render('manager/guests', { title: 'Guests', user, guests, search: search ?? '', sortBy: sortBy ?? '' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function getNewGuest(req: Request, res: Response) {
  res.render('manager/guest-new', { title: 'Add Guest', user: req.session.user!, error: null });
}

export async function postCreateGuest(req: Request, res: Response) {
  try {
    const user = req.session.user!;

    const result = createGuestSchema.safeParse(req.body);
    if (!result.success) {
      return res.render('manager/guest-new', {
        title: 'Add Guest',
        user,
        error: result.error.issues[0].message,
      });
    }

    const [newGuest] = await db
      .insert(guestsTable)
      .values({
        ...result.data,
        estateId: user.estateId!,
      })
      .returning();

    res.redirect(`/manager/guests/${newGuest.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function getGuest(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [guest] = await db
      .select()
      .from(guestsTable)
      .where(eq(guestsTable.id, Number(id)))
      .limit(1);

    if (!guest || guest.estateId !== user.estateId) return res.status(404).send('Guest not found');

    res.render('manager/guest', { title: 'Guest', user, guest });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postUpdateGuest(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [guest] = await db
      .select()
      .from(guestsTable)
      .where(eq(guestsTable.id, Number(id)))
      .limit(1);

    if (!guest || guest.estateId !== user.estateId) return res.status(404).send('Guest not found');

    const result = updateGuestSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    await db
      .update(guestsTable)
      .set(result.data)
      .where(eq(guestsTable.id, Number(id)));

    res.redirect(`/manager/guests/${id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function postDeleteGuest(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [guest] = await db
      .select()
      .from(guestsTable)
      .where(eq(guestsTable.id, Number(id)))
      .limit(1);

    if (!guest || guest.estateId !== user.estateId) return res.status(404).send('Guest not found');

    await db.delete(guestsTable).where(eq(guestsTable.id, Number(id)));

    res.redirect('/manager/guests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

// ── Levenshtein distance for fuzzy search ─────────────────────────────────────
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
