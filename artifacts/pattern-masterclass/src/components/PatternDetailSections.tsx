import { Check, Code2, ArrowRight, X } from 'lucide-react';
import type { Pattern } from '../data';
import type { Perspective } from '../pattern-types';

export function PatternOverview({ pattern: p, perspective = 'canonical' }: { pattern: Pattern; perspective?: Perspective }) {
  const variant = perspective === 'canonical' ? p.canonical : p.enterprise;
  return (
    <>
      <div className="detail-block">
        <span className="eyebrow">THE INTENT</span>
        <p className="intent-quote">{p.intent}</p>
      </div>
      <div className="detail-pair">
        <div>
          <span className="eyebrow">THE PROBLEM</span>
          <p>{variant.problem}</p>
        </div>
        <div>
          <span className="eyebrow">THE SOLUTION</span>
          <p>{variant.solution}</p>
        </div>
      </div>
      <div className="detail-block">
        <span className="eyebrow">{perspective === 'canonical' ? 'IN THE WILD (CLASSIC)' : 'IN THE WILD (ENTERPRISE)'}</span>
        <p>{variant.scenario}</p>
      </div>
      <div className="detail-pair usage-pair">
        <div>
          <span className="eyebrow">USE IT WHEN</span>
          {variant.whenToUse.map(v => (
            <p className="bullet" key={v}>
              <Check size={13} />
              {v}
            </p>
          ))}
        </div>
        <div>
          <span className="eyebrow">THINK TWICE WHEN</span>
          {variant.whenNotToUse.map(v => (
            <p className="bullet no" key={v}>
              <X size={13} />
              {v}
            </p>
          ))}
        </div>
      </div>
      <div className="detail-block diagram">
        <span className="eyebrow">COLLABORATION SHAPE</span>
        <pre>{variant.asciiShape}</pre>
      </div>
    </>
  );
}

export function PatternCode({ pattern: p, perspective = 'canonical', goCode }: { pattern: Pattern; perspective?: Perspective; goCode: () => void }) {
  const variant = perspective === 'canonical' ? p.canonical : p.enterprise;
  return (
    <>
      <p className="code-explanation">{variant.typeScript.explanation}</p>
      <div className="detail-code">
        <div>
          <span className="file-dot" /> {variant.typeScript.fileName}
        </div>
        <pre>{variant.typeScript.code}</pre>
      </div>
      <button className="primary-btn modal-run" onClick={goCode} data-testid="detail-go-playground">
        <Code2 size={15} /> Open in playground <ArrowRight size={15} />
      </button>
    </>
  );
}

export function PatternTradeoffs({ pattern: p }: { pattern: Pattern }) {
  const solidOrder = [
    'Single Responsibility Principle',
    'Open/Closed Principle',
    'Liskov Substitution Principle',
    'Interface Segregation Principle',
    'Dependency Inversion Principle',
  ];
  const sortedSolid = [...p.solidPrinciples].sort((a, b) => {
    if (a.impact !== b.impact) {
      return a.impact === 'adheres' ? -1 : 1;
    }
    return solidOrder.indexOf(a.principle) - solidOrder.indexOf(b.principle);
  });

  return (
    <>
      <div className="detail-block">
        <span className="eyebrow">WHAT IT SUPPORTS</span>
        {sortedSolid.map(x => (
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
