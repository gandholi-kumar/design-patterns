import React from 'react';
import type { Pattern } from '../data';
import { SimulatorsPage } from './SimulatorsPage';

export function SimulatorsRoute({ onSelect }: { onSelect: (pattern: Pattern) => void }) {
  return <SimulatorsPage onSelect={onSelect} />;
}
