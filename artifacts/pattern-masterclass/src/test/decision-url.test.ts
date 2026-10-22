import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

interface DecisionUrlState {
  mode: 'diagnostic' | 'versus' | 'scenarios';
  diagnosticSubTab: 'ai' | 'wizard';
  versusSubTab: 'curated' | 'custom';
  dilemmaId: string;
  patternAId: string;
  patternBId: string;
}

function parseDecisionSearch(search: string): DecisionUrlState {
  const params = new URLSearchParams(search);
  const m = params.get('mode');
  const mode = m === 'versus' || m === 'scenarios' || m === 'diagnostic' ? m : 'diagnostic';
  const t = params.get('tab');
  const diagnosticSubTab = t === 'wizard' ? 'wizard' : 'ai';
  const versusSubTab = t === 'custom' ? 'custom' : 'curated';
  const dilemmaId = params.get('dilemma') || '';
  const patternAId = params.get('pA') || '';
  const patternBId = params.get('pB') || '';

  return { mode, diagnosticSubTab, versusSubTab, dilemmaId, patternAId, patternBId };
}

function formatDecisionSearch(state: DecisionUrlState): string {
  const params = new URLSearchParams();
  if (state.mode !== 'diagnostic') {
    params.set('mode', state.mode);
  }
  if (state.mode === 'diagnostic') {
    if (state.diagnosticSubTab !== 'ai') params.set('tab', state.diagnosticSubTab);
  } else if (state.mode === 'versus') {
    if (state.versusSubTab !== 'curated') params.set('tab', state.versusSubTab);
    if (state.versusSubTab === 'curated' && state.dilemmaId) params.set('dilemma', state.dilemmaId);
    if (state.versusSubTab === 'custom') {
      if (state.patternAId) params.set('pA', state.patternAId);
      if (state.patternBId) params.set('pB', state.patternBId);
    }
  }
  return params.toString() ? `?${params.toString()}` : '';
}

describe('Frontend Logic: Decision Engine Bidirectional URL State Sync', () => {
  it('parses default query state when query string is empty', () => {
    const parsed = parseDecisionSearch('');
    assert.deepEqual(parsed, {
      mode: 'diagnostic',
      diagnosticSubTab: 'ai',
      versusSubTab: 'curated',
      dilemmaId: '',
      patternAId: '',
      patternBId: '',
    });
  });

  it('correctly parses versus dilemma query with custom pattern comparator parameters', () => {
    const query = '?mode=versus&tab=custom&pA=strategy&pB=state';
    const parsed = parseDecisionSearch(query);

    assert.equal(parsed.mode, 'versus');
    assert.equal(parsed.versusSubTab, 'custom');
    assert.equal(parsed.patternAId, 'strategy');
    assert.equal(parsed.patternBId, 'state');
  });

  it('serializes and deserializes state without loss (Round-trip integrity)', () => {
    const original: DecisionUrlState = {
      mode: 'versus',
      diagnosticSubTab: 'ai',
      versusSubTab: 'custom',
      dilemmaId: '',
      patternAId: 'decorator',
      patternBId: 'adapter',
    };

    const formatted = formatDecisionSearch(original);
    assert.equal(formatted, '?mode=versus&tab=custom&pA=decorator&pB=adapter');

    const roundTrip = parseDecisionSearch(formatted);
    assert.deepEqual(roundTrip, original);
  });

  it('correctly encodes and decodes return path for PatternDetailPage navigation', () => {
    const decisionPath = '/decision-engine?mode=versus&tab=custom&pA=strategy&pB=state';
    const encodedFromParam = encodeURIComponent(decisionPath);

    const patternDetailUrl = `/pattern/strategy?from=${encodedFromParam}`;

    // On detail page back button click
    const urlParams = new URLSearchParams(patternDetailUrl.split('?')[1]);
    const fromParam = urlParams.get('from');
    assert.ok(fromParam);

    const decodedReturnUrl = decodeURIComponent(fromParam);
    assert.equal(decodedReturnUrl, decisionPath);

    // Verify state can be re-hydrated from return URL search params
    const searchString = decodedReturnUrl.split('?')[1];
    const hydratedState = parseDecisionSearch(`?${searchString}`);
    assert.equal(hydratedState.patternAId, 'strategy');
    assert.equal(hydratedState.patternBId, 'state');
  });
});
