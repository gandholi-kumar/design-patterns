import { useEffect, useState } from 'react';

interface TourOverlayProps {
  targetRect: DOMRect | null;
  onBackdropClick?: () => void;
}

const SPOTLIGHT_PADDING = 6;
const BORDER_RADIUS = 8;

export function TourOverlay({ targetRect, onBackdropClick }: TourOverlayProps) {
  const [windowDimensions, setWindowDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  }));

  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const cutout = targetRect
    ? {
        x: Math.max(0, targetRect.left - SPOTLIGHT_PADDING),
        y: Math.max(0, targetRect.top - SPOTLIGHT_PADDING),
        width: targetRect.width + SPOTLIGHT_PADDING * 2,
        height: targetRect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  return (
    <div
      className="tour-overlay-portal fixed inset-0 z-[9998] pointer-events-auto transition-opacity duration-300"
      aria-hidden="true"
    >
      {/* 1. Full-screen SVG with cut-out mask */}
      <svg
        className="absolute inset-0 h-full w-full"
        width={windowDimensions.width}
        height={windowDimensions.height}
        onClick={onBackdropClick}
      >
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White covers entire viewport (mask opaque) */}
            <rect
              x="0"
              y="0"
              width={windowDimensions.width}
              height={windowDimensions.height}
              fill="white"
            />
            {/* Black cuts out the spotlight hole (mask transparent) */}
            {cutout && (
              <rect
                x={cutout.x}
                y={cutout.y}
                width={cutout.width}
                height={cutout.height}
                rx={BORDER_RADIUS}
                ry={BORDER_RADIUS}
                fill="black"
                className="transition-all duration-300 ease-out"
              />
            )}
          </mask>
        </defs>

        {/* Shrouded dark backdrop with mask applied */}
        <rect
          x="0"
          y="0"
          width={windowDimensions.width}
          height={windowDimensions.height}
          fill="rgba(0, 0, 0, 0.65)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* 2. Spotlight Border & Halo Glow */}
      {cutout && (
        <div
          className="pointer-events-none fixed z-[9998] rounded-lg border-2 border-[var(--accent)] transition-all duration-300 ease-out"
          style={{
            left: `${cutout.x}px`,
            top: `${cutout.y}px`,
            width: `${cutout.width}px`,
            height: `${cutout.height}px`,
            boxShadow: '0 0 16px 2px rgba(212, 163, 86, 0.4), inset 0 0 8px rgba(212, 163, 86, 0.2)',
          }}
        />
      )}
    </div>
  );
}

