import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { ENTERPRISE_DATA } from './enterprise-data';
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

  let braceDepth = 0;
  let inBlockComment = false;
  let inTemplateString = false;
  let isDeclBlock = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Only consider switching to client block when at top level (braceDepth === 0)
    if (isDeclBlock && braceDepth === 0 && declLines.length > 0) {
      const isClientComment = /^\/\/\s*(?:Client|Usage|Execution|Test|Demo|Runtime|Orchestration|Scenario|Consumer|Example|Trigger)/i.test(trimmed);
      const isTopLevelStatement =
        /^(?:const|let|var)\s+[A-Za-z0-9_$]+\s*(?::\s*[^=]+)?\s*=/i.test(trimmed) ||
        /^(?:await\s+)?(?:[A-Za-z0-9_$]+\s*\.|\(async|renderUI\(|run\(|main\(|bootstrap\(|new\s+[A-Z])/i.test(trimmed);

      const isDeclStart = /^(?:export\s+)?(?:abstract\s+class|class|interface|type|enum|function)\b/.test(trimmed);

      if ((isClientComment || isTopLevelStatement) && !isDeclStart) {
        isDeclBlock = false;
      }
    }

    if (isDeclBlock) {
      declLines.push(line);
      // Track brace depth
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        const next = line[c + 1];

        if (inBlockComment) {
          if (ch === '*' && next === '/') {
            inBlockComment = false;
            c++;
          }
          continue;
        }

        if (ch === '/' && next === '*') {
          inBlockComment = true;
          c++;
          continue;
        }

        if (ch === '/' && next === '/') {
          break;
        }

        if (ch === '`') {
          inTemplateString = !inTemplateString;
          continue;
        }

        if (inTemplateString) continue;

        if (ch === '"' || ch === "'") {
          const quote = ch;
          c++;
          while (c < line.length && line[c] !== quote) {
            if (line[c] === '\\') c++;
            c++;
          }
          continue;
        }

        if (ch === '{') braceDepth++;
        else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
      }
    } else {
      clientLines.push(line);
    }
  }

  // Prepend export only to top-level declarations in declLines
  let currentBrace = 0;
  const exportedDeclLines = declLines.map((line) => {
    const trimmed = line.trim();
    const isTopLevel = currentBrace === 0;

    for (let c = 0; c < line.length; c++) {
      if (line[c] === '{') currentBrace++;
      else if (line[c] === '}') currentBrace = Math.max(0, currentBrace - 1);
    }

    if (isTopLevel && /^(?:abstract\s+class|class|interface|type|enum|function)\b/.test(trimmed)) {
      return line.replace(/^(\s*)(abstract\s+class|class|interface|type|enum|function)\b/, '$1export $2');
    }
    return line;
  });

  const moduleContent = exportedDeclLines.join('\n');
  const matches = [...moduleContent.matchAll(/export\s+(?:abstract\s+class|class|interface|type|enum|function)\s+([A-Za-z0-9_]+)/g)];
  const exportedNames = Array.from(new Set(matches.map((m) => m[1]))).join(',\n  ');

  const clientContent = clientLines.join('\n').trim();
  const indexContent = clientContent
    ? `import {\n  ${exportedNames}\n} from './${moduleBaseName}';\n\n${clientContent}\n`
    : `import {\n  ${exportedNames}\n} from './${moduleBaseName}';\n\nconsole.log("=== ${moduleBaseName} Loaded ===");\n`;

  return {
    indexContent,
    moduleContent,
  };
}

/**
 * Builds enterprise project files for a pattern in Java.
 * Modeled after production distributed cloud architectures.
 * Guarantees Main.java is always the permanent starting tab (index 0).
 */
export function buildEnterpriseJavaProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = ENTERPRISE_DATA[pattern.id] || pattern.enterprise;
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
        System.out.println("=== ${pattern.name || pattern.id} Pattern (Enterprise Cloud) ===");
        System.out.println("Scenario: ${variant?.scenario?.replace(/"/g, '\\"') || pattern.intent?.replace(/"/g, '\\"') || ''}");
        System.out.println("\\nPattern components loaded and initialized from ${baseName}.java.");
    }
}
`;

  return [
    {
      id: 'enterprise-java-main',
      name: 'Main.java',
      isEntryPoint: true,
      content: mainRunnerCode,
    },
    {
      id: 'enterprise-java-pattern',
      name: `${baseName}.java`,
      isEntryPoint: false,
      content: sanitizedCode,
    },
  ];
}

/**
 * Builds enterprise project files for a pattern in TypeScript.
 * Guarantees a modular multi-file project with index.ts at tab 0 importing from the pattern module.
 */
export function buildEnterpriseTsProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = ENTERPRISE_DATA[pattern.id] || pattern.enterprise;
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
      id: 'enterprise-ts-main',
      name: 'index.ts',
      isEntryPoint: true,
      content: indexContent,
    },
    {
      id: 'enterprise-ts-module',
      name: `${baseName}.ts`,
      isEntryPoint: false,
      content: moduleContent,
    },
  ];
}

/**
 * Pre-indexed Enterprise Cloud projects for all 23 GoF design patterns in Java.
 */
export const ENTERPRISE_JAVA_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(ENTERPRISE_DATA).map((patternId) => [
    patternId,
    buildEnterpriseJavaProject({ id: patternId, name: patternId, intent: ENTERPRISE_DATA[patternId].problem }),
  ])
);

/**
 * Pre-indexed Enterprise Cloud projects for all 23 GoF design patterns in TypeScript.
 */
export const ENTERPRISE_TS_PROJECTS: Record<string, ProjectFile[]> = Object.fromEntries(
  Object.keys(ENTERPRISE_DATA).map((patternId) => [
    patternId,
    buildEnterpriseTsProject({ id: patternId }),
  ])
);
