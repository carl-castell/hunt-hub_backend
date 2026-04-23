import { Request, Response } from 'express';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { usersTable } from '../../db/schema/users';
import { contactsTable } from '../../db/schema/contacts';
import { huntingLicensesTable, trainingCertificatesTable } from '../../db/schema/licenses';
import { z } from 'zod';

const optionalString = z.string().transform(v => v === '' ? undefined : v).pipe(z.string().min(1).optional());

const createGuestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: optionalString,
  dateOfBirth: optionalString,
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

const updateGuestSchema = createGuestSchema;

export async function getGuests(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { search, sortBy } = req.query as { search?: string; sortBy?: string };

    let rows = await db
      .select()
      .from(contactsTable)
      .innerJoin(usersTable, eq(contactsTable.userId, usersTable.id))
      .where(eq(usersTable.estateId, user.estateId!));

    let guests = rows.map(r => ({ ...r.users, ...r.contacts }));

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

    const { firstName, lastName, email, phone, dateOfBirth, rating } = result.data;

    const [newUser] = await db
      .insert(usersTable)
      .values({ firstName, lastName, role: 'guest', estateId: user.estateId! })
      .returning();

    await db
      .insert(contactsTable)
      .values({ userId: newUser.id, email, phone, dateOfBirth, rating });

    res.redirect(`/manager/guests/${newUser.id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

export async function getGuest(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const guestId = Number(req.params.id);

    if (!Number.isFinite(guestId)) {
      return res.status(400).send('Invalid guest id');
    }

    const [row] = await db
      .select()
      .from(contactsTable)
      .innerJoin(usersTable, eq(contactsTable.userId, usersTable.id))
      .where(eq(contactsTable.userId, guestId))
      .limit(1);

    if (!row || row.users.estateId !== user.estateId) return res.status(404).send('Guest not found');

    const guest = { ...row.users, ...row.contacts };

    const licenses = await db
      .select()
      .from(huntingLicensesTable)
      .where(eq(huntingLicensesTable.userId, guestId))
      .orderBy(desc(huntingLicensesTable.uploadDate));

    const certificates = await db
      .select()
      .from(trainingCertificatesTable)
      .where(eq(trainingCertificatesTable.userId, guestId))
      .orderBy(desc(trainingCertificatesTable.uploadDate));

    res.render('manager/guest', {
      title: 'Guest',
      user,
      guest,
      licenses,
      certificates,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}


export async function postUpdateGuest(req: Request, res: Response) {
  try {
    const user = req.session.user!;
    const { id } = req.params;

    const [row] = await db
      .select()
      .from(contactsTable)
      .innerJoin(usersTable, eq(contactsTable.userId, usersTable.id))
      .where(eq(contactsTable.userId, Number(id)))
      .limit(1);

    if (!row || row.users.estateId !== user.estateId) return res.status(404).send('Guest not found');

    const result = updateGuestSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.issues[0].message);

    const { firstName, lastName, email, phone, dateOfBirth, rating } = result.data;

    await db
      .update(usersTable)
      .set({ firstName, lastName })
      .where(eq(usersTable.id, Number(id)));

    await db
      .update(contactsTable)
      .set({ email, phone, dateOfBirth, rating })
      .where(eq(contactsTable.userId, Number(id)));

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

    const [row] = await db
      .select()
      .from(contactsTable)
      .innerJoin(usersTable, eq(contactsTable.userId, usersTable.id))
      .where(eq(contactsTable.userId, Number(id)))
      .limit(1);

    if (!row || row.users.estateId !== user.estateId) return res.status(404).send('Guest not found');

    await db.delete(usersTable).where(eq(usersTable.id, Number(id)));

    res.redirect('/manager/guests');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
}

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
