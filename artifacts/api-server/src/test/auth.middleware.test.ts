import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middlewares/auth';
import { auth } from '../lib/auth';

describe('Backend Auth Middleware Unit Tests', () => {
  function createMockResponse() {
    const res: {
      statusCode: number;
      body: unknown;
      status: (code: number) => typeof res;
      json: (payload: unknown) => typeof res;
    } = {
      statusCode: 200,
      body: null,
      status(code: number) {
        res.statusCode = code;
        return res;
      },
      json(payload: unknown) {
        res.body = payload;
        return res;
      },
    };
    return res;
  }

  describe('requireAuth', () => {
    it('returns 401 when getSession returns null or session without user', async () => {
      const originalGetSession = (auth.api as any).getSession;
      (auth.api as any).getSession = async () => null as any;

      try {
        const req = { headers: {} } as any;
        const res = createMockResponse();
        let nextCalled = false;

        await requireAuth(req, res as any, () => {
          nextCalled = true;
        });

        assert.equal(nextCalled, false);
        assert.equal(res.statusCode, 401);
        assert.equal((res.body as any).error.code, 'UNAUTHORIZED');
      } finally {
        (auth.api as any).getSession = originalGetSession;
      }
    });

    it('attaches user & session to request and calls next() when valid session returned', async () => {
      const originalGetSession = (auth.api as any).getSession;
      const mockSession = {
        user: { id: 'usr-1', email: 'test@example.com', role: 'member', name: 'Tester' },
        session: { id: 'sess-1', userId: 'usr-1', token: 'token-1', expiresAt: new Date() },
      };

      (auth.api as any).getSession = async () => mockSession as any;

      try {
        const req = { headers: { cookie: 'session=abc' } } as any;
        const res = createMockResponse();
        let nextCalled = false;

        await requireAuth(req, res as any, () => {
          nextCalled = true;
        });

        assert.equal(nextCalled, true);
        assert.equal((req as AuthenticatedRequest).user.id, 'usr-1');
        assert.equal((req as AuthenticatedRequest).session.id, 'sess-1');
      } finally {
        (auth.api as any).getSession = originalGetSession;
      }
    });

    it('catches thrown getSession errors and returns 401 with expired message', async () => {
      const originalGetSession = (auth.api as any).getSession;
      (auth.api as any).getSession = async () => {
        throw new Error('JWT verification signature expired');
      };

      try {
        const req = { headers: {} } as any;
        const res = createMockResponse();
        let nextCalled = false;

        await requireAuth(req, res as any, () => {
          nextCalled = true;
        });

        assert.equal(nextCalled, false);
        assert.equal(res.statusCode, 401);
        assert.equal((res.body as any).error.message, 'Invalid or expired session');
      } finally {
        auth.api.getSession = originalGetSession;
      }
    });
  });

  describe('requireRole', () => {
    it('returns 403 when req.user is undefined', () => {
      const middleware = requireRole(['admin']);
      const req = {} as any;
      const res = createMockResponse();
      let nextCalled = false;

      middleware(req, res as any, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
      assert.equal((res.body as any).error.code, 'FORBIDDEN');
    });

    it('returns 403 when user role is not in allowed roles list', () => {
      const middleware = requireRole(['admin']);
      const req = { user: { role: 'member' } } as any;
      const res = createMockResponse();
      let nextCalled = false;

      middleware(req, res as any, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, false);
      assert.equal(res.statusCode, 403);
    });

    it('calls next() when user role matches allowed roles', () => {
      const middleware = requireRole(['admin', 'member']);
      const req = { user: { role: 'admin' } } as any;
      const res = createMockResponse();
      let nextCalled = false;

      middleware(req, res as any, () => {
        nextCalled = true;
      });

      assert.equal(nextCalled, true);
    });
  });
});
