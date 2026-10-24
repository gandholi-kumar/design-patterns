import React, { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { Search, Compass, ExternalLink, Filter, CheckCircle2 } from 'lucide-react';
import { PerspectiveSwitch, type StudioPerspective } from './PerspectiveSwitch';
import { CorrelationDock, type MethodDispatch } from './CorrelationDock';
import { PATTERN_APPARATUS_REGISTRY } from './apparatus/registry';
import { CANONICAL_DATA } from '../../data/canonical-data';
import { ENTERPRISE_DATA } from '../../data/enterprise-data';
import { PATTERNS } from '../../data';

export interface StudioWorkbenchProps {
  initialPatternId?: string;
  initialPerspective?: StudioPerspective;
  theme?: string;
  onSelectPattern?: (patternId: string) => void;
}

export function StudioWorkbench({
  initialPatternId = 'abstract-factory',
  initialPerspective = 'enterprise',
  theme = 'dark',
  onSelectPattern,
}: StudioWorkbenchProps) {
  const [, setLocation] = useLocation();
  const [activePatternId, setActivePatternId] = useState(initialPatternId);
  const [perspective, setPerspective] = useState<StudioPerspective>(initialPerspective);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Creational' | 'Structural' | 'Behavioral'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dispatches, setDispatches] = useState<MethodDispatch[]>([]);

  const activeConfig = PATTERN_APPARATUS_REGISTRY[activePatternId] || PATTERN_APPARATUS_REGISTRY['abstract-factory']!;

  // Retrieve matching source code
  const codeInfo = useMemo(() => {
    if (perspective === 'enterprise') {
      const data = ENTERPRISE_DATA[activePatternId];
      return {
        fileName: data?.typeScript?.fileName || `${activePatternId}.ts`,
        code: data?.typeScript?.code || '// Enterprise code implementation preview...',
      };
    }
    const data = CANONICAL_DATA[activePatternId];
    return {
      fileName: data?.typeScript?.fileName || `${activePatternId}.ts`,
      code: data?.typeScript?.code || '// Canonical code implementation preview...',
    };
  }, [activePatternId, perspective]);

  const handleDispatch = (d: MethodDispatch) => {
    setDispatches((prev) => [d, ...prev].slice(0, 20));
  };

  const handleSelectPattern = (id: string) => {
    setActivePatternId(id);
    setDispatches([]);
    onSelectPattern?.(id);
  };

  const handleOpenPlayground = () => {
    const p = perspective === 'enterprise' ? 'enterprise' : 'canonical';
    setLocation(`/playground?pattern=${activePatternId}&perspective=${p}`);
  };

  // Filtered patterns list for chips
  const filteredPatterns = useMemo(() => {
    return PATTERNS.filter((p) => {
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchQuery =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [categoryFilter, searchQuery]);

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Category Tabs & Quick Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
        <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-lg border border-border/30">
          {(['All', 'Creational', 'Structural', 'Behavioral'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                categoryFilter === cat
                  ? 'bg-primary text-primary-foreground shadow-sm font-semibold'
                  : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search 23 patterns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border/40 bg-background text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Pattern Selector Chips */}
      <div className="flex flex-wrap items-center gap-1.5 max-h-[96px] overflow-y-auto p-1 rounded-lg bg-muted/10 border border-border/20">
        {filteredPatterns.map((p) => {
          const active = activePatternId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => handleSelectPattern(p.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm scale-105'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              }`}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Active Pattern Info Header */}
      <div className="flex items-center justify-between border-b border-border/30 pb-2">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-foreground tracking-tight">
            {activeConfig.name}
          </span>
          <span className="text-xs font-mono uppercase bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-semibold">
            {activeConfig.category}
          </span>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          Interactive GoF Architectural Laboratory
        </div>
      </div>

      {/* Main Grid: Isometric Apparatus Stage (Left, 70%) & Correlation Dock (Right, 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Stage Container */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {activeConfig.render({
            perspective,
            onPerspectiveChange: setPerspective,
            theme,
            onDispatch: handleDispatch,
          })}
        </div>

        {/* Correlation Dock */}
        <div className="lg:col-span-4 flex flex-col">
          <CorrelationDock
            patternName={activeConfig.name}
            patternId={activeConfig.id}
            perspective={perspective}
            dispatches={dispatches}
            roles={activeConfig.roles}
            conceptSummary={activeConfig.conceptSummary}
            codeSnippet={codeInfo.code}
            codeFileName={codeInfo.fileName}
            onClearDispatches={() => setDispatches([])}
            onOpenPlayground={handleOpenPlayground}
          />
        </div>
      </div>
    </div>
  );
}
