import { describe, it, expect, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  requireAuth,
  requireAdmin,
  requireManager,
  requireStaff,
  requireEstateAccess,
} from '@/middlewares/requireRole';

function mockReq(overrides: Partial<Request> = {}): Partial<Request> {
  return {
    session: {} as any,
    params: {},
    ...overrides,
  };
}

function mockRes(): Partial<Response> {
  return {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    redirect: vi.fn().mockReturnThis(),
  };
}

function mockNext(): NextFunction {
  return vi.fn();
}

// ── requireAuth ───────────────────────────────────────────────────────────────

describe('requireAuth', () => {
  it('calls next() if session user exists', () => {
    const req = mockReq({ session: { user: { id: 1, role: 'admin' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireAuth(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.redirect).not.toHaveBeenCalled();
  });

  it('redirects to /login if no session user', () => {
    const req = mockReq({ session: {} as any });
    const res = mockRes();
    const next = mockNext();

    requireAuth(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});

// ── requireAdmin ──────────────────────────────────────────────────────────────

describe('requireAdmin', () => {
  it('calls next() if user is admin', () => {
    const req = mockReq({ session: { user: { id: 1, role: 'admin' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireAdmin(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 if user is not admin', () => {
    const req = mockReq({ session: { user: { id: 2, role: 'manager' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to /login if no session', () => {
    const req = mockReq({ session: {} as any });
    const res = mockRes();
    const next = mockNext();

    requireAdmin(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});

// ── requireManager ────────────────────────────────────────────────────────────

describe('requireManager', () => {
  it('calls next() if user is manager', () => {
    const req = mockReq({ session: { user: { id: 1, role: 'manager' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireManager(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 if user is not manager', () => {
    const req = mockReq({ session: { user: { id: 2, role: 'admin' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireManager(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to /login if no session', () => {
    const req = mockReq({ session: {} as any });
    const res = mockRes();
    const next = mockNext();

    requireManager(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});

// ── requireStaff ──────────────────────────────────────────────────────────────

describe('requireStaff', () => {
  it('calls next() if user is staff', () => {
    const req = mockReq({ session: { user: { id: 1, role: 'staff' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireStaff(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 if user is not staff', () => {
    const req = mockReq({ session: { user: { id: 2, role: 'admin' } } as any });
    const res = mockRes();
    const next = mockNext();

    requireStaff(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to /login if no session', () => {
    const req = mockReq({ session: {} as any });
    const res = mockRes();
    const next = mockNext();

    requireStaff(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});

// ── requireEstateAccess ───────────────────────────────────────────────────────

describe('requireEstateAccess', () => {
  it('calls next() if user is admin', () => {
    const req = mockReq({
      session: { user: { id: 1, role: 'admin', estateId: null } } as any,
      params: { id: '5' },
    });
    const res = mockRes();
    const next = mockNext();

    requireEstateAccess(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('calls next() if manager estateId matches param id', () => {
    const req = mockReq({
      session: { user: { id: 2, role: 'manager', estateId: 5 } } as any,
      params: { id: '5' },
    });
    const res = mockRes();
    const next = mockNext();

    requireEstateAccess(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('returns 403 if manager estateId does not match param id', () => {
    const req = mockReq({
      session: { user: { id: 2, role: 'manager', estateId: 5 } } as any,
      params: { id: '99' },
    });
    const res = mockRes();
    const next = mockNext();

    requireEstateAccess(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalledWith('Forbidden');
    expect(next).not.toHaveBeenCalled();
  });

  it('redirects to /login if no session', () => {
    const req = mockReq({ session: {} as any, params: { id: '5' } });
    const res = mockRes();
    const next = mockNext();

    requireEstateAccess(req as Request, res as Response, next);

    expect(res.redirect).toHaveBeenCalledWith('/login');
    expect(next).not.toHaveBeenCalled();
  });
});
