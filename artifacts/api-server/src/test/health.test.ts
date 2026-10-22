import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HealthCheckResponse } from '@workspace/api-zod';

describe('Backend API: Health Check Endpoint Contract', () => {
  it('successfully validates a healthy status response against Zod schema', () => {
    const rawPayload = { status: 'ok' };
    const validated = HealthCheckResponse.parse(rawPayload);

    assert.equal(validated.status, 'ok');
  });

  it('rejects unexpected or missing status properties according to contract', () => {
    assert.throws(
      () => {
        HealthCheckResponse.parse({ status: 123 });
      },
      (err: unknown) => {
        return err instanceof Error && err.name === 'ZodError';
      }
    );
  });
});
