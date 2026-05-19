import { describe, it, expect } from 'vitest';
import { createContext } from '@/trpc/context';
import type { Request, Response } from 'express';

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    session: { user: undefined },
    ip: '127.0.0.1',
    ...overrides,
  } as unknown as Request;
}

const res = {} as Response;

describe('createContext', () => {
  it('returns the req, res, session, user, and ip', () => {
    const req = makeReq({ session: { user: { id: 1 } } as any });
    const ctx = createContext({ req, res });

    expect(ctx.req).toBe(req);
    expect(ctx.res).toBe(res);
    expect(ctx.session).toBe(req.session);
    expect(ctx.user).toEqual({ id: 1 });
    expect(ctx.ip).toBe('127.0.0.1');
  });

  it('sets user to null when session has no user', () => {
    const req = makeReq({ session: {} as any });
    const ctx = createContext({ req, res });

    expect(ctx.user).toBeNull();
  });

  it('sets ip to empty string when req.ip is undefined', () => {
    const req = makeReq({ ip: undefined });
    const ctx = createContext({ req, res });

    expect(ctx.ip).toBe('');
  });
});
