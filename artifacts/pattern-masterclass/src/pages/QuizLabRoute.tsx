import { useState } from 'react';
import { QuizLabPage } from './QuizLabPage';
import { WipModulePlaceholder } from '../components/WipModulePlaceholder';

export function QuizLabRoute() {
  const [showPrototype, setShowPrototype] = useState(false);
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isPreview = search?.get('preview') === 'true' || showPrototype;

  if (isPreview) {
    return (
      <div className="wip-preview-host">
        <div className="wip-preview-banner">
          <div className="wip-banner-left">
            <span className="wip-banner-pill">EARLY ALPHA</span>
            <span className="wip-banner-text">You are testing the experimental prototype of Scenario Lab.</span>
          </div>
          <button
            type="button"
            className="wip-banner-exit-btn"
            onClick={() => setShowPrototype(false)}
          >
            Back to Roadmap
          </button>
        </div>
        <QuizLabPage />
      </div>
    );
  }

  return (
    <WipModulePlaceholder
      moduleIndex="06 / SCENARIO LAB"
      moduleTitle="Scenario Lab & Knowledge Arena"
      moduleHeadline="Real-world system design challenges, timed pattern quizzes, and architectural trade-off evaluations."
      courtesyMessage="Scenario Lab is currently being populated with production enterprise incident post-mortems and GoF system refactoring challenges. Stay tuned for the upcoming interactive release!"
      onLaunchPrototype={() => setShowPrototype(true)}
      prototypeName="Scenario Lab Alpha"
      upcomingFeatures={[
        {
          title: 'Architecture Incident Drills',
          desc: 'Analyze broken microservice topologies and select the exact GoF pattern required to stop cascading failures.',
        },
        {
          title: 'Timed Pattern Diagnostic Gauntlets',
          desc: 'Test your pattern recognition reflex with 30-second rapid-fire architectural dilemma quizzes.',
        },
        {
          title: 'Automated ADR Rubric & Scoring',
          desc: 'Draft your architectural decision records and receive instant automated rubric feedback on trade-off coverage.',
        },
      ]}
    />
  );
}
