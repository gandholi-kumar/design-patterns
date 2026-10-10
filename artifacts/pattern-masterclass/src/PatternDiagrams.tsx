import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Eye, EyeOff, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
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
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const touchDistanceRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const renderId = `pattern-diagram-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}-${++nextRenderId}`;
    const dark = theme === 'dark';

    setSvg('');
    setError('');
    setZoom(1);
    setPan({ x: 0, y: 0 });

    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        if (!isMounted) return;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            fontSize: '15px',
            background: dark ? '#20242b' : '#fbf9f5',
            primaryColor: dark ? '#303943' : '#efe9df',
            primaryTextColor: dark ? '#f2eee6' : '#292c33',
            primaryBorderColor: dark ? '#84918f' : '#9b8c79',
            lineColor: dark ? '#c7bca8' : '#706b63',
            secondaryColor: dark ? '#27332f' : '#e6eee7',
            tertiaryColor: dark ? '#3a2f2b' : '#f3e7df',
            fontFamily: 'JetBrains Mono, IBM Plex Mono, ui-monospace, monospace',
          },
        });
        const { svg: renderedSvg } = await mermaid.render(renderId, source);
        if (isMounted) setSvg(renderedSvg);
      } catch (renderError: unknown) {
        if (typeof document !== 'undefined') {
          document.querySelectorAll(`[id^="d${renderId}"], [id^="dpattern-diagram-"]`).forEach(el => el.remove());
        }
        if (isMounted) {
          setError(renderError instanceof Error ? renderError.message : 'Unable to render diagram preview. View raw specification via "View source".');
        }
      }
    };
    void renderDiagram();

    return () => {
      isMounted = false;
      if (typeof document !== 'undefined') {
        document.querySelectorAll(`[id^="d${renderId}"], [id^="dpattern-diagram-"]`).forEach(el => el.remove());
      }
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

  const zoomIn = () => setZoom(z => Math.min(2.5, +(z + 0.15).toFixed(2)));
  const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.15).toFixed(2)));
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.12 : -0.12;
      setZoom(z => Math.min(2.5, Math.max(0.5, +(z + delta).toFixed(2))));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchDistanceRef.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - touchDistanceRef.current;
      if (Math.abs(diff) > 2) {
        const delta = diff > 0 ? 0.04 : -0.04;
        setZoom(z => Math.min(2.5, Math.max(0.5, +(z + delta).toFixed(2))));
        touchDistanceRef.current = dist;
      }
    } else if (e.touches.length === 1 && isDragging) {
      setPan({ x: e.touches[0].clientX - dragStartRef.current.x, y: e.touches[0].clientY - dragStartRef.current.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  return (
    <div className="diagram-card">
      <div className="diagram-toolbar">
        <span className="diagram-title">{title}</span>
        <div className="diagram-toolbar-actions">
          <div className="diagram-zoom-controls" role="group" aria-label="Diagram zoom controls">
            <button
              type="button"
              onClick={zoomOut}
              disabled={zoom <= 0.5}
              aria-label="Zoom out diagram"
              title="Zoom out"
              data-testid="diagram-zoom-out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="diagram-zoom-badge" title="Current zoom level">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              onClick={zoomIn}
              disabled={zoom >= 2.5}
              aria-label="Zoom in diagram"
              title="Zoom in"
              data-testid="diagram-zoom-in"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={resetZoom}
              aria-label="Reset diagram zoom and position"
              title="Reset view (100%)"
              data-testid="diagram-zoom-reset"
            >
              <RotateCcw size={13} />
            </button>
          </div>
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
      <div
        className={`diagram-canvas ${isDragging ? 'is-dragging' : ''}`}
        role="img"
        aria-label={title}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          cursor: isDragging ? 'grabbing' : zoom > 1 || pan.x !== 0 || pan.y !== 0 ? 'grab' : 'default',
        }}
      >
        {svg ? (
          <div
            className="diagram-viewport"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.08s ease-out',
            }}
          >
            <div className="diagram-svg" dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        ) : !error ? (
          <span>Drawing diagram…</span>
        ) : null}
      </div>
      {showSource && <pre className="diagram-source"><code>{source}</code></pre>}
    </div>
  );
}
