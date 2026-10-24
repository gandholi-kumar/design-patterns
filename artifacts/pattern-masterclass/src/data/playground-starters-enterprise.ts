import type { ProjectFile } from '../components/PlaygroundFileTabs';
import { ENTERPRISE_DATA } from './enterprise-data';
import type { Pattern } from '../data';

/**
 * Builds enterprise project files for a pattern in Java.
 * Modeled after production distributed cloud architectures.
 */
export function buildEnterpriseJavaProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = ENTERPRISE_DATA[pattern.id] || pattern.enterprise;
  const rawCode = variant?.java?.code || pattern.javaImplementation?.code || '// Java implementation';
  const rawFileName = variant?.java?.fileName || pattern.javaImplementation?.fileName || 'Pattern.java';
  const baseName = rawFileName.replace(/\.java$/, '');

  const needsUtilImport =
    /\b(List|ArrayList|Map|HashMap|Set|HashSet|Arrays|Collections)\b/.test(rawCode) &&
    !rawCode.includes('import java.util');
  const importHeader = needsUtilImport ? 'import java.util.*;\n\n' : '';

  const sanitizedCode = importHeader + rawCode.replace(
    /public\s+(class|interface|abstract\s+class|enum)\s+([A-Za-z0-9_]+)/g,
    (match: string, type: string, name: string) => {
      if (name === baseName) return match;
      return `${type} ${name}`;
    }
  );

  if (rawCode.includes('public static void main')) {
    return [
      {
        id: 'enterprise-java-main',
        name: `${baseName}.java`,
        isEntryPoint: true,
        content: sanitizedCode,
      },
    ];
  }

  return [
    {
      id: 'enterprise-java-pattern',
      name: `${baseName}.java`,
      isEntryPoint: false,
      content: sanitizedCode,
    },
    {
      id: 'enterprise-java-main',
      name: 'Main.java',
      isEntryPoint: true,
      content: `public class Main {
    public static void main(String[] args) {
        System.out.println("=== ${pattern.name || pattern.id} Pattern (Enterprise Cloud) ===");
        System.out.println("Scenario: ${variant?.scenario?.replace(/"/g, '\\"') || pattern.intent?.replace(/"/g, '\\"') || ''}");
        System.out.println("\\nPattern components loaded in ${baseName}.java. Modify Main.java to instantiate and test.");
    }
}
`,
    },
  ];
}

/**
 * Builds enterprise project files for a pattern in TypeScript.
 */
export function buildEnterpriseTsProject(pattern: Partial<Pattern> & { id: string }): ProjectFile[] {
  const variant = ENTERPRISE_DATA[pattern.id] || pattern.enterprise;
  const rawCode =
    variant?.typeScript?.code ||
    pattern.runnableCode ||
    pattern.typeScriptImplementation?.code ||
    '// TypeScript implementation';
  const rawFileName = variant?.typeScript?.fileName || pattern.typeScriptImplementation?.fileName || 'index.ts';
  const fileName = rawFileName.endsWith('.ts') ? rawFileName : `${rawFileName}.ts`;

  return [
    {
      id: 'enterprise-ts-main',
      name: fileName,
      isEntryPoint: true,
      content: rawCode,
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
