import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { statement, roles, ac } from '../lib/permissions';

describe('Backend Access Control & RBAC Permissions Unit Tests', () => {
  it('defines valid statements for all GoF application domains', () => {
    assert.deepEqual(statement.pattern, ['read']);
    assert.deepEqual(statement.notes, ['create', 'read', 'update', 'delete']);
    assert.deepEqual(statement.code, ['execute_local', 'execute_sandbox']);
    assert.deepEqual(statement.media, ['upload', 'delete']);
    assert.deepEqual(statement.admin, ['manage_users', 'view_metrics']);
  });

  it('configures distinct access profiles for guest, member, and admin roles', () => {
    assert.ok(roles.guest);
    assert.ok(roles.member);
    assert.ok(roles.admin);
    assert.ok(ac);
  });
});
