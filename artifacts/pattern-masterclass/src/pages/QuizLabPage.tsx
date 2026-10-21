import { useState, useEffect } from 'react';
import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  RotateCcw,
  X,
  ArrowRight,
} from 'lucide-react';
import { QUIZ } from '../data';
import { PageIntro } from '../components/ui/PageIntro';
import { useLearningStore } from '../stores/useLearningStore';

export function QuizLabPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState('');
  const [filter, setFilter] = useState('All scenarios');

  const progress = useLearningStore((s) => s.progress);
  const recordAnswer = useLearningStore((s) => s.recordAnswer);
  const updateNote = useLearningStore((s) => s.updateNote);
  const toggleScenarioBookmark = useLearningStore((s) => s.toggleScenarioBookmark);
  const clearQuizProgress = useLearningStore((s) => s.clearQuizProgress);

  const questions = QUIZ.filter(
    (x) =>
      filter === 'All scenarios' ||
      (filter === 'Bookmarked'
        ? progress[x.id]?.bookmarked
        : (progress[x.id]?.attempts || 0) > 0)
  );

  const q = questions[index] || QUIZ[0];
  const current = progress[q.id];
  const answered = Boolean(selected);

  useEffect(() => {
    setSelected('');
  }, [index, filter]);

  const totalAttempts = Object.values(progress).reduce((acc, p) => acc + (p.attempts || 0), 0);
  const totalCorrect = Object.values(progress).reduce((acc, p) => acc + (p.correct || 0), 0);
  const accuracyPct = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  if (!questions.length) {
    return (
      <div className="page-content reveal">
        <PageIntro
          index="05 / SCENARIO LAB"
          title={
            <>
              Practice the
              <br />
              <em>recognition.</em>
            </>
          }
          text="Read the constraints before the options. Choose the pattern that fits the forces at play—not the one you last studied."
        />
        <div className="empty-state">
          <div className="empty-icon">
            <Bookmark size={20} />
          </div>
          <h3>No scenarios in this filter.</h3>
          <p>Answer a scenario or bookmark one to build this practice set.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => setFilter('All scenarios')}
          >
            Show all scenarios <ArrowRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  const handleAnswer = (optionId: string) => {
    if (answered) return;
    const option = q.options.find((o) => o.id === optionId)!;
    setSelected(optionId);
    recordAnswer(q.id, option.isCorrect);
  };

  const handleGo = (dir: number) => {
    setIndex((i) => (i + dir + questions.length) % questions.length);
  };

  return (
    <div className="page-content reveal">
      <PageIntro
        index="05 / SCENARIO LAB"
        title={
          <>
            Practice the
            <br />
            <em>recognition.</em>
          </>
        }
        text="Read the constraints before the options. Choose the pattern that fits the forces at play—not the one you last studied."
      />
      <div className="quiz-dashboard">
        <div className="quiz-stat">
          <span className="eyebrow">SCENARIOS</span>
          <b>{QUIZ.length.toString().padStart(2, '0')}</b>
          <small>three design situations</small>
        </div>
        <div className="quiz-stat">
          <span className="eyebrow">ATTEMPTS</span>
          <b>{totalAttempts.toString().padStart(2, '0')}</b>
          <small>answers recorded</small>
        </div>
        <div className="quiz-stat">
          <span className="eyebrow">ACCURACY</span>
          <b>
            {accuracyPct}
            <small>%</small>
          </b>
          <small>of all attempts</small>
        </div>
        <div className="quiz-streak">
          <span className="eyebrow">A NOTE TO SELF</span>
          <p>“A scenario is a set of constraints wearing a story.”</p>
          <span>FIELD GUIDE / 01</span>
        </div>
      </div>

      <div className="quiz-controls">
        <div className="quiz-filter">
          {['All scenarios', 'Attempted', 'Bookmarked'].map((f) => (
            <button
              type="button"
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => {
                setFilter(f);
                setIndex(0);
              }}
              data-testid={`quiz-filter-${f.toLowerCase()}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="quiz-controls-right">
          <span>
            SCENARIO {String(index + 1).padStart(2, '0')} <i /> {q.category.toUpperCase()} /{' '}
            {q.difficulty.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="question-layout">
        <article className="question-card">
          <div className="question-top">
            <span className="question-num">
              SCENARIO {String(q.scenarioNumber).padStart(2, '0')}
            </span>
            <span className="difficulty">{q.difficulty}</span>
            <button
              type="button"
              onClick={() => toggleScenarioBookmark(q.id)}
              className={`quiz-bookmark ${current?.bookmarked ? 'saved' : ''}`}
              aria-label="Bookmark scenario"
              data-testid="quiz-bookmark"
            >
              <Bookmark size={16} />
            </button>
          </div>
          <h2>{q.title}</h2>
          <p className="scenario-text">{q.systemScenario}</p>

          <div className="constraints">
            <span className="eyebrow">ARCHITECTURAL CONSTRAINTS</span>
            {q.architecturalConstraints.map((c, i) => (
              <div key={c}>
                <span>{String(i + 1).padStart(2, '0')}</span>
                {c}
              </div>
            ))}
          </div>

          <div className="answer-section">
            <span className="eyebrow">WHICH PATTERN FITS BEST?</span>
            <div className="answer-options">
              {q.options.map((o, i) => (
                <button
                  type="button"
                  disabled={answered}
                  onClick={() => handleAnswer(o.id)}
                  className={`answer-option ${
                    selected === o.id
                      ? o.isCorrect
                        ? 'correct'
                        : 'incorrect'
                      : answered && o.isCorrect
                      ? 'correct-reveal'
                      : ''
                  }`}
                  key={o.id}
                  data-testid={`quiz-answer-${o.id}`}
                >
                  <span className="option-key">{String.fromCharCode(65 + i)}</span>
                  <b>{o.patternName}</b>
                  {selected === o.id &&
                    (o.isCorrect ? <Check size={16} /> : <X size={16} />)}
                  {answered && o.isCorrect && selected !== o.id && <Check size={15} />}
                </button>
              ))}
            </div>
          </div>

          {answered && (
            <div
              className={`feedback ${
                q.options.find((o) => o.id === selected)?.isCorrect
                  ? 'feedback-good'
                  : 'feedback-review'
              }`}
              aria-live="polite"
            >
              <div className="feedback-icon">
                {q.options.find((o) => o.id === selected)?.isCorrect ? (
                  <Check size={16} />
                ) : (
                  <Lightbulb size={16} />
                )}
              </div>
              <div>
                <b>
                  {q.options.find((o) => o.id === selected)?.isCorrect
                    ? 'Good read.'
                    : 'Look at the constraint again.'}
                </b>
                <p>{q.deepExplanation}</p>
                <small>MEMORY RULE · {q.memoryRule}</small>
              </div>
            </div>
          )}

          <div className="question-nav">
            <button
              type="button"
              className="subtle-btn"
              onClick={() => handleGo(-1)}
              data-testid="quiz-previous"
            >
              <ChevronLeft size={15} /> Previous
            </button>
            <div>
              {questions.map((item, i) => (
                <button
                  type="button"
                  className={`question-dot ${i === index ? 'current' : ''} ${
                    progress[item.id] ? 'done' : ''
                  }`}
                  key={item.id}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to scenario ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="subtle-btn"
              onClick={() => handleGo(1)}
              data-testid="quiz-next"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </article>

        <aside className="notes-card">
          <div className="notes-header">
            <div>
              <span className="eyebrow">YOUR FIELD NOTES</span>
              <h3>Keep a thought.</h3>
            </div>
            <span className="notes-mark">01</span>
          </div>
          <p>Write down the clue that made this pattern click.</p>
          <textarea
            aria-label="Personal notes for scenario"
            placeholder="What did you notice about the constraints?"
            value={current?.note || ''}
            onChange={(e) => updateNote(q.id, e.target.value)}
            data-testid="quiz-notes"
          />
          <div className="notes-bottom">
            <span>
              <Check size={12} /> SAVED IN STATE
            </span>
            <span>BOX {current?.box || 1} / 5</span>
          </div>
          <div className="notes-separator" />
          <div className="notes-meta">
            <span>RECALL STAGE</span>
            <div className="leitner">
              {[1, 2, 3, 4, 5].map((b) => (
                <i className={b <= (current?.box || 1) ? 'filled' : ''} key={b} />
              ))}
            </div>
          </div>
          <p className="leitner-copy">
            Correct answers move this card forward. Misses return it to the start.
          </p>
        </aside>
      </div>

      <div className="quiz-bottom-note">
        <span className="eyebrow">HOW TO GET BETTER</span>
        <p>
          Before choosing a name, say the decision out loud:{' '}
          <b>“I need to vary ___ without changing ___.”</b>
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Clear all quiz attempts, notes, and bookmarks?')) {
              clearQuizProgress();
            }
          }}
          data-testid="reset-progress"
        >
          <RotateCcw size={14} /> Reset practice
        </button>
      </div>
    </div>
  );
}
