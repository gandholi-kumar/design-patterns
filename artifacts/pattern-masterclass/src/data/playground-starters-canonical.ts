import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { CANONICAL_DATA } from './canonical-data';
import type { Pattern } from '../data';

/**
 * Splits a single-file TypeScript pattern into a modular multi-file project:
 * - `index.ts` (Entry Point, Tab 0): imports pattern components and executes client demonstration.
 * - `${moduleBaseName}.ts` (Module, Tab 1): exports pattern classes, interfaces, and methods.
 */
function splitTsPattern(rawCode: string, moduleBaseName: string) {
  const lines = rawCode.split('\n');
  const declLines: string[] = [];
  const clientLines: string[] = [];
  let isDeclBlock = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      isDeclBlock &&
      declLines.length > 3 &&
      /^(?:\/\/\s*(?:Client|Usage|Execution|Test|Demo|Runtime)|\s*(?:const|let|var)\s+[A-Za-z0-9_]+\s*=|renderUI\(|provision\w*\(|client\.|linter\.|resources\.|\(async|\s*new\s+[A-Z])/i.test(line) &&
      !line.includes('class ') &&
      !line.includes('interface ')
    ) {
      isDeclBlock = false;
    }

    if (isDeclBlock) {
      declLines.push(line);
    } else {
      clientLines.push(line);
    }
  }

  const moduleContent = declLines
    .join('\n')
    .replace(/^(class|interface|abstract\s+class|type|enum|function)\s+([A-Za-z0-9_]+)/gm, 'export $1 $2');

  const matches = [...moduleContent.matchAll(/export\s+(?:abstract\s+class|class|interface|type|enum|function)\s+([A-Za-z0-9_]+)/g)];
  const exportedNames = Array.from(new Set(matches.map((m) => m[1]))).join(', ');

  const clientContent = clientLines.join('\n').trim();
  const indexContent = `import {\n  ${exportedNames}\n} from './${moduleBaseName}';\n\n${clientContent}\n`;

  return {
    indexContent,
    moduleContent,
  };
}

/**
 * Builds canonical project files for a pattern in Java.
 * Modeled after academic & Refactoring Guru references.
 * Guarantees Main.java is always the permanent starting tab (index 0).
 */
export function buildCanonicalJavaProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = CANONICAL_DATA[pattern.id] || pattern.canonical;
  const rawCode = variant?.java?.code || pattern.javaImplementation?.code || '// Java implementation';
  const rawFileName = variant?.java?.fileName || pattern.javaImplementation?.fileName || 'Pattern.java';
  const baseName = rawFileName.replace(/\.java$/, '');

  const importHeader = 'import java.util.*;\nimport java.util.concurrent.*;\nimport java.util.function.*;\n\n';

  // Strip 'public' from classes in secondary file to satisfy javac single-public-class constraint
  const sanitizedCode =
    importHeader +
    rawCode.replace(/public\s+(?:final\s+|abstract\s+|sealed\s+)?(class|interface|enum|record)\s+/g, (m) =>
      m.replace('public ', '')
    );

  const mainRunnerCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("=== ${pattern.name || pattern.id} Pattern (Canonical Refactoring Guru) ===");
        System.out.println("Scenario: ${variant?.scenario?.replace(/"/g, '\\"') || pattern.intent?.replace(/"/g, '\\"') || ''}");
        System.out.println("\\nPattern components loaded and initialized from ${baseName}.java.");
    }
}
`;

  return [
    {
      id: 'canonical-java-main',
      name: 'Main.java',
      isEntryPoint: true,
      content: mainRunnerCode,
    },
    {
      id: 'canonical-java-pattern',
      name: `${baseName}.java`,
      isEntryPoint: false,
      content: sanitizedCode,
    },
  ];
}

/**
 * Builds canonical project files for a pattern in TypeScript.
 * Guarantees a modular multi-file project with index.ts at tab 0 importing from the pattern module.
 */
export function buildCanonicalTsProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = CANONICAL_DATA[pattern.id] || pattern.canonical;
  const rawCode =
    variant?.typeScript?.code ||
    pattern.runnableCode ||
    pattern.typeScriptImplementation?.code ||
    '// TypeScript implementation';
  const rawFileName = variant?.typeScript?.fileName || pattern.typeScriptImplementation?.fileName || 'Pattern.ts';
  const baseName = rawFileName.replace(/\.tsx?$/, '');

  const { indexContent, moduleContent } = splitTsPattern(rawCode, baseName);

  return [
    {
      id: 'canonical-ts-main',
      name: 'index.ts',
      isEntryPoint: true,
      content: indexContent,
    },
    {
      id: 'canonical-ts-module',
      name: `${baseName}.ts`,
      isEntryPoint: false,
      content: moduleContent,
    },
  ];
}

/**
 * Pre-indexed Canonical projects for all 23 GoF design patterns in Java.
 */
export const CANONICAL_JAVA_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(CANONICAL_DATA).map((patternId) => [
    patternId,
    buildCanonicalJavaProject({ id: patternId, name: patternId, intent: CANONICAL_DATA[patternId].problem }),
  ])
);

/**
 * Pre-indexed Canonical projects for all 23 GoF design patterns in TypeScript.
 */
export const CANONICAL_TS_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(CANONICAL_DATA).map((patternId) => [
    patternId,
    buildCanonicalTsProject({ id: patternId }),
  ])
);
