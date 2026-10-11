import React from 'react';

interface PageIntroProps {
  index: string;
  title: React.ReactNode;
  text: string;
}

export function PageIntro({ index, title, text }: PageIntroProps) {
  return (
    <div className="page-intro">
      <span className="eyebrow">{index}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
  );
}
