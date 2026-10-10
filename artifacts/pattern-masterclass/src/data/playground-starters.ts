import type { Pattern } from '../data';
import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { CURATED_JAVA_PROJECTS } from './playground-starters-java';
import { CURATED_TS_PROJECTS } from './playground-starters-ts';

export { CURATED_JAVA_PROJECTS } from './playground-starters-java';
export { CURATED_TS_PROJECTS } from './playground-starters-ts';

/**
 * Deep clones project files so user edits in the active playground
 * do not mutate the immutable master starter definitions.
 */
function cloneProjectFiles(files: ProjectFile[]): ProjectFile[] {
  return files.map((file) => ({
    ...file,
  }));
}

/**
 * Builds the initial multi-file project workspace for a given pattern and language.
 * Guarantees every GoF pattern has modular dedicated files for both Java and TypeScript.
 */
export function buildProjectFiles(pattern: Pattern, language: 'java' | 'typescript'): ProjectFile[] {
  // 1. Java Projects
  if (language === 'java') {
    if (CURATED_JAVA_PROJECTS[pattern.id]) {
      return cloneProjectFiles(CURATED_JAVA_PROJECTS[pattern.id]);
    }

    // Safety fallback for any dynamically added patterns:
    const rawCode = pattern.javaImplementation?.code || '// Java implementation';
    const baseName = (pattern.javaImplementation?.fileName || 'Pattern.java').replace(/\.java$/, '');

    const sanitizedCode = rawCode.replace(
      /public\s+(class|interface|abstract\s+class|enum)\s+([A-Za-z0-9_]+)/g,
      (match, type, name) => {
        if (name === baseName) return match;
        return `${type} ${name}`;
      }
    );

    return [
      {
        id: 'main-java',
        name: 'Main.java',
        isEntryPoint: true,
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== ${pattern.name} Pattern (Java) ===");
        System.out.println("Pattern Intent: ${pattern.intent.replace(/"/g, '\\"')}");
    }
}
`,
      },
      {
        id: 'pattern-java',
        name: `${baseName}.java`,
        content: sanitizedCode,
        isEntryPoint: false,
      },
    ];
  }

  // 2. TypeScript Projects
  if (CURATED_TS_PROJECTS[pattern.id]) {
    return cloneProjectFiles(CURATED_TS_PROJECTS[pattern.id]);
  }

  // Safety fallback for any dynamically added patterns:
  const rawCode = pattern.runnableCode || pattern.typeScriptImplementation?.code || '// TypeScript implementation';
  const fileName = pattern.typeScriptImplementation?.fileName || 'index.ts';

  return [
    {
      id: 'main-ts',
      name: fileName,
      content: rawCode,
      isEntryPoint: true,
    },
  ];
}
