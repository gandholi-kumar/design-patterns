import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  GitBranch,
  Layers3,
  Lightbulb,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { PATTERNS, type Pattern } from '../data';
import { PageIntro } from '../components/ui/PageIntro';

export interface SimulatorsPageProps {
  onSelect: (p: Pattern) => void;
}

const demos = [
  {
    id: 'strategy',
    title: 'Strategy / Route planning',
    label: 'SWAP THE ALGORITHM',
    intro: 'A navigator keeps its job. Choose which route it plans.',
    options: ['Fast · highway', 'Scenic · coast', 'Low tolls · inland'],
    snippets: [
      'Fast route SF→Monterey via Highway · 92 min',
      'Scenic route SF→Monterey via Coast · 2h 14m',
      'Low-toll route SF→Monterey via CA-152 · $4.50',
    ],
  },
  {
    id: 'observer',
    title: 'Observer / Order events',
    label: 'PUBLISHER → SUBSCRIBERS',
    intro: 'An order service publishes once. Every subscriber reacts independently.',
    options: ['Order placed', 'Payment captured', 'Shipment delayed'],
    snippets: [
      'Inventory reserved · email receipt queued · analytics event recorded',
      'Payment ledger updated · order marked paid · customer notified',
      'Support alert raised · delivery ETA recalculated · customer notified',
    ],
  },
  {
    id: 'chain-of-responsibility',
    title: 'Chain / Request pipeline',
    label: 'PASS THE REQUEST',
    intro: 'Each handler checks the incoming request and can stop the chain.',
    options: ['Valid admin · 45 req/min', 'Guest · 45 req/min', 'Admin · 145 req/min'],
    snippets: [
      'Auth ✓  → Rate limit ✓  → Request accepted',
      'Auth ✕  → Request blocked before rate check',
      'Auth ✓  → Rate limit ✕  → Request throttled',
    ],
  },
  {
    id: 'decorator',
    title: 'Decorator / Add capabilities',
    label: 'WRAP A BASE OBJECT',
    intro: 'Wrap the same coffee with optional capabilities. Each decorator adds cost.',
    options: ['Base coffee · $3.25', 'Add oat milk · +$0.65', 'Add espresso · +$1.10'],
    snippets: [
      'Espresso · $3.25',
      'Espresso + oat milk · $3.90',
      'Espresso + extra shot · $4.35',
    ],
  },
  {
    id: 'state',
    title: 'State / Order lifecycle',
    label: 'STATE → NEXT STATE',
    intro: 'The current order state decides which action is legal next.',
    options: ['Pay order', 'Pack order', 'Ship order'],
    snippets: [
      'Pending → Paid · payment authorized',
      'Paid → Packed · fulfillment started',
      'Packed → In transit · tracking number created',
    ],
  },
  {
    id: 'command',
    title: 'Command / Undo stack',
    label: 'EXECUTE · UNDO',
    intro: 'Actions are objects. The history stack can replay or reverse a request.',
    options: ['Append “Hello”', 'Append “world”', 'Undo last action'],
    snippets: [
      'Document: Hello · history: 1 command',
      'Document: Hello world · history: 2 commands',
      'Document: Hello · history: 1 command',
    ],
  },
];

export function SimulatorsPage({ onSelect }: SimulatorsPageProps) {
  const [scenario, setScenario] = useState(0);
  const [events, setEvents] = useState<string[]>([]);
  const [orderPhase, setOrderPhase] = useState('Pending');
  const [documentText, setDocumentText] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [extras, setExtras] = useState<string[]>([]);
  const [route, setRoute] = useState('');

  const demo = demos[scenario];

  const trace = (message: string) =>
    setEvents((x) => [
      `${new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}  ${message}`,
      ...x,
    ].slice(0, 5));

  const act = (i: number) => {
    if (scenario === 0) {
      const picked = [
        'Fast route SF→Monterey via Highway · 92 min',
        'Scenic route SF→Monterey via Coast · 2h 14m',
        'Low-toll route SF→Monterey via CA-152 · $4.50',
      ][i];
      setRoute(picked);
      trace(`${picked} · Navigator unchanged`);
    } else if (scenario === 1) {
      trace(`${demo.snippets[i]} · 3 observers notified`);
    } else if (scenario === 2) {
      trace(demo.snippets[i]);
    } else if (scenario === 3) {
      if (i === 0) {
        setExtras([]);
      } else {
        const item = i === 1 ? 'oat milk' : 'extra shot';
        setExtras((prev) => (prev.includes(item) ? prev : [...prev, item]));
      }
      const next =
        i === 0
          ? []
          : extras.includes(i === 1 ? 'oat milk' : 'extra shot')
          ? extras
          : [...extras, i === 1 ? 'oat milk' : 'extra shot'];
      const cost =
        3.25 + (next.includes('oat milk') ? 0.65 : 0) + (next.includes('extra shot') ? 1.1 : 0);
      trace(`Espresso${next.length ? ` + ${next.join(' + ')}` : ''} · $${cost.toFixed(2)}`);
    } else if (scenario === 4) {
      const transitions: [string, string][] = [
        ['Pending', 'Paid'],
        ['Paid', 'Packed'],
        ['Packed', 'In transit'],
      ];
      const [from, to] = transitions[i];
      if (orderPhase !== from) {
        trace(
          `Action rejected · ${i === 0 ? 'pay' : i === 1 ? 'pack' : 'ship'} is not valid while order is ${orderPhase.toLowerCase()}`
        );
      } else {
        setOrderPhase(to);
        trace(`${from} → ${to} · ${demo.snippets[i].split('·')[1].trim()}`);
      }
    } else if (i < 2) {
      const word = i === 0 ? 'Hello ' : 'world';
      setDocumentText((value) => value + word);
      setCommandHistory((value) => [...value, word]);
      trace(
        `Executed append "${word.trim()}" · document: "${documentText + word}" · history ${commandHistory.length + 1}`
      );
    } else {
      const last = commandHistory[commandHistory.length - 1];
      if (!last) {
        trace('Undo ignored · command history is empty');
      } else {
        setCommandHistory((value) => value.slice(0, -1));
        setDocumentText((value) => value.slice(0, -last.length));
        trace(
          `Undid append "${last.trim()}" · document: "${documentText.slice(0, -last.length)}" · history ${commandHistory.length - 1}`
        );
      }
    }
  };

  const p = PATTERNS.find((x) => x.id === demo.id)!;

  return (
    <div className="page-content reveal">
      <PageIntro
        index="04 / PATTERN STUDIO"
        title={
          <>
            A pattern you can
            <br />
            <em>move around.</em>
          </>
        }
        text="Model the collaboration, not just the class diagram. Each small simulator lets you change one input and inspect its ripple."
      />
      <div className="sim-tabs">
        {demos.map((d, i) => (
          <button
            type="button"
            key={d.id}
            className={`sim-tab ${scenario === i ? 'active' : ''}`}
            onClick={() => {
              setScenario(i);
              setEvents([]);
              setOrderPhase('Pending');
              setDocumentText('');
              setCommandHistory([]);
              setExtras([]);
              setRoute('');
            }}
            data-testid={`simulator-${d.id}`}
          >
            <span>0{i + 1}</span>
            {d.title.split(' / ')[0]}
          </button>
        ))}
      </div>
      <div className="simulator-panel">
        <div className="sim-copy">
          <span className="eyebrow">{demo.label}</span>
          <h2>
            {demo.title.split(' / ')[0]} <em>in motion.</em>
          </h2>
          <p>{demo.intro}</p>
          <button
            type="button"
            className="pattern-link"
            onClick={() => onSelect(p)}
          >
            Open full pattern notes <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="sim-stage">
          <div className="sim-stage-head">
            <span>INPUT / ACTION</span>
            <span>
              {scenario === 4
                ? `ORDER / ${orderPhase.toUpperCase()}`
                : scenario === 5
                ? `DOCUMENT / "${documentText}"`
                : scenario === 0 && route
                ? route.toUpperCase()
                : 'CLICK TO SIMULATE'}
            </span>
          </div>
          <div className={`sim-visual sim-${demo.id}`}>
            <div className="sim-center">
              {scenario === 0 ? (
                <Compass size={23} />
              ) : scenario === 1 ? (
                <Zap size={22} />
              ) : scenario === 2 ? (
                <ShieldCheck size={22} />
              ) : scenario === 3 ? (
                <Layers3 size={22} />
              ) : scenario === 4 ? (
                <GitBranch size={22} />
              ) : (
                <Terminal size={22} />
              )}
              <span>
                {scenario === 0
                  ? 'Navigator'
                  : scenario === 1
                  ? 'Order service'
                  : scenario === 2
                  ? 'Request'
                  : scenario === 3
                  ? `Coffee · $${(
                      3.25 +
                      (extras.includes('oat milk') ? 0.65 : 0) +
                      (extras.includes('extra shot') ? 1.1 : 0)
                    ).toFixed(2)}`
                  : scenario === 4
                  ? orderPhase
                  : `History · ${commandHistory.length}`}
              </span>
            </div>
            <div className="sim-connections">
              <i />
              <i />
              <i />
            </div>
            <div className="sim-nodes">
              {(scenario === 0
                ? ['Highway', 'Coast', 'Inland']
                : scenario === 1
                ? ['Inventory', 'Email', 'Analytics']
                : scenario === 2
                ? ['Auth', 'Rate', 'Controller']
                : scenario === 3
                ? ['Milk', 'Shot', 'Syrup']
                : scenario === 4
                ? ['Pending', 'Paid', 'Shipped']
                : ['Execute', 'History', 'Undo']
              ).map((v, i) => (
                <div
                  key={v}
                  className={`sim-node ${events.length && i === 1 ? 'lit' : ''}`}
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  {v}
                </div>
              ))}
            </div>
          </div>
          <div className="sim-action-grid">
            {demo.options.map((opt, i) => (
              <button
                type="button"
                key={opt}
                className="sim-action"
                onClick={() => act(i)}
                data-testid={`sim-action-${i}`}
              >
                <span>{opt}</span>
                <ArrowRight size={14} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="event-log">
        <div className="event-log-title">
          <span className="live-pip" />
          <b>EVENT TRACE</b>
          <span>LOCAL SIMULATION</span>
          <button
            type="button"
            onClick={() => setEvents([])}
            data-testid="clear-simulator"
          >
            Clear log
          </button>
        </div>
        <div className="trace-lines">
          {events.length ? (
            events.map((e, i) => (
              <div className="trace-line" key={`${e}${i}`}>
                <span>{String(events.length - i).padStart(2, '0')}</span>
                <code>{e}</code>
              </div>
            ))
          ) : (
            <div className="trace-empty">
              Awaiting input <span>— click a scenario above to trace the collaboration.</span>
            </div>
          )}
        </div>
      </div>
      <div className="studio-tip">
        <Lightbulb size={17} />
        <span>
          <b>Look for:</b> the point where responsibilities change hands. That's usually where the
          pattern's value lives.
        </span>
      </div>
    </div>
  );
}
