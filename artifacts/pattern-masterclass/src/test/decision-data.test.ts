import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  GOF_PRINCIPLES,
  RAPID_HEURISTICS,
  CAUSES_OF_REDESIGN,
  CAUSE_GOF_MAPPING,
  ENGINEERING_CONSTRAINTS,
  PRODUCTION_SCENARIOS,
  SIBLING_DILEMMAS,
  GOF_PATTERN_ASPECTS,
} from '../pages/decision/decision-data';
import { PATTERNS } from '../data';

describe('Frontend Decision Engine: Dataset Integrity Unit Tests', () => {
  const patternIdSet = new Set(PATTERNS.map((p) => p.id));

  it('validates GoF core principles structure', () => {
    assert.equal(GOF_PRINCIPLES.length, 3);
    assert.equal(GOF_PRINCIPLES[0].num, '01');
    assert.equal(GOF_PRINCIPLES[1].num, '02');
    assert.equal(GOF_PRINCIPLES[2].num, '03');
    for (const p of GOF_PRINCIPLES) {
      assert.ok(p.title);
      assert.ok(p.body);
    }
  });

  it('validates rapid heuristics cover all 23 patterns with triggers and recommendations', () => {
    assert.equal(RAPID_HEURISTICS.length, 23);
    for (const h of RAPID_HEURISTICS) {
      assert.ok(h.trigger);
      assert.ok(h.recommendation);
    }
  });

  it('validates causes of redesign and their GoF pattern mappings', () => {
    assert.ok(CAUSES_OF_REDESIGN.length > 0);
    for (const cause of CAUSES_OF_REDESIGN) {
      assert.ok(cause.key);
      assert.ok(cause.label);
      const mapping = CAUSE_GOF_MAPPING[cause.key];
      assert.ok(mapping, `Mapping exists for cause ${cause.key}`);
      assert.ok(mapping.canonicalPatterns.length > 0);
      for (const pid of mapping.canonicalPatterns) {
        assert.ok(patternIdSet.has(pid), `Pattern ${pid} in cause mapping is valid GoF pattern`);
      }
    }
  });

  it('validates engineering constraints array', () => {
    assert.ok(ENGINEERING_CONSTRAINTS.length > 0);
    for (const c of ENGINEERING_CONSTRAINTS) {
      assert.ok(c.key);
      assert.ok(c.label);
    }
  });

  it('validates production scenarios have valid pattern references and trade-offs', () => {
    assert.ok(PRODUCTION_SCENARIOS.length >= 10);
    for (const s of PRODUCTION_SCENARIOS) {
      assert.ok(s.id);
      assert.ok(s.title);
      assert.ok(s.category);
      assert.ok(patternIdSet.has(s.primaryPatternId), `Primary pattern ${s.primaryPatternId} is valid`);
      assert.ok(patternIdSet.has(s.runnerUpPatternId), `Runner-up pattern ${s.runnerUpPatternId} is valid`);
      assert.notEqual(s.primaryPatternId, s.runnerUpPatternId);
      assert.ok(s.confidence >= 50 && s.confidence <= 100);
      assert.ok(s.runnerUpConfidence >= 40 && s.runnerUpConfidence <= 100);
      assert.ok(s.gains.length > 0);
      assert.ok(s.taxes.length > 0);
    }
  });

  it('validates sibling dilemmas have valid patterns and decisive rules', () => {
    assert.ok(SIBLING_DILEMMAS.length >= 5);
    for (const d of SIBLING_DILEMMAS) {
      assert.ok(d.id);
      assert.ok(d.title);
      assert.ok(d.category);
      assert.ok(patternIdSet.has(d.patternA.id), `Pattern A ${d.patternA.id} is valid`);
      assert.ok(patternIdSet.has(d.patternB.id), `Pattern B ${d.patternB.id} is valid`);
      assert.ok(d.decisiveRule);
      assert.ok(d.whenToPickA.length > 0);
      assert.ok(d.whenToPickB.length > 0);
    }
  });

  it('validates GoF pattern aspects covers all 23 patterns', () => {
    for (const p of PATTERNS) {
      const aspect = GOF_PATTERN_ASPECTS[p.id];
      assert.ok(aspect, `Aspect defined for pattern ${p.id}`);
      assert.ok(aspect.aspectThatVaries);
      assert.ok(aspect.intent);
    }
  });
});
