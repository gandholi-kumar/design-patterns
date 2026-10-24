import { useState } from 'react';
import type { Pattern } from '../data';
import { SimulatorsPage } from './SimulatorsPage';
import { WipModulePlaceholder } from '../components/WipModulePlaceholder';

export function SimulatorsRoute({ onSelect }: { onSelect: (pattern: Pattern) => void }) {
  const [showPrototype, setShowPrototype] = useState(false);
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPreview = search?.get('preview') === 'true' || showPrototype;

  if (isPreview) {
    return (
      <div className="wip-preview-host">
        <div className="wip-preview-banner">
          <div className="wip-banner-left">
            <span className="wip-banner-pill">EARLY ALPHA</span>
            <span className="wip-banner-text">You are testing the experimental prototype of Pattern Studio.</span>
          </div>
          <button
            type="button"
            className="wip-banner-exit-btn"
            onClick={() => setShowPrototype(false)}
          >
            Back to Roadmap
          </button>
        </div>
        <SimulatorsPage onSelect={onSelect} />
      </div>
    );
  }

  return (
    <WipModulePlaceholder
      moduleIndex="05 / PATTERN STUDIO"
      moduleTitle="Interactive Pattern Studio"
      moduleHeadline="Visual drag-and-drop structural simulator & reactive event debugger for Gang of Four patterns."
      courtesyMessage="We are currently building high-fidelity visual diagrams, real-time message buses, and state-machine sandboxes. This module is in active development and will be published in the next update."
      onLaunchPrototype={() => setShowPrototype(true)}
      prototypeName="Pattern Studio Alpha"
      upcomingFeatures={[
        {
          title: 'Visual Component Wiring',
          desc: 'Connect Strategy algorithms, Observer dispatchers, and Decorator wrappers on an interactive HTML5 canvas.',
        },
        {
          title: 'Live Execution Visualizer',
          desc: 'Watch object allocations, virtual call dispatches, and memory footprints step-by-step in real time.',
        },
        {
          title: 'Interactive State Replay',
          desc: 'Step forward and backward through State transitions and Memento snapshots with time-travel debugging.',
        },
      ]}
    />
  );
}
