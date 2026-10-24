import type { Pattern } from '../data';
import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { CURATED_JAVA_PROJECTS } from './playground-starters-java';
import { CURATED_TS_PROJECTS } from './playground-starters-ts';
import { CANONICAL_DATA } from './canonical-data';
import { ENTERPRISE_DATA } from './enterprise-data';

export { CURATED_JAVA_PROJECTS } from './playground-starters-java';
export { CURATED_TS_PROJECTS } from './playground-starters-ts';

export type PlaygroundCodeSource = 'canonical' | 'enterprise' | 'curated';

export const BLANK_PROJECT_ID = 'blank-editor';

const BLANK_JAVA_STARTER = `public class Main {
    public static void main(String[] args) {
        System.out.println("=== Java Scratchpad ===");

        // Default method call
        run();
    }

    /**
     * Default method called from main().
     * Write your custom implementation, classes, or design patterns below.
     */
    public static void run() {
        System.out.println("Execution started in run(). Ready to code!");

        // TODO: Start writing your custom code or design pattern here
    }
}
`;

const BLANK_TS_STARTER = `/**
 * TypeScript Scratchpad
 * Write your custom implementation, classes, or design patterns below.
 */
export function run(): void {
  console.log("=== TypeScript Scratchpad ===");
  console.log("Execution started in run(). Ready to code!");

  // TODO: Start writing your custom code or design pattern here
}

// Default method call
run();
`;

export const BLANK_PATTERN: Pattern = {
  id: BLANK_PROJECT_ID,
  name: 'Blank Editor (Scratchpad)',
  category: 'Creational',
  tagline: 'Clean starter with default method calling to practice your own patterns and code.',
  intent: 'Provide a dedicated empty code editor with default method calling for custom practice in Java and TypeScript.',
  memoryHook: 'Blank canvas with default method calling.',
  canonical: {
    title: 'Custom Blank Workspace',
    scenario: 'Experimentation & Custom Practice',
    problem: 'Practicing patterns or writing custom algorithms on a blank canvas without boilerplate setup.',
    solution: 'A minimal entry point with default method invocation ready for immediate execution.',
    whenToUse: [
      'Writing your own design patterns from scratch',
      'Testing algorithms and class hierarchies',
      'Blank playground experimentation',
    ],
    whenNotToUse: ['When studying canonical GoF reference solutions'],
    typeScript: {
      fileName: 'index.ts',
      explanation: 'A clean slate with a default run() function call. Define your classes, interfaces, and patterns freely in index.ts or across new tabs.',
      code: BLANK_TS_STARTER,
    },
    java: {
      fileName: 'Main.java',
      explanation: 'A clean slate with a default run() method call. Define your classes, interfaces, and patterns freely in Main.java or across new tabs.',
      code: BLANK_JAVA_STARTER,
    },
    asciiShape: '[Main] --> [run()]',
    diagramUml: 'class Main { +main(args: String[]): void\\n+run(): void }',
    diagramFlowchart: 'graph TD; Main-->run;',
  },
  enterprise: {
    title: 'Custom Blank Workspace',
    scenario: 'Experimentation & Custom Practice',
    problem: 'Practicing patterns or writing custom algorithms on a blank canvas without boilerplate setup.',
    solution: 'A minimal entry point with default method invocation ready for immediate execution.',
    whenToUse: [
      'Writing your own design patterns from scratch',
      'Testing algorithms and class hierarchies',
      'Blank playground experimentation',
    ],
    whenNotToUse: ['When studying canonical GoF reference solutions'],
    typeScript: {
      fileName: 'index.ts',
      explanation: 'A clean slate with a default run() function call. Define your classes, interfaces, and patterns freely in index.ts or across new tabs.',
      code: BLANK_TS_STARTER,
    },
    java: {
      fileName: 'Main.java',
      explanation: 'A clean slate with a default run() method call. Define your classes, interfaces, and patterns freely in Main.java or across new tabs.',
      code: BLANK_JAVA_STARTER,
    },
    asciiShape: '[Main] --> [run()]',
    diagramUml: 'class Main { +main(args: String[]): void\\n+run(): void }',
    diagramFlowchart: 'graph TD; Main-->run;',
  },
  solidPrinciples: [],
  confusedWith: [],
  interviewTraps: [],
  problem: 'Practicing patterns or writing custom algorithms on a blank canvas without boilerplate setup.',
  solution: 'A minimal entry point with default method invocation ready for immediate execution.',
  whenToUse: [
    'Writing your own design patterns from scratch',
    'Testing algorithms and class hierarchies',
    'Blank playground experimentation',
  ],
  whenNotToUse: ['When studying canonical GoF reference solutions'],
  realWorldEnterpriseScenario: 'Custom algorithm and architecture prototyping sandbox',
  asciiShape: '[Main] --> [run()]',
  javaImplementation: {
    fileName: 'Main.java',
    explanation: 'A clean slate with a default run() method call. Define your classes, interfaces, and patterns freely in Main.java or across new tabs.',
    code: BLANK_JAVA_STARTER,
  },
  typeScriptImplementation: {
    fileName: 'index.ts',
    explanation: 'A clean slate with a default run() function call. Define your classes, interfaces, and patterns freely in index.ts or across new tabs.',
    code: BLANK_TS_STARTER,
  },
  runnableCode: BLANK_TS_STARTER,
};

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
 * Builds the initial multi-file project workspace for a given pattern, language, and perspective source.
 * Guarantees every GoF pattern has runnable code across Canonical, Enterprise, and Curated perspectives.
 */
export function buildProjectFiles(
  pattern: Pattern,
  language: 'java' | 'typescript',
  source: PlaygroundCodeSource = 'canonical'
): ProjectFile[] {
  // 1. Blank Scratchpad (identical across all perspectives)
  if (pattern.id === BLANK_PROJECT_ID) {
    if (language === 'java') {
      return [
        {
          id: 'blank-main-java',
          name: 'Main.java',
          isEntryPoint: true,
          content: BLANK_JAVA_STARTER,
        },
      ];
    }
    return [
      {
        id: 'blank-main-ts',
        name: 'index.ts',
        isEntryPoint: true,
        content: BLANK_TS_STARTER,
      },
    ];
  }

  // 2. Curated Modular Multi-File Projects
  if (source === 'curated') {
    if (language === 'java' && CURATED_JAVA_PROJECTS[pattern.id]) {
      return cloneProjectFiles(CURATED_JAVA_PROJECTS[pattern.id]);
    }
    if (language === 'typescript' && CURATED_TS_PROJECTS[pattern.id]) {
      return cloneProjectFiles(CURATED_TS_PROJECTS[pattern.id]);
    }
  }

  // 3. Perspective-driven Domain Variants (Canonical or Enterprise)
  const variantMap = source === 'enterprise' ? ENTERPRISE_DATA : CANONICAL_DATA;
  const variant = variantMap[pattern.id] || (source === 'enterprise' ? pattern.enterprise : pattern.canonical);

  if (language === 'java') {
    const rawCode = variant?.java?.code || pattern.javaImplementation?.code || '// Java implementation';
    const rawFileName = variant?.java?.fileName || pattern.javaImplementation?.fileName || 'Pattern.java';
    const baseName = rawFileName.replace(/\.java$/, '');

    // Add java.util import if needed by collections in snippet
    const needsUtilImport =
      /\b(List|ArrayList|Map|HashMap|Set|HashSet|Arrays|Collections)\b/.test(rawCode) &&
      !rawCode.includes('import java.util');
    const importHeader = needsUtilImport ? 'import java.util.*;\n\n' : '';

    // Sanitize secondary public classes to avoid javac single-file public class constraints
    const sanitizedCode = importHeader + rawCode.replace(
      /public\s+(class|interface|abstract\s+class|enum)\s+([A-Za-z0-9_]+)/g,
      (match, type, name) => {
        if (name === baseName) return match;
        return `${type} ${name}`;
      }
    );

    // If snippet already contains a main method, provide it directly as the entrypoint
    if (rawCode.includes('public static void main')) {
      return [
        {
          id: `${source}-java-main`,
          name: `${baseName}.java`,
          isEntryPoint: true,
          content: sanitizedCode,
        },
      ];
    }

    // Otherwise provide the pattern file first (active file) and Main.java as the entry point runner
    const sourceLabel = source === 'enterprise' ? 'Enterprise Cloud' : 'Canonical Refactoring Guru';
    return [
      {
        id: `${source}-java-pattern`,
        name: `${baseName}.java`,
        isEntryPoint: false,
        content: sanitizedCode,
      },
      {
        id: `${source}-java-main`,
        name: 'Main.java',
        isEntryPoint: true,
        content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== ${pattern.name} Pattern (${sourceLabel}) ===");
        System.out.println("Scenario: ${variant?.scenario?.replace(/"/g, '\\"') || pattern.intent.replace(/"/g, '\\"')}");
        System.out.println("\\nPattern components loaded in ${baseName}.java. Modify Main.java to instantiate and test.");
    }
}
`,
      },
    ];
  }

  // TypeScript: Canonical or Enterprise single-file runnable execution
  const rawCode =
    variant?.typeScript?.code ||
    pattern.runnableCode ||
    pattern.typeScriptImplementation?.code ||
    '// TypeScript implementation';
  const rawFileName = variant?.typeScript?.fileName || pattern.typeScriptImplementation?.fileName || 'index.ts';
  const fileName = rawFileName.endsWith('.ts') ? rawFileName : `${rawFileName}.ts`;

  return [
    {
      id: `${source}-ts-main`,
      name: fileName,
      isEntryPoint: true,
      content: rawCode,
    },
  ];
}
