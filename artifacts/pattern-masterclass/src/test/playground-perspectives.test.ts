import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS } from '../data';
import {
  buildProjectFiles,
  BLANK_PATTERN,
  type PlaygroundCodeSource,
} from '../data/playground-starters';
import { getLanguageForFile } from '../components/PlaygroundCodeEditor';

describe('Playground Perspectives (Canonical, Enterprise, Curated) Unit Tests', () => {
  it('generates canonical TypeScript code as modular multi-file projects for all 23 GoF patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'typescript', 'canonical');
      assert.ok(Array.isArray(files), `Files must be array for ${pattern.id}`);
      assert.ok(files.length >= 2, `Canonical TS must be modular with at least 2 files for ${pattern.id}`);

      // Tab 0 must be index.ts entrypoint
      assert.equal(files[0].name, 'index.ts', `Tab 0 must be index.ts for ${pattern.id}`);
      assert.equal(files[0].isEntryPoint, true, `Tab 0 must be entry point for ${pattern.id}`);
      assert.ok(files[0].content.includes(`from './`), `index.ts must import from module for ${pattern.id}`);

      // Verify no unused imported variables in index.ts
      const importMatch = files[0].content.match(/import\s*\{\s*([\s\S]*?)\s*\}\s*from/);
      if (importMatch) {
        const importedSymbols = importMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
        const body = files[0].content.slice((importMatch.index ?? 0) + importMatch[0].length);
        for (const symbol of importedSymbols) {
          const isUsed = new RegExp(`\\b${symbol}\\b`).test(body);
          assert.ok(isUsed, `Canonical ${pattern.id} imports '${symbol}' in index.ts but never uses it`);
        }
      }
    }
  });

  it('generates enterprise TypeScript code as modular multi-file projects for all 23 GoF patterns', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'typescript', 'enterprise');
      assert.ok(Array.isArray(files), `Files must be array for ${pattern.id}`);
      assert.ok(files.length >= 2, `Enterprise TS must be modular with at least 2 files for ${pattern.id}`);

      // Tab 0 must be index.ts entrypoint
      assert.equal(files[0].name, 'index.ts', `Tab 0 must be index.ts for ${pattern.id}`);
      assert.equal(files[0].isEntryPoint, true, `Tab 0 must be entry point for ${pattern.id}`);
      assert.ok(files[0].content.includes(`from './`), `index.ts must import from module for ${pattern.id}`);

      // Verify no unused imported variables in index.ts
      const importMatch = files[0].content.match(/import\s*\{\s*([\s\S]*?)\s*\}\s*from/);
      if (importMatch) {
        const importedSymbols = importMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
        const body = files[0].content.slice((importMatch.index ?? 0) + importMatch[0].length);
        for (const symbol of importedSymbols) {
          const isUsed = new RegExp(`\\b${symbol}\\b`).test(body);
          assert.ok(isUsed, `Enterprise ${pattern.id} imports '${symbol}' in index.ts but never uses it`);
        }
      }
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
      assert.ok(files.length >= 2, `Curated project for ${pattern.id} must have multiple files`);

      assert.equal(files[0].name, 'index.ts', `Curated TS tab 0 must be index.ts for ${pattern.id}`);
      assert.equal(files[0].isEntryPoint, true, `Curated project for ${pattern.id} must have an entry point`);
    }
  });

  it('guarantees Main.java is always the permanent starting tab 0 across all 23 patterns in Canonical Java', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'java', 'canonical');
      assert.ok(Array.isArray(files));
      assert.ok(files.length >= 2, `Canonical Java must be modular for ${pattern.id}`);

      // Primary starting tab MUST be Main.java
      assert.equal(files[0].name, 'Main.java', `Starting tab must be Main.java for ${pattern.id}`);
      assert.equal(files[0].isEntryPoint, true, `Starting tab Main.java must be isEntryPoint for ${pattern.id}`);
      assert.ok(
        files[0].content.includes('public static void main'),
        `Main.java for ${pattern.id} must contain main method`
      );
      assert.ok(
        !files[0].content.includes('Pattern components loaded and initialized from'),
        `Main.java for canonical ${pattern.id} must execute real pattern components instead of static placeholder`
      );
    }
  });

  it('guarantees Main.java is always the permanent starting tab 0 across all 23 patterns in Enterprise Java', () => {
    for (const pattern of PATTERNS) {
      const files = buildProjectFiles(pattern, 'java', 'enterprise');
      assert.ok(Array.isArray(files));
      assert.ok(files.length >= 2, `Enterprise Java must be modular for ${pattern.id}`);

      // Primary starting tab MUST be Main.java
      assert.equal(files[0].name, 'Main.java', `Starting tab must be Main.java for ${pattern.id}`);
      assert.equal(files[0].isEntryPoint, true, `Starting tab Main.java must be isEntryPoint for ${pattern.id}`);
      assert.ok(
        files[0].content.includes('public static void main'),
        `Main.java for ${pattern.id} must contain main method`
      );
      assert.ok(
        !files[0].content.includes('Pattern components loaded and initialized from'),
        `Main.java for enterprise ${pattern.id} must execute real pattern components instead of static placeholder`
      );
    }
  });

  it('verifies visitor curated java project file name matches single public interface DocumentElement', () => {
    const visitor = PATTERNS.find((p) => p.id === 'visitor')!;
    const files = buildProjectFiles(visitor, 'java', 'curated');
    assert.ok(files.some((f) => f.name === 'DocumentElement.java'), 'Must be named DocumentElement.java without plural s');
    assert.ok(!files.some((f) => f.name === 'DocumentElements.java'), 'Must not have DocumentElements.java');
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

  it('accurately identifies file type language via getLanguageForFile to prevent IntelliSense loss', () => {
    // TypeScript files
    assert.equal(getLanguageForFile('index.ts', 'java'), 'typescript');
    assert.equal(getLanguageForFile('Dialog.ts', 'java'), 'typescript');
    assert.equal(getLanguageForFile('Component.tsx', 'java'), 'typescript');
    assert.equal(getLanguageForFile('/src/models/item.ts', 'java'), 'typescript');

    // Java files
    assert.equal(getLanguageForFile('Main.java', 'typescript'), 'java');
    assert.equal(getLanguageForFile('House.java', 'typescript'), 'java');
    assert.equal(getLanguageForFile('/app/Dialog.java', 'typescript'), 'java');

    // Fallback when extension absent
    assert.equal(getLanguageForFile('scratchpad', 'typescript'), 'typescript');
    assert.equal(getLanguageForFile('scratchpad', 'java'), 'java');
    assert.equal(getLanguageForFile(undefined, 'typescript'), 'typescript');
  });

  it('guarantees all project files across all 23 patterns in all perspectives resolve to their matching language', () => {
    const sources: PlaygroundCodeSource[] = ['canonical', 'enterprise', 'curated'];
    for (const pattern of PATTERNS) {
      for (const source of sources) {
        const tsFiles = buildProjectFiles(pattern, 'typescript', source);
        for (const file of tsFiles) {
          const lang = getLanguageForFile(file.name, 'typescript');
          assert.equal(lang, 'typescript', `File ${file.name} in ${pattern.id} (${source}) must resolve to typescript`);
        }

        const javaFiles = buildProjectFiles(pattern, 'java', source);
        for (const file of javaFiles) {
          const lang = getLanguageForFile(file.name, 'java');
          assert.equal(lang, 'java', `File ${file.name} in ${pattern.id} (${source}) must resolve to java`);
        }
      }
    }
  });
});
