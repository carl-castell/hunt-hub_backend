import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '@/app';
import { db } from '@/db';
import { usersTable, estatesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

describe('Auth Integration Tests', () => {
  const testUser = {
    email: 'auth-test@example.com',
    password: 'TestPassword123!',
    hashedPassword: '',
  };

let testEstateId: number;

beforeAll(async () => {
  testUser.hashedPassword = await bcrypt.hash(testUser.password, 10);

  const [estate] = await db
    .insert(estatesTable)
    .values({ name: 'Test Estate' })
    .returning();

  testEstateId = estate.id;

  await db.insert(usersTable).values({
    firstName: 'Test',
    lastName:  'User',
    email:     testUser.email,
    password:  testUser.hashedPassword,
    role:      'manager',
    active:    true,
    estateId:  testEstateId,
  });
});

afterAll(async () => {
  await db.delete(usersTable).where(eq(usersTable.email, testUser.email));
  await db.delete(estatesTable).where(eq(estatesTable.id, testEstateId));
});


  // ── POST /login ────────────────────────────────────────────────────────────

  describe('POST /login', () => {
    it('should login successfully with correct credentials and redirect by role', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/manager');
    });

    it('should re-render login page on wrong password', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: testUser.email, password: 'WrongPassword!' });

      // Route re-renders login page on bad credentials (HTTP 200)
      expect(res.status).toBe(200);
    });

    it('should re-render login page for unknown email', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: 'nobody@example.com', password: 'whatever' });

      // Route re-renders login page on bad credentials (HTTP 200)
      expect(res.status).toBe(200);
    });

    it('should re-render login page on Zod validation failure (missing fields)', async () => {
      const res = await request(app)
        .post('/login')
        .send({ email: '', password: '' });

      // Zod validation failure re-renders login page (HTTP 200)
      expect(res.status).toBe(200);
    });

    it('should re-render login page for inactive user', async () => {
      await db
        .update(usersTable)
        .set({ active: false })
        .where(eq(usersTable.email, testUser.email));

      const res = await request(app)
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });

      // Route re-renders login page on bad credentials (HTTP 200)
      expect(res.status).toBe(200);

      // restore
      await db
        .update(usersTable)
        .set({ active: true })
        .where(eq(usersTable.email, testUser.email));
    });

    it('should redirect already-logged-in user away from /login', async () => {
      const agent = request.agent(app);

      await agent
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await agent.get('/login');

      expect(res.status).toBe(302);
      expect(res.headers.location).not.toBe('/login');
    });
  });

  // ── POST /logout ───────────────────────────────────────────────────────────

  describe('POST /logout', () => {
    it('should logout and redirect to /login', async () => {
      const agent = request.agent(app);

      await agent
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await agent.post('/logout');

      // logout always destroys session and redirects to /login (HTTP 302)
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/login');
    });

    it('should redirect to /login even when not logged in', async () => {
      const res = await request(app).post('/logout');

      // logout always destroys session and redirects to /login (HTTP 302)
      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/login');
    });
  });

  // ── Protected route guards ─────────────────────────────────────────────────

  describe('Protected routes', () => {
    it('should redirect unauthenticated user to /login', async () => {
      const res = await request(app).get('/manager');

      expect(res.status).toBe(302);
      expect(res.headers.location).toBe('/login');
    });

    it('should allow authenticated manager to access /manager', async () => {
      const agent = request.agent(app);

      const loginRes = await agent
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });

      console.log('LOGIN STATUS:', loginRes.status);
      console.log('LOGIN REDIRECT:', loginRes.headers.location);

      const res = await agent.get('/manager');
      console.log('MANAGER BODY:', res.text);

      expect(res.status).toBe(200);
    });

    it('should return 403 if manager tries to access /admin', async () => {
      const agent = request.agent(app);

      await agent
        .post('/login')
        .send({ email: testUser.email, password: testUser.password });

      const res = await agent.get('/admin');

      expect(res.status).toBe(403);
    });
  });
});
