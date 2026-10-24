import type { Pattern } from '../data';
import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { CURATED_JAVA_PROJECTS } from './playground-starters-java';
import { CURATED_TS_PROJECTS } from './playground-starters-ts';

export { CURATED_JAVA_PROJECTS } from './playground-starters-java';
export { CURATED_TS_PROJECTS } from './playground-starters-ts';

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
