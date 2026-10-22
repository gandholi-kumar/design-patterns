import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS, QUIZ } from '../data';
import { getPatternDiagram, PATTERN_DIAGRAMS } from '../pattern-diagrams';
import { CANONICAL_DATA } from '../data/canonical-data';
import { ENTERPRISE_DATA } from '../data/enterprise-data';

describe('Frontend Data & Diagrams: Integrity Unit Tests', () => {
  it('contains exactly the 23 canonical Gang of Four design patterns', () => {
    assert.equal(PATTERNS.length, 23);
    const ids = new Set(PATTERNS.map((p) => p.id));
    assert.equal(ids.size, 23);

    const categories = PATTERNS.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});

    // 5 Creational, 7 Structural, 11 Behavioral
    assert.equal(categories['Creational'], 5);
    assert.equal(categories['Structural'], 7);
    assert.equal(categories['Behavioral'], 11);
  });

  it('guarantees each pattern has non-empty essential metadata and code blocks', () => {
    for (const p of PATTERNS) {
      assert.ok(p.id, `Pattern has ID`);
      assert.ok(p.name, `Pattern ${p.id} has name`);
      assert.ok(p.intent, `Pattern ${p.id} has intent`);
      assert.ok(p.problem, `Pattern ${p.id} has problem`);
      assert.ok(p.solution, `Pattern ${p.id} has solution`);
      assert.ok(p.typeScriptImplementation.code, `Pattern ${p.id} has TypeScript code`);
      assert.ok(p.javaImplementation.code, `Pattern ${p.id} has Java code`);
      assert.ok(Array.isArray(p.whenToUse), `Pattern ${p.id} has whenToUse array`);
      assert.ok(Array.isArray(p.whenNotToUse), `Pattern ${p.id} has whenNotToUse array`);
      assert.ok(p.runnableCode, `Pattern ${p.id} has runnable code`);
    }
  });

  it('validates quiz scenario questions and answer keys', () => {
    assert.ok(QUIZ.length >= 3);
    for (const q of QUIZ) {
      assert.ok(q.id);
      assert.ok(q.systemScenario);
      assert.ok(q.options.length >= 2);
      assert.ok(q.options.some((o) => o.isCorrect));
      assert.ok(q.deepExplanation);
      assert.ok(q.correctPattern);
    }
  });

  it('provides perspective-aware diagrams for all 23 patterns (canonical & enterprise)', () => {
    for (const p of PATTERNS) {
      const canonicalDiagram = getPatternDiagram(p.id, 'canonical');
      assert.ok(canonicalDiagram, `Canonical diagram exists for ${p.id}`);
      assert.ok(canonicalDiagram.uml.length > 0);
      assert.ok(canonicalDiagram.mermaid.length > 0);

      const enterpriseDiagram = getPatternDiagram(p.id, 'enterprise-cloud');
      assert.ok(enterpriseDiagram, `Enterprise diagram exists for ${p.id}`);
      assert.ok(enterpriseDiagram.uml.length > 0);
      assert.ok(enterpriseDiagram.mermaid.length > 0);

      assert.ok(PATTERN_DIAGRAMS[p.id], `Static PATTERN_DIAGRAMS entry exists for ${p.id}`);
    }

    // Handles undefined/missing pattern
    const missing = getPatternDiagram('non-existent-pattern');
    assert.equal(missing, undefined);
  });

  it('matches all keys between CANONICAL_DATA and ENTERPRISE_DATA', () => {
    const canonicalKeys = Object.keys(CANONICAL_DATA).sort();
    const enterpriseKeys = Object.keys(ENTERPRISE_DATA).sort();
    assert.deepEqual(canonicalKeys, enterpriseKeys);
  });
});
