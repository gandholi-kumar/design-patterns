import { useLocation } from 'wouter';
import { Compass, Terminal, Layers3, ArrowRight, Clock, Sparkles, Play } from 'lucide-react';

interface WipFeature {
  title: string;
  desc: string;
}

interface WipModulePlaceholderProps {
  moduleIndex: string;
  moduleTitle: string;
  moduleHeadline: string;
  courtesyMessage?: string;
  upcomingFeatures: WipFeature[];
  onLaunchPrototype?: () => void;
  prototypeName?: string;
}

export function WipModulePlaceholder({
  moduleIndex,
  moduleTitle,
  moduleHeadline,
  courtesyMessage,
  upcomingFeatures,
  onLaunchPrototype,
  prototypeName,
}: WipModulePlaceholderProps) {
  const [, setLoc] = useLocation();

  const defaultCourtesy =
    'Work in progress and will soon be published. Thank you for your patience while we craft this experience! In the meantime, explore our 23 interactive pattern blueprints, the AI Decision Engine, and the live code playground.';

  return (
    <div className="page-content reveal wip-page-wrapper">
      <div className="wip-container">
        {/* Module Index Eyebrow */}
        <div className="wip-eyebrow-row">
          <span className="wip-index-tag">{moduleIndex}</span>
          <div className="wip-status-badge">
            <span className="wip-pulse-dot" />
            <Clock size={12} />
            <span>WORK IN PROGRESS · COMING SOON</span>
          </div>
        </div>

        {/* Hero Card */}
        <div className="wip-hero-card">
          <div className="wip-hero-header">
            <div className="wip-hero-icon-bubble">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="wip-title">
                {moduleTitle} <em>is in the workshop.</em>
              </h1>
              <p className="wip-tagline">{moduleHeadline}</p>
            </div>
          </div>

          <div className="wip-courtesy-banner">
            <p>{courtesyMessage || defaultCourtesy}</p>
          </div>

          {/* Upcoming Features Teaser */}
          <div className="wip-features-section">
            <span className="wip-features-heading">WHAT TO EXPECT IN THE UPCOMING FULL-FLEDGED RELEASE:</span>
            <div className="wip-features-grid">
              {upcomingFeatures.map((feat, i) => (
                <div key={i} className="wip-feature-card">
                  <div className="wip-feature-num">0{i + 1}</div>
                  <div className="wip-feature-body">
                    <h4>{feat.title}</h4>
                    <p>{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alternative Navigation Actions */}
          <div className="wip-nav-divider" />
          {onLaunchPrototype && (
            <div className="wip-prototype-box">
              <div className="wip-prototype-copy">
                <strong>Interactive Alpha Sandbox Available</strong>
                <span>Experience the raw, experimental prototype before official release.</span>
              </div>
              <button
                type="button"
                className="wip-action-btn prototype-btn"
                onClick={onLaunchPrototype}
                data-testid="wip-launch-prototype"
              >
                <Play size={15} />
                <span>Launch {prototypeName || 'Sandbox Prototype'}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
          <div className="wip-action-row">
            <span className="wip-action-prompt">CONTINUE PRACTICING WITH ACTIVE TOOLS:</span>
            <div className="wip-buttons-group">
              <button
                type="button"
                className="wip-action-btn primary"
                onClick={() => setLoc('/decision-engine')}
                data-testid="wip-nav-decision"
              >
                <Compass size={16} />
                <span>Open Decision Engine</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="wip-action-btn"
                onClick={() => setLoc('/playground')}
                data-testid="wip-nav-playground"
              >
                <Terminal size={16} />
                <span>Launch Code Playground</span>
                <ArrowRight size={14} />
              </button>

              <button
                type="button"
                className="wip-action-btn"
                onClick={() => setLoc('/')}
                data-testid="wip-nav-library"
              >
                <Layers3 size={16} />
                <span>Browse 23 Patterns</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
