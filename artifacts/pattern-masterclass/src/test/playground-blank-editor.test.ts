import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PATTERNS } from '../data';
import {
  BLANK_PROJECT_ID,
  BLANK_PATTERN,
  buildProjectFiles,
  CURATED_JAVA_PROJECTS,
  CURATED_TS_PROJECTS,
} from '../data/playground-starters';

describe('Playground Blank Editor & Scratchpad Unit Tests', () => {
  it('defines the BLANK_PROJECT_ID and BLANK_PATTERN correctly', () => {
    assert.equal(BLANK_PROJECT_ID, 'blank-editor');
    assert.equal(BLANK_PATTERN.id, 'blank-editor');
    assert.equal(BLANK_PATTERN.name, 'Blank Editor (Scratchpad)');
    assert.ok(BLANK_PATTERN.intent.length > 0);
    assert.ok(BLANK_PATTERN.tagline.length > 0);
    assert.ok(BLANK_PATTERN.javaImplementation.explanation.length > 0);
    assert.ok(BLANK_PATTERN.typeScriptImplementation.explanation.length > 0);
  });

  it('preserves exactly 23 canonical GoF patterns in PATTERNS alongside the blank editor', () => {
    assert.equal(PATTERNS.length, 23);
    assert.ok(!PATTERNS.some((p) => p.id === BLANK_PROJECT_ID));
  });

  it('builds a valid Java project with default method calling for the blank editor', () => {
    const javaFiles = buildProjectFiles(BLANK_PATTERN, 'java');
    assert.ok(Array.isArray(javaFiles));
    assert.ok(javaFiles.length >= 1);

    const mainFile = javaFiles.find((f) => f.name === 'Main.java');
    assert.ok(mainFile, 'Main.java must be present');
    assert.equal(mainFile.isEntryPoint, true, 'Main.java must be entry point');

    // Verify main method and default method calling
    assert.ok(
      mainFile.content.includes('public static void main(String[] args)'),
      'Main.java must contain public static void main'
    );
    assert.ok(
      mainFile.content.includes('run();'),
      'Main.java main() must call default method run()'
    );
    assert.ok(
      mainFile.content.includes('public static void run()'),
      'Main.java must define the default run() method'
    );
  });

  it('builds a valid TypeScript project with default function calling for the blank editor', () => {
    const tsFiles = buildProjectFiles(BLANK_PATTERN, 'typescript');
    assert.ok(Array.isArray(tsFiles));
    assert.ok(tsFiles.length >= 1);

    const indexFile = tsFiles.find((f) => f.name === 'index.ts');
    assert.ok(indexFile, 'index.ts must be present');
    assert.equal(indexFile.isEntryPoint, true, 'index.ts must be entry point');

    // Verify default function definition and calling
    assert.ok(
      indexFile.content.includes('function run()'),
      'index.ts must define run() function'
    );
    assert.ok(
      indexFile.content.includes('run();'),
      'index.ts must call run()'
    );
  });

  it('guarantees immutability through deep cloning', () => {
    const filesA = buildProjectFiles(BLANK_PATTERN, 'java');
    filesA[0].content = '// MODIFIED BY USER';

    const filesB = buildProjectFiles(BLANK_PATTERN, 'java');
    assert.notEqual(filesB[0].content, '// MODIFIED BY USER');
    assert.ok(filesB[0].content.includes('public static void main'));
  });

  it('retains all 23 GoF pattern projects in curated Java and TS catalogs intact', () => {
    for (const pattern of PATTERNS) {
      assert.ok(
        CURATED_JAVA_PROJECTS[pattern.id],
        `Java project for ${pattern.id} must exist`
      );
      assert.ok(
        CURATED_TS_PROJECTS[pattern.id],
        `TypeScript project for ${pattern.id} must exist`
      );
    }
  });
});
