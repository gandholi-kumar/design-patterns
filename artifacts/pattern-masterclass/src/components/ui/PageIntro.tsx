import React from 'react';
import { Layers3 } from 'lucide-react';

export interface PageIntroProps {
  index: string;
  title: React.ReactNode;
  text: string;
}

export function PageIntro({ index, title, text }: PageIntroProps) {
  return (
    <section className="page-intro">
      <div className="intro-left">
        <span className="eyebrow">
          <i className="eyebrow-line" />
          {index}
        </span>
        <h1>{title}</h1>
      </div>
      <div className="intro-right">
        <p>{text}</p>
      </div>
      <div className="intro-stamp">
        <Layers3 size={17} />
        <span>
          THE FIELD
          <br />
          GUIDE
        </span>
      </div>
    </section>
  );
}
