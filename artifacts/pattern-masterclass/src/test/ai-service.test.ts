import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeProblemOffline,
  testAndDiscoverAIProvider,
} from '../pages/decision/ai-service';

describe('Frontend Decision Engine: AI Service & Offline Heuristic Engine Unit Tests', () => {
  describe('analyzeProblemOffline', () => {
    it('accurately resolves Strategy pattern when algorithm/pricing forces are present', () => {
      const verdict = analyzeProblemOffline(
        'We need to switch pricing calculation algorithms and discount rules at runtime.'
      );
      assert.equal(verdict.primaryPattern.id, 'strategy');
      assert.equal(verdict.primaryPattern.name, 'Strategy');
      assert.equal(verdict.primaryPattern.category, 'Behavioral');
      assert.ok(verdict.primaryPattern.confidence >= 70);
      assert.ok(verdict.tradeOffDilemma.primaryGains.length > 0);
    });

    it('accurately resolves Adapter pattern for legacy third-party incompatible interfaces', () => {
      const verdict = analyzeProblemOffline(
        'Integrating legacy third party SOAP service with incompatible modern interface.'
      );
      assert.equal(verdict.primaryPattern.id, 'adapter');
      assert.equal(verdict.primaryPattern.category, 'Structural');
    });

    it('accurately resolves Command pattern for reversible undo redo operations', () => {
      const verdict = analyzeProblemOffline(
        'Build a reversible queue command with multi-level undo and redo action objects.'
      );
      assert.equal(verdict.primaryPattern.id, 'command');
      assert.equal(verdict.primaryPattern.category, 'Behavioral');
    });

    it('accurately resolves Observer pattern for publish subscribe event broadcasting', () => {
      const verdict = analyzeProblemOffline(
        'Broadcast event updates to decoupled subscriber listeners across components.'
      );
      assert.equal(verdict.primaryPattern.id, 'observer');
    });

    it('accurately resolves State pattern for lifecycle stages and transitions', () => {
      const verdict = analyzeProblemOffline(
        'Manage order stages and status transitions in a state machine.'
      );
      assert.equal(verdict.primaryPattern.id, 'state');
    });

    it('accurately resolves Composite pattern for tree hierarchy and group leaves', () => {
      const verdict = analyzeProblemOffline(
        'Render a tree hierarchy of leaf nodes and grouped container shapes on canvas.'
      );
      assert.equal(verdict.primaryPattern.id, 'composite');
    });

    it('accurately resolves Facade pattern for subsystem simplified entry points', () => {
      const verdict = analyzeProblemOffline(
        'Simplify entry point and orchestrate complex video encoding subsystem.'
      );
      assert.equal(verdict.primaryPattern.id, 'facade');
    });

    it('accurately resolves Decorator pattern for dynamic capability wrapping', () => {
      const verdict = analyzeProblemOffline(
        'Wrap streaming responses with dynamic capability middleware without subclassing.'
      );
      assert.equal(verdict.primaryPattern.id, 'decorator');
    });

    it('accurately resolves Proxy pattern for auth guard, lazy loading, and caching', () => {
      const verdict = analyzeProblemOffline(
        'Implement an auth guard and lazy loading cache surrogate for heavy assets.'
      );
      assert.equal(verdict.primaryPattern.id, 'proxy');
    });

    it('accurately resolves Abstract Factory pattern for family of cloud products', () => {
      const verdict = analyzeProblemOffline(
        'Instantiate a compatible suite and matched family of cloud storage and compute services.'
      );
      assert.equal(verdict.primaryPattern.id, 'abstract-factory');
    });

    it('accurately resolves Builder pattern for complex step-by-step object construction', () => {
      const verdict = analyzeProblemOffline(
        'Step by step construction of complex multi-clause SQL query objects.'
      );
      assert.equal(verdict.primaryPattern.id, 'builder');
    });

    it('accurately resolves Prototype pattern for pre-configured template cloning', () => {
      const verdict = analyzeProblemOffline(
        'Clone and copy pre-configured server configuration templates without re-instantiation.'
      );
      assert.equal(verdict.primaryPattern.id, 'prototype');
    });

    it('accurately resolves Singleton pattern for strict single instance with global access', () => {
      const verdict = analyzeProblemOffline(
        'Ensure single instance global access point to connection pool.'
      );
      assert.equal(verdict.primaryPattern.id, 'singleton');
    });

    it('accurately resolves Chain of Responsibility for request filtering pipelines', () => {
      const verdict = analyzeProblemOffline(
        'Pass request along a sequence pipeline of specialized validation handlers and filters.'
      );
      assert.equal(verdict.primaryPattern.id, 'chain-of-responsibility');
    });

    it('accurately resolves Visitor for AST linting and node tree inspection', () => {
      const verdict = analyzeProblemOffline(
        'Inspect AST syntax elements with a linter and visitor without modifying node classes.'
      );
      assert.equal(verdict.primaryPattern.id, 'visitor');
    });

    it('accurately resolves Memento for state snapshot checkpoints and rollbacks', () => {
      const verdict = analyzeProblemOffline(
        'Capture checkpoint snapshots and restore state rollbacks without violating encapsulation.'
      );
      assert.equal(verdict.primaryPattern.id, 'memento');
    });

    it('accurately resolves Mediator for chat coordinator hubs', () => {
      const verdict = analyzeProblemOffline(
        'Centralize many to many message coordination through a central hub.'
      );
      assert.equal(verdict.primaryPattern.id, 'mediator');
    });

    it('accurately resolves Bridge for two independent dimensions and platforms', () => {
      const verdict = analyzeProblemOffline(
        'Decouple abstraction along two dimensions for platform independent rendering.'
      );
      assert.equal(verdict.primaryPattern.id, 'bridge');
    });

    it('accurately resolves Template Method for fixed skeleton steps and subclass hooks', () => {
      const verdict = analyzeProblemOffline(
        'Define invariant processing skeleton with fixed steps and customizable subclass hook.'
      );
      assert.equal(verdict.primaryPattern.id, 'template-method');
    });

    it('defaults gracefully to Strategy when no specific keywords are detected', () => {
      const verdict = analyzeProblemOffline('Unspecified generic software design dilemma.');
      assert.ok(verdict.primaryPattern.id);
      assert.ok(verdict.runnerUpPattern.id);
      assert.notEqual(verdict.primaryPattern.id, verdict.runnerUpPattern.id);
    });
  });

  describe('testAndDiscoverAIProvider', () => {
    it('returns immediate success for managed provider', async () => {
      const res = await testAndDiscoverAIProvider({
        provider: 'managed',
        apiKey: '',
      });
      assert.equal(res.success, true);
      assert.ok(res.selectedModel);
    });

    it('returns failure when API key is missing for key-required providers', async () => {
      const res = await testAndDiscoverAIProvider({
        provider: 'gemini',
        apiKey: '',
      });
      assert.equal(res.success, false);
      assert.equal(res.message, 'Please enter an API key.');
    });

    it('handles unreachable local Ollama gracefully without crashing', async () => {
      const res = await testAndDiscoverAIProvider({
        provider: 'ollama',
        apiKey: '',
        customEndpoint: 'http://127.0.0.1:54321', // Unreachable port
      });
      assert.equal(res.success, false);
      assert.ok(res.message.includes('Ollama'));
    });

    it('rejects unsupported provider safely', async () => {
      const res = await testAndDiscoverAIProvider({
        provider: 'unsupported' as any,
        apiKey: 'dummy-key',
      });
      assert.equal(res.success, false);
      assert.ok(res.message.includes('Unsupported provider'));
    });
  });
});
