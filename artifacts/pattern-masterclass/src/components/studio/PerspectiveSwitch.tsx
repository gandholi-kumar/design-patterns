import React from 'react';
import { Cog, Laptop, Cloud } from 'lucide-react';

export type StudioPerspective = 'generic' | 'canonical' | 'enterprise';

interface PerspectiveSwitchProps {
  value: StudioPerspective;
  onChange: (perspective: StudioPerspective) => void;
  className?: string;
}

export function PerspectiveSwitch({ value, onChange, className = '' }: PerspectiveSwitchProps) {
  const options: { id: StudioPerspective; label: string; icon: typeof Cog; desc: string }[] = [
    {
      id: 'generic',
      label: 'Generic Metaphor',
      icon: Cog,
      desc: 'Physical apparatus / bench instrument',
    },
    {
      id: 'canonical',
      label: 'Canonical Desktop',
      icon: Laptop,
      desc: 'Classic OOP desktop & memory model',
    },
    {
      id: 'enterprise',
      label: 'Enterprise Cloud',
      icon: Cloud,
      desc: 'Modern cloud & distributed system',
    },
  ];

  return (
    <div
      className={`inline-flex items-center rounded-lg border border-border/50 bg-background/80 p-1 shadow-sm backdrop-blur-sm ${className}`}
      role="radiogroup"
      aria-label="Perspective selector"
    >
      {options.map((opt) => {
        const active = value === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
