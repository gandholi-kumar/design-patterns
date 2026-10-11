import { Zap, ChevronUp } from 'lucide-react';
import type { GoFDecisionVerdict } from './ai-service';

interface MobileVerdictBarProps {
  verdict: GoFDecisionVerdict | null;
  onOpenSheet: () => void;
}

export function MobileVerdictBar({ verdict, onOpenSheet }: MobileVerdictBarProps) {
  if (!verdict) return null;

  return (
    <aside className="mobile-docked-verdict-bar" aria-label="Active Decision Verdict Summary">
      <div className="mobile-dock-info">
        <span className="mobile-dock-badge">
          <Zap size={12} /> {verdict.primaryPattern.confidence}%
        </span>
        <div className="mobile-dock-title-group">
          <span className="mobile-dock-name">{verdict.primaryPattern.name}</span>
          <span className="mobile-dock-family">{verdict.primaryPattern.category}</span>
        </div>
      </div>
      <button type="button" className="mobile-dock-btn" onClick={onOpenSheet}>
        <span>View Verdict</span>
        <ChevronUp size={15} />
      </button>
    </aside>
  );
}
