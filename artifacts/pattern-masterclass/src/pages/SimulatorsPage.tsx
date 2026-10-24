import React from 'react';
import { PATTERNS, type Pattern } from '../data';
import { PageIntro } from '../components/ui/PageIntro';
import { StudioWorkbench } from '../components/studio/StudioWorkbench';
import { useLearningStore } from '../stores';
import type { StudioPerspective } from '../components/studio/PerspectiveSwitch';

export interface SimulatorsPageProps {
  onSelect: (p: Pattern) => void;
}

export function SimulatorsPage({ onSelect }: SimulatorsPageProps) {
  const theme = useLearningStore((s) => s.theme);
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialPatternId = search?.get('pattern') || 'abstract-factory';
  const initialPerspective = (search?.get('perspective') as StudioPerspective) || 'enterprise';

  const handleSelectPattern = (id: string) => {
    const p = PATTERNS.find((item) => item.id === id);
    if (p) onSelect(p);
  };

  return (
    <div className="page-content reveal space-y-6">
      <PageIntro
        index="05 / PATTERN STUDIO"
        title={
          <>
            Interactive Architecture &
            <br />
            <em>Vector Isometric Studio.</em>
          </>
        }
        text="Correlate Gang of Four design patterns to working physical apparatuses and enterprise cloud topologies with real-time method dispatch tracing."
      />

      <div className="rounded-2xl border border-border/50 bg-card/40 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
        <StudioWorkbench
          initialPatternId={initialPatternId}
          initialPerspective={initialPerspective}
          theme={theme}
          onSelectPattern={handleSelectPattern}
        />
      </div>
    </div>
  );
}
