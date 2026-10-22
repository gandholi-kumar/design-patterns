import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
}

function handleAppError(
  err: AppError,
  res: {
    headersSent: boolean;
    statusCode: number;
    body: unknown;
    status: (code: number) => any;
    json: (payload: unknown) => any;
  }
) {
  if (res.headersSent) return;

  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: statusCode === 500 ? 'Internal server error' : err.message,
    },
  });
}

describe('Backend API: Centralized Error Handler Middleware Rules', () => {
  function createResponseMock() {
    const res = {
      headersSent: false,
      statusCode: 200,
      body: null as unknown,
      status(code: number) {
        res.statusCode = code;
        return res;
      },
      json(data: unknown) {
        res.body = data;
        return res;
      },
    };
    return res;
  }

  it('masks internal 500 exceptions and prevents stack trace leakage', () => {
    const internalError: AppError = new Error('Sensitive PostgreSQL connection string in memory');
    internalError.stack = 'SecretStack: /var/secrets/key.pem:42';

    const res = createResponseMock();
    handleAppError(internalError, res);

    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
      },
    });
    // Explicitly verify that raw stack traces and internal secrets are NEVER in client response
    assert.equal((res.body as any).error.stack, undefined);
    assert.doesNotMatch(JSON.stringify(res.body), /Sensitive PostgreSQL/);
  });

  it('preserves client-facing 4xx operational status codes and explicit messages', () => {
    const notFoundError: AppError = new Error("Pattern 'visitor' has no persisted notes");
    notFoundError.statusCode = 404;
    notFoundError.code = 'RESOURCE_NOT_FOUND';

    const res = createResponseMock();
    handleAppError(notFoundError, res);

    assert.equal(res.statusCode, 404);
    assert.deepEqual(res.body, {
      error: {
        code: 'RESOURCE_NOT_FOUND',
        message: "Pattern 'visitor' has no persisted notes",
      },
    });
  });

  it('aborts response formatting if headers have already been sent to client', () => {
    const streamingError: AppError = new Error('Mid-stream TCP reset');
    streamingError.statusCode = 502;

    const res = createResponseMock();
    res.headersSent = true;
    handleAppError(streamingError, res);

    // Should remain untouched
    assert.equal(res.statusCode, 200);
    assert.equal(res.body, null);
  });
});
