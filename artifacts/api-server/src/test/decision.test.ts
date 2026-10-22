import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decisionController, DecisionController } from '../controllers/decision.controller';
import { decisionService, DecisionService } from '../services/decision.service';
import { decisionRepository } from '../repositories/decision.repository';

describe('Backend Decision System: Controller & Service Unit Tests', () => {
  const mockUser = { id: 'usr_architect_42', email: 'architect@enterprise.io' };

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

  describe('DecisionController', () => {
    it('getLedger: returns 200 with decision entries', async () => {
      const originalGetLedger = decisionService.getDecisionLedger;
      const mockEntries = [
        {
          id: 'dec-1',
          userId: mockUser.id,
          primaryPattern: 'strategy',
          runnerUpPattern: 'state',
          confidence: 94,
          problemStatement: 'Dynamic pricing',
          tradeOffs: ['Decoupled'],
          createdAt: new Date(),
        },
      ];

      decisionService.getDecisionLedger = async (uid) => {
        assert.equal(uid, mockUser.id);
        return mockEntries as any;
      };

      try {
        const req = { user: mockUser } as any;
        const res = createMockResponse();

        await decisionController.getLedger(req, res as any, () => {});

        assert.equal(res.statusCode, 200);
        assert.deepEqual((res.body as any).entries, mockEntries);
      } finally {
        decisionService.getDecisionLedger = originalGetLedger;
      }
    });

    it('getLedger: forwards service errors to next()', async () => {
      const originalGetLedger = decisionService.getDecisionLedger;
      const simulatedError = new Error('Ledger retrieval error');
      decisionService.getDecisionLedger = async () => {
        throw simulatedError;
      };

      try {
        const req = { user: mockUser } as any;
        let capturedError: unknown = null;

        await decisionController.getLedger(req, createMockResponse() as any, (err) => {
          capturedError = err;
        });

        assert.equal(capturedError, simulatedError);
      } finally {
        decisionService.getDecisionLedger = originalGetLedger;
      }
    });
  });

  describe('DecisionService', () => {
    const service = new DecisionService();

    it('generateDeterministicVerdict: recommends Strategy for pricing/algorithm/policy keywords', () => {
      const verdict = service.generateDeterministicVerdict(
        'We need interchangeable pricing algorithms for international discount policies.'
      );
      assert.equal(verdict.primaryPattern.id, 'strategy');
      assert.equal(verdict.primaryPattern.name, 'Strategy');
      assert.equal(verdict.primaryPattern.category, 'Behavioral');
      assert.equal(verdict.primaryPattern.confidence, 94);
      assert.equal(verdict.runnerUpPattern.id, 'state');
      assert.ok(verdict.tradeOffDilemma.primaryGains.length > 0);
      assert.ok(verdict.tradeOffDilemma.decisiveDifferentiator);
      assert.ok(verdict.codeSmellWarning);
    });

    it('generateDeterministicVerdict: recommends Command for undo/redo/queue/transaction keywords', () => {
      const verdict = service.generateDeterministicVerdict(
        'Queue operations and support multi-level reversible undo redo commands.'
      );
      assert.equal(verdict.primaryPattern.id, 'command');
      assert.equal(verdict.primaryPattern.name, 'Command');
      assert.equal(verdict.primaryPattern.category, 'Behavioral');
      assert.equal(verdict.primaryPattern.confidence, 92);
      assert.equal(verdict.runnerUpPattern.id, 'memento');
      assert.ok(verdict.tradeOffDilemma.primaryGains.length > 0);
    });

    it('generateDeterministicVerdict: defaults to Factory Method for generic problems', () => {
      const verdict = service.generateDeterministicVerdict(
        'Decouple instantiating heterogeneous reporting entities.'
      );
      assert.equal(verdict.primaryPattern.id, 'factory-method');
      assert.equal(verdict.primaryPattern.name, 'Factory Method');
      assert.equal(verdict.primaryPattern.category, 'Creational');
      assert.equal(verdict.runnerUpPattern.id, 'abstract-factory');
    });

    it('recordDecision: delegates to decisionRepository.recordDecision', async () => {
      const originalRecord = decisionRepository.recordDecision;
      const recordParams = {
        userId: mockUser.id,
        problemStatement: 'Optimize algorithms',
        primaryPattern: 'strategy',
        runnerUpPattern: 'state',
        confidence: 90,
        tradeOffs: ['Decoupled'],
      };

      decisionRepository.recordDecision = async (params) => {
        assert.deepEqual(params, recordParams);
        return { id: 'dec-saved-100', ...params } as any;
      };

      try {
        const saved = await service.recordDecision(recordParams);
        assert.equal(saved.id, 'dec-saved-100');
      } finally {
        decisionRepository.recordDecision = originalRecord;
      }
    });

    it('getDecisionLedger: delegates to decisionRepository.getLedgerByUserId', async () => {
      const originalGetLedger = decisionRepository.getLedgerByUserId;

      decisionRepository.getLedgerByUserId = async (uid) => {
        assert.equal(uid, mockUser.id);
        return [{ id: 'dec-ledger-1' }] as any;
      };

      try {
        const list = await service.getDecisionLedger(mockUser.id);
        assert.equal(list.length, 1);
        assert.equal(list[0].id, 'dec-ledger-1');
      } finally {
        decisionRepository.getLedgerByUserId = originalGetLedger;
      }
    });
  });
});
