import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { GroundedSandbox } from '../engine/sandbox';
import { SafeExecutionAgent } from '../engine/agent';
import { ConsequenceReport, EmailDraft } from '../types';

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: EmailDraft;
  intent: string;
}

type ModalAttemptTab = 'ATTEMPT_01' | 'ATTEMPT_02';

export const SandboxModal: React.FC<SandboxModalProps> = ({
  isOpen,
  onClose,
  draft,
  intent,
}) => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ModalAttemptTab>('ATTEMPT_01');
  const [attempt1Report, setAttempt1Report] = useState<ConsequenceReport | null>(null);
  const [sanitizedDraft, setSanitizedDraft] = useState<EmailDraft | null>(null);
  const [attempt2Report, setAttempt2Report] = useState<ConsequenceReport | null>(null);
  const [attempt2Unlocked, setAttempt2Unlocked] = useState<boolean>(false);
  const [humanDecision, setHumanDecision] = useState<boolean | null>(null);
  const [riskBarAnimatedScore, setRiskBarAnimatedScore] = useState<number>(0);
  const [gateFlashActive, setGateFlashActive] = useState<boolean>(false);

  const sandbox = new GroundedSandbox('acme.com');
  const agent = new SafeExecutionAgent(sandbox, 2);

  // 15ms-per-character monospace typewriter effect for PREDICTED DOWNSTREAM FALLOUT
  const {
    displayedText: falloutStreamText,
    isTyping: isStreamingFallout,
    start: startFalloutStream,
    skip: skipFalloutStream,
  } = useTypewriter({
    speed: 15,
  });

  // Typewriter for sanitized draft body in State B
  const {
    displayedText: revisedBodyText,
    isTyping: isTypingRevision,
    start: startRevisionTyping,
    skip: skipRevisionTyping,
  } = useTypewriter({
    speed: 12,
  });

  useEffect(() => {
    if (!isOpen) {
      setScanStep(0);
      setActiveTab('ATTEMPT_01');
      setAttempt1Report(null);
      setSanitizedDraft(null);
      setAttempt2Report(null);
      setAttempt2Unlocked(false);
      setHumanDecision(null);
      setRiskBarAnimatedScore(0);
      setGateFlashActive(false);
      return;
    }

    // Evaluate Attempt 01 immediately
    const report1 = sandbox.simulate(draft, intent);
    setAttempt1Report(report1);
    setActiveTab('ATTEMPT_01');
    setRiskBarAnimatedScore(0);

    const requiresSelfHealing = report1.score >= 0.70 || report1.recommended_action === 'BLOCK';
    let precomputedSanitizedDraft: EmailDraft | null = null;
    let precomputedReport2: ConsequenceReport | null = null;

    if (requiresSelfHealing) {
      const feedback = [...report1.predicted_outcomes, ...report1.policy_violations].join('; ');
      precomputedSanitizedDraft = agent.draftAction(intent, feedback);
      precomputedReport2 = sandbox.simulate(precomputedSanitizedDraft, intent);
      setSanitizedDraft(precomputedSanitizedDraft);
      setAttempt2Report(precomputedReport2);
    }

    // 0ms–300ms: Step through the top header bar (01 -> 02 -> 03)
    setScanStep(1);
    const tScan2 = window.setTimeout(() => setScanStep(2), 110);
    const tScan3 = window.setTimeout(() => setScanStep(3), 240);

    // 300ms–700ms: Animate Risk Bar fill width using spring physics + stream fallout bullets
    const tFallout = window.setTimeout(() => {
      setRiskBarAnimatedScore(report1.score);
      const formattedFallout = report1.predicted_outcomes
        .map((line, i) => `[0${i + 1}] ${line}`)
        .join('\n');
      startFalloutStream(formattedFallout);
    }, 300);

    // 700ms+: Flash STAGE 03 / COMMIT GATE DECISION badge
    const tGateFlash = window.setTimeout(() => {
      setGateFlashActive(true);
    }, 700);

    // For High-Risk drafts (Case 3): Hold on State A (Attempt 01 — 95% CRITICAL RISK)
    // then after a 900ms diagnostic pause (at ~1600ms total), unlock & transition to State B (Attempt 02 — 15% LOW RISK)
    let tAutoHeal: number | undefined;
    if (requiresSelfHealing && precomputedSanitizedDraft && precomputedReport2) {
      tAutoHeal = window.setTimeout(() => {
        setAttempt2Unlocked(true);
        setActiveTab('ATTEMPT_02');
        setRiskBarAnimatedScore(precomputedReport2!.score);
        startRevisionTyping(precomputedSanitizedDraft!.body);
        const formattedRevFallout = precomputedReport2!.predicted_outcomes
          .map((line, i) => `[0${i + 1}] ${line}`)
          .join('\n');
        startFalloutStream(formattedRevFallout);
        setGateFlashActive(false);
        window.setTimeout(() => setGateFlashActive(true), 120);
      }, 1600);
    }

    return () => {
      clearTimeout(tScan2);
      clearTimeout(tScan3);
      clearTimeout(tFallout);
      clearTimeout(tGateFlash);
      if (tAutoHeal) clearTimeout(tAutoHeal);
    };
  }, [isOpen, draft, intent]);

  // Handle manual tab switching between State A (Attempt 01) and State B (Attempt 02)
  const handleSelectTab = (tab: ModalAttemptTab) => {
    if (tab === 'ATTEMPT_02' && sanitizedDraft && attempt2Report) {
      setAttempt2Unlocked(true);
      setActiveTab('ATTEMPT_02');
      setRiskBarAnimatedScore(attempt2Report.score);
      startRevisionTyping(sanitizedDraft.body);
      const formattedRevFallout = attempt2Report.predicted_outcomes
        .map((line, i) => `[0${i + 1}] ${line}`)
        .join('\n');
      startFalloutStream(formattedRevFallout);
    } else if (tab === 'ATTEMPT_01' && attempt1Report) {
      setActiveTab('ATTEMPT_01');
      setRiskBarAnimatedScore(attempt1Report.score);
      const formattedFallout = attempt1Report.predicted_outcomes
        .map((line, i) => `[0${i + 1}] ${line}`)
        .join('\n');
      startFalloutStream(formattedFallout);
    }
  };

  if (!isOpen || !attempt1Report) return null;

  const hasSelfHealingFlow = Boolean(sanitizedDraft && attempt2Report);
  const isViewingAttempt2 = hasSelfHealingFlow && activeTab === 'ATTEMPT_02';

  const displayedDraft = isViewingAttempt2 && sanitizedDraft ? sanitizedDraft : draft;
  const displayedReport = isViewingAttempt2 && attempt2Report ? attempt2Report : attempt1Report;

  const isLowRiskAutoCommit =
    displayedReport.score < 0.40 && displayedReport.recommended_action === 'PROCEED';
  const isCriticalVeto =
    displayedReport.score >= 0.70 || displayedReport.recommended_action === 'BLOCK';

  const meterColor =
    displayedReport.score < 0.40
      ? '#10B981'
      : displayedReport.score <= 0.70
      ? '#F59E0B'
      : '#F43F5E';

  return (
    <div className="sandbox-modal-backdrop" onClick={onClose}>
      <div className="sandbox-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Top Header */}
        <div className="sandbox-header">
          <div className="sandbox-brand">
            <span
              className="status-square"
              style={{ background: isCriticalVeto ? '#F43F5E' : '#10B981' }}
            />
            <div>
              <h3>COGNITION CONSEQUENCE SANDBOX</h3>
              <small>PACKET INTERCEPTED BEFORE SEND · COGNITION AGENT ISOLATED IN MEMORY</small>
            </div>
          </div>
          <button
            type="button"
            className="sandbox-close-btn"
            onClick={onClose}
            aria-label="Close Sandbox"
          >
            ✕
          </button>
        </div>

        {/* 0ms–300ms Scan Sequence Bar */}
        <div className="scan-sequence-bar">
          <div className={`scan-step ${scanStep >= 1 ? 'active' : ''}`}>
            <span className="step-index">[01]</span>
            <span>01 Heuristic Leak Scan</span>
          </div>
          <span className="scan-arrow">→</span>
          <div className={`scan-step ${scanStep >= 2 ? 'active' : ''}`}>
            <span className="step-index">[02]</span>
            <span>02 Adversarial Consequence Audit</span>
          </div>
          <span className="scan-arrow">→</span>
          <div className={`scan-step ${scanStep >= 3 ? 'active' : ''}`}>
            <span className="step-index">[03]</span>
            <span>03 Verbatim Citation Verification</span>
          </div>
        </div>

        {/* Sequential State Stepper Tabs (Shown when Self-Healing Flow is present) */}
        {hasSelfHealingFlow && (
          <div className="sandbox-stepper-tabs" role="tablist" aria-label="Sandbox execution attempts">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ATTEMPT_01'}
              className={`stepper-tab tab-veto ${activeTab === 'ATTEMPT_01' ? 'active' : ''}`}
              onClick={() => handleSelectTab('ATTEMPT_01')}
            >
              <span className="tab-step-code">STATE_A // ATTEMPT_01</span>
              <span className="tab-step-title">INTERCEPTED &amp; VETOED</span>
              <span className="tab-risk-chip crimson">CRITICAL RISK (95%)</span>
            </button>

            <span className="stepper-connector">→</span>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'ATTEMPT_02'}
              className={`stepper-tab tab-healed ${activeTab === 'ATTEMPT_02' ? 'active' : ''}`}
              onClick={() => handleSelectTab('ATTEMPT_02')}
            >
              <span className="tab-step-code">STATE_B // ATTEMPT_02</span>
              <span className="tab-step-title">
                {attempt2Unlocked ? 'SELF-HEALING REVISION' : 'DIAGNOSTIC PAUSE (900ms)...'}
              </span>
              <span className="tab-risk-chip emerald">LOW RISK (15%)</span>
            </button>
          </div>
        )}

        <div className="sandbox-body-grid">
          {/* Left Column: Payload Inspector (State A Raw Draft vs State B Sanitized Revision) */}
          <div className="sandbox-column payload-column">
            <div className="box-title">
              <span>
                {isViewingAttempt2
                  ? 'SANITIZED OUTBOUND PAYLOAD (ATTEMPT 02)'
                  : 'INTERCEPTED OUTGOING PACKET (ATTEMPT 01)'}
              </span>
              <span className={isCriticalVeto ? 'quarantine-pill' : 'sanitized-pill'}>
                {isCriticalVeto ? 'QUARANTINED_VETO' : 'VERIFIED_SAFE'}
              </span>
            </div>

            <div className={`payload-box ${isViewingAttempt2 ? 'slide-in-sanitized' : ''}`}>
              <div className="payload-field">
                <span className="field-label">TARGET_RECIPIENTS:</span>
                <span className="field-value">{displayedDraft.recipients.join(', ')}</span>
              </div>
              <div className="payload-field">
                <span className="field-label">SUBJECT_HEADER:</span>
                <span className="field-value">{displayedDraft.subject}</span>
              </div>
              <div className="payload-field">
                <div className="field-label-row">
                  <span className="field-label">
                    {isViewingAttempt2 ? 'SANITIZED_BODY_BUFFER:' : 'RAW_DRAFT_BODY:'}
                  </span>
                  {isViewingAttempt2 && isTypingRevision && (
                    <button type="button" className="skip-button" onClick={skipRevisionTyping}>
                      Instant Fill
                    </button>
                  )}
                </div>
                <pre
                  className={`original-draft-body ${
                    isCriticalVeto ? 'draft-border-crimson' : 'draft-border-emerald'
                  }`}
                >
                  {isViewingAttempt2 ? revisedBodyText || displayedDraft.body : displayedDraft.body}
                  {isViewingAttempt2 && isTypingRevision && <span className="blinking-caret">▋</span>}
                </pre>
              </div>
            </div>

            {hasSelfHealingFlow && (
              <div className="state-transition-callout">
                {activeTab === 'ATTEMPT_01' ? (
                  <div className="callout-row">
                    <span>
                      [DIAGNOSTIC_HOLD] Raw draft violated <code>RULE_PANIC_01</code> &amp;{' '}
                      <code>RULE_EXFIL_04</code>. Injecting auditor feedback to synthesize Attempt 02...
                    </span>
                    <button
                      type="button"
                      className="skip-button"
                      onClick={() => handleSelectTab('ATTEMPT_02')}
                    >
                      Inspect Attempt 02 →
                    </button>
                  </div>
                ) : (
                  <div className="callout-row emerald">
                    <span>
                      [STATE_DIFF_PASS] Removed unencrypted credential demand and layoff panic. Routed incident logging to internal portal.
                    </span>
                    <button
                      type="button"
                      className="skip-button"
                      onClick={() => handleSelectTab('ATTEMPT_01')}
                    >
                      ← View Vetoed Attempt 01
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Consequence Prediction Audit & Commit Gate */}
          <div className="sandbox-column audit-column">
            <div className="box-title">
              <span>CONSEQUENCE PREDICTION AUDIT</span>
              <span className={`risk-badge-sm risk-${displayedReport.risk_level}`}>
                {displayedReport.risk_level} RISK ({(displayedReport.score * 100).toFixed(0)}%)
              </span>
            </div>

            <div className="audit-details">
              {/* Spring-Animated Risk Bar */}
              <div className="mini-meter">
                <div className="mini-meter-top">
                  <span>RISK_SCORE_METER</span>
                  <code style={{ color: meterColor }}>
                    {(riskBarAnimatedScore * 100).toFixed(0)}% // {displayedReport.risk_level}
                  </code>
                </div>
                <div className="mini-meter-bar">
                  <div
                    className="mini-meter-fill"
                    style={{
                      width: `${Math.min(riskBarAnimatedScore * 100, 100)}%`,
                      background: meterColor,
                    }}
                  />
                </div>
                <div className="mini-meter-labels">
                  <span>0% (SAFE)</span>
                  <span>BLAST_RADIUS: {displayedReport.blast_radius}</span>
                </div>
              </div>

              {/* 15ms/char Monospace Typewriter Fallout Stream */}
              <div className="consequences-section">
                <div className="field-label-row">
                  <span className="section-label">PREDICTED DOWNSTREAM FALLOUT</span>
                  {isStreamingFallout && (
                    <button type="button" className="skip-button" onClick={skipFalloutStream}>
                      Skip stream
                    </button>
                  )}
                </div>
                <pre
                  className={`fallout-typewriter-box ${
                    isCriticalVeto ? 'fallout-crimson' : 'fallout-emerald'
                  }`}
                >
                  {falloutStreamText}
                  {isStreamingFallout && <span className="blinking-caret">▋</span>}
                </pre>
              </div>

              {/* Verbatim Citations in Source */}
              {displayedReport.grounded_evidence.length > 0 && (
                <div className="grounding-section">
                  <span className="section-label">VERBATIM CITATIONS IN SOURCE</span>
                  <div className="grounding-quotes-list">
                    {displayedReport.grounded_evidence.map((quote, idx) => (
                      <div
                        key={idx}
                        className={`quote-pill ${isCriticalVeto ? 'quote-crimson' : 'quote-emerald'}`}
                      >
                        <span className="quote-status-glyph">
                          {isCriticalVeto ? '[VETO_TOKEN]' : '[SAFE_TOKEN]'}
                        </span>
                        <span className="quote-text">"{quote.quoted_text}"</span>
                        <span className="quote-claim">→ {quote.claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 700ms+ Stage 03 / Commit Gate Decision */}
              <div className={`gate-resolution-card ${gateFlashActive ? 'gate-flash' : ''}`}>
                <div className="gate-title">STAGE 03 / COMMIT GATE DECISION</div>

                {/* State A: Critical Risk Vetoed */}
                {isCriticalVeto && (
                  <div className="commit-blocked-state">
                    <div className="badge-line">
                      <span className="status-badge blocked">
                        ✕ VETOED AT COMMIT GATE (95% CRITICAL RISK)
                      </span>
                    </div>
                    <p className="commit-note crimson-note">
                      Outbound transmission blocked. Verbatim policy violations quoted above triggered autonomous self-healing feedback loop.
                    </p>
                  </div>
                )}

                {/* State B or Case 1: Low-Risk Auto-Commit with Slide-in 250 OK SMTP Receipt */}
                {isLowRiskAutoCommit && (
                  <div className="commit-success-state">
                    <div className="badge-line">
                      <span className="status-badge success">
                        {isViewingAttempt2
                          ? '✓ SANITIZED REVISION AUTO-COMMITTED'
                          : '✓ DIRECT AUTO-COMMIT APPROVED'}
                      </span>
                    </div>
                    <div className="receipt-box slide-in-receipt">
                      <code>
                        250 OK: Message accepted for delivery to {displayedDraft.recipients.join(', ')}
                      </code>
                    </div>
                    <p className="commit-note">
                      Audited risk score ({(displayedReport.score * 100).toFixed(0)}%) &lt; 40% threshold. Verbatim citations verified.
                    </p>
                  </div>
                )}

                {/* Tier 2: Amber Risk Operator Approval */}
                {!isLowRiskAutoCommit &&
                  !isCriticalVeto &&
                  displayedReport.score >= 0.40 &&
                  displayedReport.score <= 0.70 &&
                  humanDecision === null && (
                    <div className="amber-review-state">
                      <div className="amber-heading">
                        <span>[HITL_GATE] OPERATOR SIGNATURE REQUIRED</span>
                      </div>
                      <p className="amber-copy">
                        External enterprise partner domain detected ({(displayedReport.score * 100).toFixed(0)}% risk). Sign off to release packet from memory quarantine.
                      </p>
                      <div className="amber-actions">
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => setHumanDecision(true)}
                        >
                          <span>Authorize &amp; Release</span>
                          <span>→</span>
                        </button>
                        <button
                          type="button"
                          className="button button-quiet"
                          onClick={() => setHumanDecision(false)}
                        >
                          <span>Drop Packet</span>
                        </button>
                      </div>
                    </div>
                  )}

                {humanDecision === true && (
                  <div className="commit-success-state">
                    <span className="status-badge success">✓ OPERATOR SIGNED &amp; COMMITTED</span>
                    <div className="receipt-box slide-in-receipt">
                      <code>
                        250 OK: Operator signature verified. Dispatched to {displayedDraft.recipients.join(', ')}
                      </code>
                    </div>
                  </div>
                )}

                {humanDecision === false && (
                  <div className="commit-blocked-state">
                    <span className="status-badge blocked">✕ OPERATOR DROPPED PACKET</span>
                    <p className="commit-note crimson-note">
                      Execution aborted by operator. Zero external side effects occurred.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sandbox-footer">
          <div className="sandbox-footer-telemetry">
            COGNITION CONTEXT SANDBOX v2026 · cognition agent · ZERO UNCHECKED NETWORK DISPATCH
          </div>
          <button
            type="button"
            className="button button-primary"
            onClick={onClose}
          >
            <span>
              {isLowRiskAutoCommit || humanDecision !== null
                ? 'Close & Return to Agent'
                : 'Close Sandbox'}
            </span>
            <kbd className="kbd-badge kbd-dark">[ESC]</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
