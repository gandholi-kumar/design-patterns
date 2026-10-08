import { useEffect, useState } from 'react';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';
import { PATTERN_DIAGRAMS } from './pattern-diagrams';

type DiagramKind = 'uml' | 'mermaid';
type PatternDiagramsProps = {
  patternId: string;
  patternName: string;
  theme: string;
};

let nextRenderId = 0;

export function PatternDiagrams({ patternId, patternName, theme }: PatternDiagramsProps) {
  const [kind, setKind] = useState<DiagramKind>('uml');
  const definition = PATTERN_DIAGRAMS[patternId];

  if (!definition) {
    return <div className="diagram-error" role="alert">Diagrams are not configured for {patternName} yet.</div>;
  }

  const isUml = kind === 'uml';
  const title = isUml ? `${patternName} UML class diagram` : `${patternName} Mermaid collaboration diagram`;
  const source = isUml ? definition.uml : definition.mermaid;

  return (
    <section className="pattern-diagrams" aria-label={`${patternName} diagrams`}>
      <div className="diagram-intro">
        <span className="eyebrow">DESIGN MAP / {patternName.toUpperCase()}</span>
        <p>Compare the class structure with the collaboration flow.</p>
      </div>
      <div className="diagram-tabs" role="tablist" aria-label="Diagram type">
        <button
          id="diagram-tab-uml"
          type="button"
          role="tab"
          aria-selected={isUml}
          aria-controls="pattern-diagram-panel"
          className={isUml ? 'active' : ''}
          onClick={() => setKind('uml')}
          data-testid="diagram-tab-uml"
        >
          UML class diagram
        </button>
        <button
          id="diagram-tab-mermaid"
          type="button"
          role="tab"
          aria-selected={!isUml}
          aria-controls="pattern-diagram-panel"
          className={!isUml ? 'active' : ''}
          onClick={() => setKind('mermaid')}
          data-testid="diagram-tab-mermaid"
        >
          Mermaid flow
        </button>
      </div>
      <div id="pattern-diagram-panel" role="tabpanel" aria-labelledby={isUml ? 'diagram-tab-uml' : 'diagram-tab-mermaid'}>
        <MermaidCanvas
          key={`${patternId}-${kind}-${theme}`}
          id={`${patternId}-${kind}`}
          title={title}
          source={source}
          sourceLabel={isUml ? 'UML source' : 'Mermaid source'}
          theme={theme}
        />
      </div>
    </section>
  );
}

function MermaidCanvas({
  id,
  title,
  source,
  sourceLabel,
  theme,
}: {
  id: string;
  title: string;
  source: string;
  sourceLabel: string;
  theme: string;
}) {
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');
  const [showSource, setShowSource] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const renderId = `pattern-diagram-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}-${++nextRenderId}`;
    const dark = theme === 'dark';

    setSvg('');
    setError('');
    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        if (!isMounted) return;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            background: dark ? '#20242b' : '#fbf9f5',
            primaryColor: dark ? '#303943' : '#efe9df',
            primaryTextColor: dark ? '#f2eee6' : '#292c33',
            primaryBorderColor: dark ? '#84918f' : '#9b8c79',
            lineColor: dark ? '#c7bca8' : '#706b63',
            secondaryColor: dark ? '#27332f' : '#e6eee7',
            tertiaryColor: dark ? '#3a2f2b' : '#f3e7df',
            fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
          },
        });
        const { svg: renderedSvg } = await mermaid.render(renderId, source);
        if (isMounted) setSvg(renderedSvg);
      } catch (renderError: unknown) {
        if (isMounted) {
          setError(renderError instanceof Error ? renderError.message : 'The diagram could not be rendered.');
        }
      }
    };
    void renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [id, source, theme]);

  const copySource = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError('Clipboard access is unavailable. You can still select and copy the source below.');
      setShowSource(true);
    }
  };

  return (
    <div className="diagram-card">
      <div className="diagram-toolbar">
        <span>{title}</span>
        <div>
          <button type="button" onClick={() => setShowSource(value => !value)} aria-expanded={showSource}>
            {showSource ? <EyeOff size={13} /> : <Eye size={13} />}
            {showSource ? 'Hide source' : 'View source'}
          </button>
          <button type="button" onClick={copySource} aria-label={`Copy ${sourceLabel}`}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      {error && <p className="diagram-render-error" role="status">{error}</p>}
      <div className="diagram-canvas" role="img" aria-label={title}>
        {svg ? <div className="diagram-svg" dangerouslySetInnerHTML={{ __html: svg }} /> : !error ? <span>Drawing diagram…</span> : null}
      </div>
      {showSource && <pre className="diagram-source"><code>{source}</code></pre>}
    </div>
  );
}
