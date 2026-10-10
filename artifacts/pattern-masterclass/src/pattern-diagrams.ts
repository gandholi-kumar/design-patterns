import { CANONICAL_DATA } from './data/canonical-data';
import { ENTERPRISE_DATA } from './data/enterprise-data';
import type { Perspective } from './pattern-types';

export type PatternDiagramDefinition = {
  uml: string;
  mermaid: string;
};

/**
 * Retrieve perspective-aware diagrams (Canonical GoF theory vs. Enterprise Cloud architecture)
 */
export function getPatternDiagram(
  patternId: string,
  perspective: Perspective = 'canonical'
): PatternDiagramDefinition | undefined {
  const source = perspective === 'canonical' ? CANONICAL_DATA[patternId] : ENTERPRISE_DATA[patternId];
  if (!source) return undefined;
  return {
    uml: source.diagramUml,
    mermaid: source.diagramFlowchart,
  };
}

/**
 * Backward-compatible static dictionary defaulting to canonical diagrams
 */
export const PATTERN_DIAGRAMS: Record<string, PatternDiagramDefinition> = Object.fromEntries(
  Object.keys(CANONICAL_DATA).map((id) => [
    id,
    {
      uml: CANONICAL_DATA[id].diagramUml,
      mermaid: CANONICAL_DATA[id].diagramFlowchart,
    },
  ])
);
