import React, { useState } from 'react';

interface HistogramBin {
  range: string;
  score: number;
  heightPct: number;
  zone: 'AUTO' | 'HITL' | 'VETO';
  label: string;
}

const HISTOGRAM_BINS: HistogramBin[] = [
  { range: '0.00–0.10', score: 0.05, heightPct: 82, zone: 'AUTO', label: 'Internal calendar syncs & routine status reads' },
  { range: '0.10–0.20', score: 0.15, heightPct: 94, zone: 'AUTO', label: 'Sanitized engineering incident notifications' },
  { range: '0.20–0.30', score: 0.25, heightPct: 58, zone: 'AUTO', label: 'Standard internal documentation updates' },
  { range: '0.30–0.40', score: 0.35, heightPct: 34, zone: 'AUTO', label: 'Cross-team resource scheduling requests' },
  { range: '0.40–0.50', score: 0.45, heightPct: 26, zone: 'HITL', label: 'External vendor correspondence (no PII)' },
  { range: '0.50–0.60', score: 0.55, heightPct: 44, zone: 'HITL', label: 'Enterprise partner staging latency disclosure' },
  { range: '0.60–0.70', score: 0.65, heightPct: 19, zone: 'HITL', label: 'Contractual SLA amendment proposals' },
  { range: '0.70–0.80', score: 0.75, heightPct: 14, zone: 'VETO', label: 'Bulk distribution list anxiety triggers' },
  { range: '0.80–0.90', score: 0.85, heightPct: 22, zone: 'VETO', label: 'External recipient confidential data leak' },
  { range: '0.90–1.00', score: 0.95, heightPct: 38, zone: 'VETO', label: 'Credential harvesting ("api_key") & layoff panic' },
];

interface CitationRule {
  id: string;
  token: string;
  ruleCode: string;
  severity: 'CRITICAL' | 'MEDIUM';
  offset: string;
  explanation: string;
}

const CITATION_RULES: CitationRule[] = [
  {
    id: 'rule-1',
    token: 'api_key',
    ruleCode: 'RULE_EXFIL_04',
    severity: 'CRITICAL',
    offset: 'byte[114..121]',
    explanation: 'Blocks outbound transmission of plaintext authentication tokens or secret material.',
  },
  {
    id: 'rule-2',
    token: 'laid off without severance',
    ruleCode: 'RULE_PANIC_01',
    severity: 'CRITICAL',
    offset: 'byte[58..84]',
    explanation: 'Quarantines unverified mass-termination claims targeted at company-wide aliases.',
  },
  {
    id: 'rule-3',
    token: 'staging database',
    ruleCode: 'RULE_SLA_02',
    severity: 'MEDIUM',
    offset: 'byte[92..108]',
    explanation: 'Flags internal infrastructure telemetry directed to external enterprise domains.',
  },
];

type GateMode = 'AUTO' | 'HITL' | 'VETO';

const GATE_SPECS: Record<
  GateMode,
  {
    threshold: string;
    action: string;
    egressState: string;
    description: string;
    color: string;
  }
> = {
  AUTO: {
    threshold: 'SCORE < 0.40 && GROUNDED == TRUE',
    action: '250 OK // DIRECT_COMMIT',
    egressState: 'PERMITTED (0ms HUMAN DELAY)',
    description: 'Low-risk, citation-verified actions bypass manual queues and execute immediately with an immutable audit receipt.',
    color: '#10B981',
  },
  HITL: {
    threshold: '0.40 <= SCORE <= 0.70',
    action: 'HOLD_IN_MEMORY // AWAIT_SIGNATURE',
    egressState: 'PAUSED (OPERATOR_GATE)',
    description: 'Ambiguous or client-facing actions pause in an isolated buffer until an authorized human operator signs or drops the packet.',
    color: '#F59E0B',
  },
  VETO: {
    threshold: 'SCORE > 0.70 || POLICY_VIOLATION > 0',
    action: 'QUARANTINE // SELF_HEAL_LOOP',
    egressState: 'BLOCKED (FEEDBACK_INJECTED)',
    description: 'High-risk actions are vetoed before side-effect execution; verbatim violation proofs are fed back to the agent to synthesize a safe revision.',
    color: '#F43F5E',
  },
};

export const Capabilities: React.FC = () => {
  const [selectedBinIdx, setSelectedBinIdx] = useState<number>(9);
  const [selectedRuleIdx, setSelectedRuleIdx] = useState<number>(0);
  const [gateMode, setGateMode] = useState<GateMode>('VETO');

  const activeBin = HISTOGRAM_BINS[selectedBinIdx];
  const activeRule = CITATION_RULES[selectedRuleIdx];
  const activeGate = GATE_SPECS[gateMode];

  return (
    <section className="section capabilities-ledger-section" id="capabilities">
      <div className="ledger-section-header">
        <div>
          <div className="section-kicker">01. TECHNICAL SPECIFICATION LEDGER</div>
          <h2>
            Intelligence is powerful.<br />
            <span>Judgment makes it deterministic.</span>
          </h2>
        </div>
        <p className="ledger-header-summary">
          Every proposed side effect is evaluated across three orthogonal verification planes before touching external interfaces.
        </p>
      </div>

      {/* Asymmetric Technical Specification Ledger (40% Left Spec / 60% Right Live Micro-Visualization) */}
      <div className="spec-ledger">
        {/* ROW 01: Consequence Prediction + Risk Distribution Histogram */}
        <article className="spec-row">
          <div className="spec-meta-col">
            <div className="spec-index-line">
              <span className="spec-code">SPEC_01</span>
              <span className="spec-divider">·</span>
              <span className="spec-subsystem">RISK_SCORING_PLANE</span>
            </div>
            <h3>Consequence prediction</h3>
            <p>
              Evaluates operational, security, and reputational blast radius on a normalized <code>0.00</code> to <code>1.00</code> scale before any network or tool call is committed.
            </p>
            <div className="spec-kv-list">
              <div className="spec-kv">
                <span>METRIC_DOMAIN</span>
                <code>[0.00 .. 1.00] FLOAT</code>
              </div>
              <div className="spec-kv">
                <span>AUTO_THRESHOLD</span>
                <code>&lt; 0.40 (EMERALD)</code>
              </div>
            </div>
          </div>

          <div className="spec-visual-col">
            <div className="micro-viz-header">
              <span>LIVE_MICRO_VIZ // RISK_DISTRIBUTION_HISTOGRAM</span>
              <span className="viz-readout">
                BIN: {activeBin.range} · GATE: <strong className={`zone-text-${activeBin.zone}`}>{activeBin.zone}</strong>
              </span>
            </div>

            <div className="histogram-stage" role="region" aria-label="Risk distribution histogram from 0.00 to 1.00">
              <div className="histogram-bars">
                {HISTOGRAM_BINS.map((bin, idx) => {
                  const isSelected = idx === selectedBinIdx;
                  return (
                    <button
                      key={bin.range}
                      type="button"
                      className={`hist-bar-wrapper ${isSelected ? 'selected' : ''}`}
                      onMouseEnter={() => setSelectedBinIdx(idx)}
                      onClick={() => setSelectedBinIdx(idx)}
                      aria-label={`Risk bin ${bin.range}, ${bin.zone}`}
                    >
                      <div className="hist-bar-track">
                        <div
                          className={`hist-bar-fill zone-fill-${bin.zone}`}
                          style={{ height: `${bin.heightPct}%` }}
                        />
                      </div>
                      <span className="hist-bar-label">{bin.score.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="histogram-Scale-bar">
                <span>0.00 (SAFE_AUTO)</span>
                <span>0.40 (HITL_GATE)</span>
                <span>0.70 (CRITICAL_VETO)</span>
                <span>1.00</span>
              </div>
            </div>

            <div className="micro-viz-footer">
              <span className="footer-tag">SAMPLE_PROFILE:</span>
              <code>{activeBin.label}</code>
            </div>
          </div>
        </article>

        {/* ROW 02: Grounded Evidence + Live Diff Substring Matcher */}
        <article className="spec-row">
          <div className="spec-meta-col">
            <div className="spec-index-line">
              <span className="spec-code">SPEC_02</span>
              <span className="spec-divider">·</span>
              <span className="spec-subsystem">VERBATIM_CITATION_AUDITOR</span>
            </div>
            <h3>Grounded evidence</h3>
            <p>
              Eliminates hallucinated safety warnings. Every flagged risk must cite an exact verbatim substring present in the proposed payload, mapped deterministically to a policy rule.
            </p>
            <div className="spec-kv-list">
              <div className="spec-kv">
                <span>MATCH_MODE</span>
                <code>EXACT_SUBSTRING_AST</code>
              </div>
              <div className="spec-kv">
                <span>UNGROUNDED_CLAIM</span>
                <code>DISCARDED_BY_DEFAULT</code>
              </div>
            </div>
          </div>

          <div className="spec-visual-col">
            <div className="micro-viz-header">
              <span>LIVE_MICRO_VIZ // SUBSTRING_TO_POLICY_DIFF_MATCHER</span>
              <span className="viz-readout">
                OFFSET: <code>{activeRule.offset}</code>
              </span>
            </div>

            <div className="diff-matcher-stage">
              <div className="diff-token-selector">
                {CITATION_RULES.map((rule, idx) => (
                  <button
                    key={rule.id}
                    type="button"
                    className={`diff-token-btn ${selectedRuleIdx === idx ? 'active' : ''}`}
                    onClick={() => setSelectedRuleIdx(idx)}
                  >
                    <span className="token-quote">"{rule.token}"</span>
                    <span className="token-arrow">→</span>
                    <span className={`token-rule sev-${rule.severity}`}>{rule.ruleCode}</span>
                  </button>
                ))}
              </div>

              <div className="diff-source-stream">
                <div className="diff-line">
                  <span className="line-num">01</span>
                  <span className="line-code">
                    payload.body = "Production is broken; employees are{' '}
                    <mark
                      className={`inline-token-mark ${selectedRuleIdx === 1 ? 'focused' : ''}`}
                      onClick={() => setSelectedRuleIdx(1)}
                    >
                      laid off without severance
                    </mark>
                    . Submit your{' '}
                    <mark
                      className={`inline-token-mark ${selectedRuleIdx === 0 ? 'focused' : ''}`}
                      onClick={() => setSelectedRuleIdx(0)}
                    >
                      api_key
                    </mark>{' '}
                    after checking the{' '}
                    <mark
                      className={`inline-token-mark amber ${selectedRuleIdx === 2 ? 'focused' : ''}`}
                      onClick={() => setSelectedRuleIdx(2)}
                    >
                      staging database
                    </mark>
                    ."
                  </span>
                </div>
                <div className="diff-line">
                  <span className="line-num">02</span>
                  <span className="line-code match-output">
                    └─► MATCHED_TOKEN: <strong>"{activeRule.token}"</strong> ──► POLICY:{' '}
                    <span className={`rule-badge sev-${activeRule.severity}`}>{activeRule.ruleCode}</span> [VERIFIED_TRUE]
                  </span>
                </div>
              </div>
            </div>

            <div className="micro-viz-footer">
              <span className="footer-tag">POLICY_ASSERTION:</span>
              <code>{activeRule.explanation}</code>
            </div>
          </div>
        </article>

        {/* ROW 03: Deliberate Commit Gate + Mechanical Tri-State Switch */}
        <article className="spec-row">
          <div className="spec-meta-col">
            <div className="spec-index-line">
              <span className="spec-code">SPEC_03</span>
              <span className="spec-divider">·</span>
              <span className="spec-subsystem">DETERMINISTIC_COMMIT_GATE</span>
            </div>
            <h3>A deliberate commit gate</h3>
            <p>
              Separates proposing an action from executing it. The tri-state commit gate routes every evaluated draft to automatic commit, human-in-the-loop signature, or self-healing quarantine.
            </p>
            <div className="spec-kv-list">
              <div className="spec-kv">
                <span>GATE_TOPOLOGY</span>
                <code>TRI_STATE_SWITCH</code>
              </div>
              <div className="spec-kv">
                <span>MAX_HEAL_RETRIES</span>
                <code>2 CYCLES_BEFORE_HALT</code>
              </div>
            </div>
          </div>

          <div className="spec-visual-col">
            <div className="micro-viz-header">
              <span>LIVE_MICRO_VIZ // MECHANICAL_TRI_STATE_COMMIT_SWITCH</span>
              <span className="viz-readout">
                STATE: <strong style={{ color: activeGate.color }}>{gateMode}</strong>
              </span>
            </div>

            <div className="tristate-gate-stage">
              <div className="tristate-switch-bank" role="radiogroup" aria-label="Tri-state commit gate selector">
                {(['AUTO', 'HITL', 'VETO'] as GateMode[]).map((mode, idx) => (
                  <button
                    key={mode}
                    type="button"
                    role="radio"
                    aria-checked={gateMode === mode}
                    className={`tristate-btn mode-${mode} ${gateMode === mode ? 'active' : ''}`}
                    onClick={() => setGateMode(mode)}
                  >
                    <div className="tristate-top-row">
                      <span className="tristate-idx">0{idx + 1}</span>
                      <span className="tristate-led" />
                    </div>
                    <span className="tristate-label">{mode}</span>
                    <small className="tristate-sub">
                      {mode === 'AUTO' ? 'PROCEED (<0.40)' : mode === 'HITL' ? 'OPERATOR (0.40–0.70)' : 'BLOCK (>=0.70)'}
                    </small>
                  </button>
                ))}
              </div>

              <div className="tristate-telemetry-readout">
                <div className="telemetry-row">
                  <span className="tel-key">INVARIANT_CONDITION:</span>
                  <code className="tel-val">{activeGate.threshold}</code>
                </div>
                <div className="telemetry-row">
                  <span className="tel-key">KERNEL_ACTION:</span>
                  <code className="tel-val" style={{ color: activeGate.color }}>
                    {activeGate.action}
                  </code>
                </div>
                <div className="telemetry-row">
                  <span className="tel-key">DISPATCH_BUS:</span>
                  <code className="tel-val">{activeGate.egressState}</code>
                </div>
              </div>
            </div>

            <div className="micro-viz-footer">
              <span className="footer-tag">GATE_BEHAVIOR:</span>
              <code>{activeGate.description}</code>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
};
