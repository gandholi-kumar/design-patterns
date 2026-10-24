import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS } from '../data';
import {
  buildProjectFiles,
  BLANK_PATTERN,
  type PlaygroundCodeSource,
} from '../data/playground-starters';

describe('Playground Perspectives (Canonical, Enterprise, Curated) Unit Tests', () => {
  it('generates canonical TypeScript code for all 23 GoF patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'typescript', 'canonical');
      assert.ok(Array.isArray(files), `Files must be array for ${pattern.id}`);
      assert.ok(files.length >= 1, `Must have at least 1 file for ${pattern.id}`);

      const entryFile = files.find((f) => f.isEntryPoint);
      assert.ok(entryFile, `Must have entry point for ${pattern.id}`);
      assert.ok(entryFile.content.length > 50, `Content must be substantial for ${pattern.id}`);
      assert.ok(entryFile.name.endsWith('.ts'), `Entry file must be .ts for ${pattern.id}`);
    }
  });

  it('generates enterprise TypeScript code for all 23 GoF patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'typescript', 'enterprise');
      assert.ok(Array.isArray(files), `Files must be array for ${pattern.id}`);
      assert.ok(files.length >= 1, `Must have at least 1 file for ${pattern.id}`);

      const entryFile = files.find((f) => f.isEntryPoint);
      assert.ok(entryFile, `Must have entry point for ${pattern.id}`);
      assert.ok(entryFile.content.length > 50, `Content must be substantial for ${pattern.id}`);
      assert.ok(entryFile.name.endsWith('.ts'), `Entry file must be .ts for ${pattern.id}`);
    }
  });

  it('differentiates canonical and enterprise code implementations', () => {
    const factoryCanonical = buildProjectFiles(PATTERNS[0], 'typescript', 'canonical');
    const factoryEnterprise = buildProjectFiles(PATTERNS[0], 'typescript', 'enterprise');

    assert.notEqual(
      factoryCanonical[0].content,
      factoryEnterprise[0].content,
      'Canonical and Enterprise code snippets must be distinct'
    );
  });

  it('generates curated multi-file modular projects for all 23 GoF patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'typescript', 'curated');
      assert.ok(Array.isArray(files));
      assert.ok(files.length >= 1, `Curated project for ${pattern.id} must have files`);

      const entry = files.find((f) => f.isEntryPoint);
      assert.ok(entry, `Curated project for ${pattern.id} must have an entry point`);
    }
  });

  it('generates canonical Java projects with valid entry points for all 23 patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'java', 'canonical');
      assert.ok(Array.isArray(files));
      assert.ok(files.length >= 1);

      const entry = files.find((f) => f.isEntryPoint);
      assert.ok(entry, `Canonical Java for ${pattern.id} must have entry point`);
      assert.ok(
        entry.content.includes('public static void main'),
        `Entry point for ${pattern.id} must contain main method`
      );
    }
  });

  it('generates enterprise Java projects with valid entry points for all 23 patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'java', 'enterprise');
      assert.ok(Array.isArray(files));
      assert.ok(files.length >= 1);

      const entry = files.find((f) => f.isEntryPoint);
      assert.ok(entry, `Enterprise Java for ${pattern.id} must have entry point`);
      assert.ok(
        entry.content.includes('public static void main'),
        `Entry point for ${pattern.id} must contain main method`
      );
    }
  });

  it('returns clean blank scratchpad for BLANK_PATTERN regardless of perspective source', () => {
    const sources: PlaygroundCodeSource[] = ['canonical', 'enterprise', 'curated'];
    for (const source of sources) {
      const tsFiles = buildProjectFiles(BLANK_PATTERN, 'typescript', source);
      assert.equal(tsFiles.length, 1);
      assert.equal(tsFiles[0].name, 'index.ts');
      assert.ok(tsFiles[0].content.includes('run();'));

      const javaFiles = buildProjectFiles(BLANK_PATTERN, 'java', source);
      assert.equal(javaFiles.length, 1);
      assert.equal(javaFiles[0].name, 'Main.java');
      assert.ok(javaFiles[0].content.includes('public static void run()'));
    }
  });
});
