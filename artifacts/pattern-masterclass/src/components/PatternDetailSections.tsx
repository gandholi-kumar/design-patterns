import { Check, Code2, ArrowRight, X } from 'lucide-react';
import type { Pattern } from '../data';

export function PatternOverview({ pattern: p }: { pattern: Pattern }) {
  return (
    <>
      <div className="detail-block">
        <span className="eyebrow">THE INTENT</span>
        <p className="intent-quote">{p.intent}</p>
      </div>
      <div className="detail-pair">
        <div>
          <span className="eyebrow">THE PROBLEM</span>
          <p>{p.problem}</p>
        </div>
        <div>
          <span className="eyebrow">THE SOLUTION</span>
          <p>{p.solution}</p>
        </div>
      </div>
      <div className="detail-block">
        <span className="eyebrow">IN THE WILD</span>
        <p>{p.realWorldEnterpriseScenario}</p>
      </div>
      <div className="detail-pair usage-pair">
        <div>
          <span className="eyebrow">USE IT WHEN</span>
          {p.whenToUse.map(v => (
            <p className="bullet" key={v}>
              <Check size={13} />
              {v}
            </p>
          ))}
        </div>
        <div>
          <span className="eyebrow">THINK TWICE WHEN</span>
          {p.whenNotToUse.map(v => (
            <p className="bullet no" key={v}>
              <X size={13} />
              {v}
            </p>
          ))}
        </div>
      </div>
      <div className="detail-block diagram">
        <span className="eyebrow">COLLABORATION SHAPE</span>
        <pre>{p.asciiShape}</pre>
      </div>
    </>
  );
}

export function PatternCode({ pattern: p, goCode }: { pattern: Pattern; goCode: () => void }) {
  return (
    <>
      <p className="code-explanation">{p.typeScriptImplementation.explanation}</p>
      <div className="detail-code">
        <div>
          <span className="file-dot" /> {p.typeScriptImplementation.fileName}
        </div>
        <pre>{p.typeScriptImplementation.code}</pre>
      </div>
      <button className="primary-btn modal-run" onClick={goCode} data-testid="detail-go-playground">
        <Code2 size={15} /> Open in playground <ArrowRight size={15} />
      </button>
    </>
  );
}

export function PatternTradeoffs({ pattern: p }: { pattern: Pattern }) {
  return (
    <>
      <div className="detail-block">
        <span className="eyebrow">WHAT IT SUPPORTS</span>
        {p.solidPrinciples.map(x => (
          <div className="solid-row" key={x.principle}>
            <span className={`impact ${x.impact}`}>{x.impact}</span>
            <div>
              <b>{x.principle}</b>
              <p>{x.explanation}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="detail-block">
        <span className="eyebrow">EASY TO CONFUSE WITH</span>
        {p.confusedWith.map(x => (
          <div className="confused-row" key={x.targetPattern}>
            <b>{x.targetPattern}</b>
            <p>{x.keyDifference}</p>
            <small>DECISION RULE · {x.decisionRule}</small>
          </div>
        ))}
      </div>
      <div className="detail-block traps">
        <span className="eyebrow">INTERVIEW TRAPS</span>
        {p.interviewTraps.map(t => (
          <p key={t}>
            <span>!</span>
            {t}
          </p>
        ))}
      </div>
    </>
  );
}
