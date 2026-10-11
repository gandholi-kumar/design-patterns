import { useState, useMemo } from 'react';
import { Search, ArrowRight, Zap, Filter, Tag } from 'lucide-react';
import { PRODUCTION_SCENARIOS, type ProductionScenario } from './decision-data';
import type { GoFDecisionVerdict } from './ai-service';
import { PATTERNS } from '../../data';

interface ScenarioMatcherProps {
  onSelectScenarioVerdict: (v: GoFDecisionVerdict) => void;
}

export function ScenarioMatcher({ onSelectScenarioVerdict }: ScenarioMatcherProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('sc-01');

  const categories = ['All', 'Cloud & Infra', 'Fintech & Billing', 'Distributed Systems', 'UI & Graphics', 'Developer Tools', 'Web Architecture', 'Systems Architecture'];

  const filteredScenarios = useMemo(() => {
    return PRODUCTION_SCENARIOS.filter((sc) => {
      const matchesCategory = selectedCategory === 'All' || sc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sc.title.toLowerCase().includes(q) ||
        sc.headline.toLowerCase().includes(q) ||
        sc.primaryPatternName.toLowerCase().includes(q) ||
        sc.systemContext.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleSelectScenario = (sc: ProductionScenario) => {
    setActiveScenarioId(sc.id);
    const primMeta = PATTERNS.find((p) => p.id === sc.primaryPatternId);
    const runnerMeta = PATTERNS.find((p) => p.id === sc.runnerUpPatternId);

    const verdict: GoFDecisionVerdict = {
      primaryPattern: {
        id: sc.primaryPatternId,
        name: sc.primaryPatternName,
        category: primMeta?.category || 'Structural',
        confidence: sc.confidence,
        architecturalRationale: `${sc.headline}. ${sc.primaryRationale}`,
        structuralApplicability: `Resolves forces in ${sc.title}: ${sc.architecturalForces.join(' ')}`,
      },
      runnerUpPattern: {
        id: sc.runnerUpPatternId,
        name: sc.runnerUpPatternName,
        category: runnerMeta?.category || 'Structural',
        confidence: sc.runnerUpConfidence,
        whyConsidered: sc.runnerUpRationale,
        whenToChooseRunnerUpOverPrimary: sc.whenToChooseRunnerUp,
      },
      tradeOffDilemma: {
        primaryGains: sc.gains,
        primaryTaxes: sc.taxes,
        decisiveDifferentiator: `${sc.primaryPatternName} directly addresses the core tension in ${sc.title}.`,
      },
      codeSmellWarning: sc.antiPatternWarning,
    };

    onSelectScenarioVerdict(verdict);
  };

  return (
    <div className="scenarios-view-container">
      {/* Search & Filter Toolbar */}
      <div className="scenarios-toolbar">
        <div className="scenarios-searchbox">
          <Search size={16} />
          <input
            type="text"
            className="search-scenario-input"
            placeholder="Search scenarios by domain, problem, or pattern name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills-scroll">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              className={`cat-pill-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'All' ? 'All Scenarios' : cat}
              <span className="pill-count">
                {cat === 'All'
                  ? PRODUCTION_SCENARIOS.length
                  : PRODUCTION_SCENARIOS.filter((s) => s.category === cat).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="scenarios-cards-grid">
        {filteredScenarios.map((sc) => {
          const isActive = activeScenarioId === sc.id;
          return (
            <article
              key={sc.id}
              className={`scenario-card ${isActive ? 'active-scenario' : ''}`}
              onClick={() => handleSelectScenario(sc)}
            >
              <div className="scenario-card-top">
                <span className="scenario-num">SCENARIO {sc.scenarioNumber}</span>
                <span className="scenario-category-badge">
                  <Tag size={11} /> {sc.category}
                </span>
              </div>

              <h4 className="scenario-title">{sc.title}</h4>
              <p className="scenario-headline">{sc.headline}</p>

              <div className="scenario-forces-box">
                <span className="forces-label">ARCHITECTURAL FORCES:</span>
                <ul>
                  {sc.architecturalForces.slice(0, 2).map((force, i) => (
                    <li key={i}>{force}</li>
                  ))}
                </ul>
              </div>

              <div className="scenario-card-bottom">
                <div className="pattern-match-badge">
                  <Zap size={13} />
                  <span>{sc.primaryPatternName}</span>
                  <small>({sc.confidence}%)</small>
                </div>
                <button
                  type="button"
                  className="scenario-inspect-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectScenario(sc);
                  }}
                >
                  <span>Inspect</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </article>
          );
        })}

        {filteredScenarios.length === 0 && (
          <div className="empty-scenarios-box">
            <Filter size={24} />
            <h4>No matching scenarios found</h4>
            <p>Try clearing your search query or selecting "All Scenarios".</p>
            <button
              type="button"
              className="text-btn"
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
