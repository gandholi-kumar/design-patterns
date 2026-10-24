import React from 'react';
import type { SolidPaths, Tone, LineTone } from './iso-kit';

export interface SolidProps {
  paths: SolidPaths;
  tone?: Tone;
  crease?: Tone | 'none';
  halo?: boolean;
  lit?: boolean;
  flat?: boolean;
  className?: string;
  inner?: React.ReactNode;
  children?: React.ReactNode;
}

export function Solid({
  paths,
  tone = 'hi',
  crease = 'faint',
  halo = false,
  lit = false,
  flat = false,
  className,
  inner,
  children,
}: SolidProps) {
  return (
    <g
      className={className ? `iso-solid ${className}` : 'iso-solid'}
      data-lit={lit ? '' : undefined}
      data-seamless={paths.seamless ? '' : undefined}
    >
      {halo ? <path className="iso-halo" d={paths.fill} /> : null}
      <path className="iso-fill" d={paths.fill} />
      {flat
        ? null
        : paths.shades.map((d, shade) =>
            d ? <path key={shade} className="iso-shade" data-shade={shade} d={d} /> : null
          )}
      {flat ? null : <path className="iso-top" d={paths.top} />}
      {crease === 'none' || !paths.crease ? null : (
        <path className="iso-line iso-crease" data-tone={crease} d={paths.crease} />
      )}
      {crease === 'none' || !paths.bevel ? null : (
        <path className="iso-line iso-bevel" data-tone={crease} d={paths.bevel} />
      )}
      {inner}
      <path className="iso-line iso-edge" data-tone={tone} d={paths.outline} />
      {children}
    </g>
  );
}

export interface LineProps {
  d: string;
  tone?: LineTone;
  dotted?: boolean;
  dashed?: boolean;
  flow?: boolean;
  className?: string;
}

export function Line({
  d,
  tone = 'lo',
  dotted = false,
  dashed = false,
  flow = false,
  className,
}: LineProps) {
  if (!d) return null;
  return (
    <path
      className={className ? `iso-line ${className}` : 'iso-line'}
      data-tone={tone}
      data-dotted={dotted ? '' : undefined}
      data-dashed={dashed ? '' : undefined}
      data-flow={flow ? '' : undefined}
      d={d}
    />
  );
}
