import React, { useState, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { GroundedSandbox } from '../engine/sandbox';
import { SafeExecutionAgent } from '../engine/agent';
import { ConsequenceReport, EmailDraft, PipelineResult } from '../types';

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: EmailDraft;
  intent: string;
}

export const SandboxModal: React.FC<SandboxModalProps> = ({
  isOpen,
  onClose,
  draft,
  intent,
}) => {
  const [scanStep, setScanStep] = useState<number>(0);
  const [initialReport, setInitialReport] = useState<ConsequenceReport | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [humanDecision, setHumanDecision] = useState<boolean | null>(null);
  const [selfHealingActive, setSelfHealingActive] = useState<boolean>(false);
  const [sanitizedDraft, setSanitizedDraft] = useState<EmailDraft | null>(null);
  const [sanitizedReport, setSanitizedReport] = useState<ConsequenceReport | null>(null);

  const sandbox = new GroundedSandbox('acme.com');
  const agent = new SafeExecutionAgent(sandbox, 2);

  // Typewriter for the self-healing revised draft
  const {
    displayedText: revisedBodyDisplayed,
    isTyping: isRevising,
    start: startRevising,
    skip: skipRevising,
  } = useTypewriter({
    speed: 15,
    onComplete: () => {
      // Re-audit the sanitized draft once typing completes
      if (sanitizedDraft) {
        const report = sandbox.simulate(sanitizedDraft, intent);
        setSanitizedReport(report);
      }
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setScanStep(0);
      setInitialReport(null);
      setPipelineResult(null);
      setHumanDecision(null);
      setSelfHealingActive(false);
      setSanitizedDraft(null);
      setSanitizedReport(null);
      return;
    }

    // Step 1: Simulate scanning stages in sandbox
    setScanStep(1);
    const report1 = sandbox.simulate(draft, intent);
    setInitialReport(report1);

    const timer1 = setTimeout(() => setScanStep(2), 350);
    const timer2 = setTimeout(() => {
      setScanStep(3);
      const res = agent.runPipeline(intent, false);
      setPipelineResult(res);

      // If high risk and needs self-healing (Case 3), trigger re-typing
      if (report1.score >= 0.70 || report1.recommended_action === 'BLOCK') {
        const feedback = [...report1.predicted_outcomes, ...report1.policy_violations].join('; ');
        const revised = agent.draftAction(intent, feedback);
        setSanitizedDraft(revised);
        setSelfHealingActive(true);
        startRevising(revised.body);
      }
    }, 700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, draft, intent]);

  if (!isOpen) return null;

  const currentReport = sanitizedReport || initialReport;
  const isAutoCommitted =
    (initialReport && initialReport.score < 0.40 && initialReport.recommended_action === 'PROCEED') ||
    (sanitizedReport && sanitizedReport.score < 0.40 && sanitizedReport.recommended_action === 'PROCEED');

  return (
    <div className="sandbox-modal-backdrop" onClick={onClose}>
      <div className="sandbox-modal-window" onClick={(e) => e.stopPropagation()}>
        {/* Glowing Top Frame */}
        <div className="sandbox-header">
          <div className="sandbox-brand">
            <span className="radar-ping"></span>
            <div>
              <h3>COGNITION CONSEQUENCE SANDBOX</h3>
              <small>PACKET INTERCEPTED BEFORE SEND · COGNITION AGENT ISOLATED IN MEMORY</small>
            </div>
          </div>
          <button className="sandbox-close-btn" onClick={onClose} aria-label="Close Sandbox">
            ✕
          </button>
        </div>

        {/* Scan Status Sequence Bar */}
        <div className="scan-sequence-bar">
          <div className={`scan-step ${scanStep >= 1 ? 'active' : ''}`}>
            <span className="step-dot"></span>
            <span>01 Heuristic Leak Scan</span>
          </div>
          <span className="scan-arrow">→</span>
          <div className={`scan-step ${scanStep >= 2 ? 'active' : ''}`}>
            <span className="step-dot"></span>
            <span>02 Adversarial Consequence Audit</span>
          </div>
          <span className="scan-arrow">→</span>
          <div className={`scan-step ${scanStep >= 3 ? 'active' : ''}`}>
            <span className="step-dot"></span>
            <span>03 Verbatim Citation Verification</span>
          </div>
        </div>

        <div className="sandbox-body-grid">
          {/* Left Column: Intercepted Draft & Self-Healing Stream */}
          <div className="sandbox-column payload-column">
            <div className="box-title">
              <span>INTERCEPTED OUTGOING PACKET</span>
              <span className="quarantine-pill">QUARANTINED</span>
            </div>

            <div className="payload-box">
              <div className="payload-field">
                <span className="field-label">TARGET RECIPIENTS:</span>
                <span className="field-value">{draft.recipients.join(', ')}</span>
              </div>
              <div className="payload-field">
                <span className="field-label">ORIGINAL SUBJECT:</span>
                <span className="field-value">{draft.subject}</span>
              </div>
              <div className="payload-field">
                <span className="field-label">ORIGINAL DRAFT:</span>
                <pre className="original-draft-body">{draft.body}</pre>
              </div>
            </div>

            {/* Self-Healing Re-typing Stream if triggered */}
            {selfHealingActive && sanitizedDraft && (
              <div className="self-healing-stream-box">
                <div className="stream-header">
                  <span style={{ color: 'var(--mint)', fontWeight: 700 }}>
                    ⚡ AGENT SELF-HEALING REVISION IN PROGRESS
                  </span>
                  {isRevising && (
                    <button className="skip-button" onClick={skipRevising}>
                      Fast Forward ↗
                    </button>
                  )}
                </div>
                <div style={{ fontSize: '10px', color: '#8fa99c', marginBottom: '6px' }}>
                  Auditor feedback supplied to agent: Removing API keys, unverified layoff claims, and panic language.
                </div>
                <div className="revised-subject">
                  <strong>Subject:</strong> {sanitizedDraft.subject}
                </div>
                <pre className="revised-draft-body">
                  {revisedBodyDisplayed}
                  {isRevising && <span className="blinking-caret">|</span>}
                </pre>
              </div>
            )}
          </div>

          {/* Right Column: Live Consequence Analysis & Gate Decision */}
          <div className="sandbox-column audit-column">
            <div className="box-title">
              <span>CONSEQUENCE PREDICTION AUDIT</span>
              {currentReport && (
                <span className={`risk-badge-sm risk-${currentReport.risk_level}`}>
                  {currentReport.risk_level} RISK ({(currentReport.score * 100).toFixed(0)}%)
                </span>
              )}
            </div>

            {scanStep < 3 && (
              <div className="sandbox-scanning-indicator">
                <div className="scanning-radar-line"></div>
                <span>Auditing downstream legal, operational & security outcomes...</span>
              </div>
            )}

            {scanStep >= 3 && currentReport && (
              <div className="audit-details">
                {/* Risk Gauge */}
                <div className="mini-meter">
                  <div className="mini-meter-bar">
                    <div
                      style={{
                        width: `${Math.min(currentReport.score * 100, 100)}%`,
                        background:
                          currentReport.score < 0.4
                            ? '#34d399'
                            : currentReport.score <= 0.7
                            ? '#fbbf24'
                            : '#f87171',
                      }}
                    ></div>
                  </div>
                  <div className="mini-meter-labels">
                    <span>Low Impact</span>
                    <span>Blast Radius: {currentReport.blast_radius}</span>
                  </div>
                </div>

                {/* Predicted Outcomes */}
                <div className="consequences-section">
                  <span className="section-label">PREDICTED DOWNSTREAM FALLOUT</span>
                  <ul>
                    {currentReport.predicted_outcomes.map((out, idx) => (
                      <li
                        key={idx}
                        style={{
                          color:
                            out.includes('hazard') || out.includes('breach') || out.includes('leak')
                              ? '#fca5a5'
                              : '#c6d4cd',
                        }}
                      >
                        {out}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Grounded Quotes */}
                {currentReport.grounded_evidence.length > 0 && (
                  <div className="grounding-section">
                    <span className="section-label">VERBATIM CITATIONS IN SOURCE</span>
                    <div className="grounding-quotes-list">
                      {currentReport.grounded_evidence.map((quote, idx) => (
                        <div key={idx} className="quote-pill">
                          <span style={{ color: quote.is_supported ? '#34d399' : '#f87171' }}>
                            {quote.is_supported ? '✓' : '✗'}
                          </span>
                          <span className="quote-text">"{quote.quoted_text}"</span>
                          <span className="quote-claim">→ {quote.claim}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gate Decision Panel */}
                <div className="gate-resolution-card">
                  <div className="gate-title">STAGE 03 / COMMIT GATE DECISION</div>

                  {/* Tier 1: Auto-Commit */}
                  {isAutoCommitted && (
                    <div className="commit-success-state">
                      <div className="badge-line">
                        <span className="status-badge success">
                          {sanitizedReport ? '✓ REVISION AUTO-COMMITTED' : '✓ AUTO-COMMITTED'}
                        </span>
                      </div>
                      <div className="receipt-box">
                        <code>250 OK: Message accepted for delivery to {draft.recipients.join(', ')}</code>
                      </div>
                      <p className="commit-note">
                        Risk score ({((sanitizedReport ? sanitizedReport.score : initialReport!.score) * 100).toFixed(0)}%) &lt; 40%. Verbatim evidence supported. Zero side-effect hazards detected.
                      </p>
                    </div>
                  )}

                  {/* Tier 2: Amber Risk Operator Approval Required */}
                  {!isAutoCommitted &&
                    currentReport.score > 0.40 &&
                    currentReport.score <= 0.70 &&
                    humanDecision === null && (
                      <div className="amber-review-state">
                        <div className="amber-heading">
                          <span>🧑‍💼 Operator Approval Required</span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#c3d1ca', margin: '4px 0 10px' }}>
                          External partner outreach detected. Please sign off on dispatching this platform notification.
                        </p>
                        <div className="amber-actions">
                          <button
                            className="button button-primary"
                            style={{ minHeight: '34px', fontSize: '10px' }}
                            onClick={() => setHumanDecision(true)}
                          >
                            Authorize & Release ↗
                          </button>
                          <button
                            className="button button-quiet"
                            style={{ minHeight: '34px', fontSize: '10px' }}
                            onClick={() => setHumanDecision(false)}
                          >
                            Reject & Drop Packet
                          </button>
                        </div>
                      </div>
                    )}

                  {/* Human Approved Receipt */}
                  {humanDecision === true && (
                    <div className="commit-success-state">
                      <span className="status-badge success">✓ HUMAN AUTHORIZED</span>
                      <div className="receipt-box">
                        <code>250 OK: Operator signature confirmed. Packet dispatched.</code>
                      </div>
                    </div>
                  )}

                  {/* Human Rejected Block */}
                  {humanDecision === false && (
                    <div className="commit-blocked-state">
                      <span className="status-badge blocked">✕ OPERATOR DROPPED PACKET</span>
                      <p style={{ fontSize: '10px', color: '#fca5a5', margin: '6px 0 0' }}>
                        Action aborted. No external communication reached client partner.
                      </p>
                    </div>
                  )}

                  {/* High Risk Blocked before healing */}
                  {!isAutoCommitted && currentReport.score >= 0.70 && !selfHealingActive && (
                    <div className="commit-blocked-state">
                      <span className="status-badge blocked">✕ BLOCKED AT GATE</span>
                      <p style={{ fontSize: '10px', color: '#fca5a5', margin: '6px 0 0' }}>
                        Blast radius threshold exceeded. Packet held in sandbox quarantine.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sandbox-footer">
          <div style={{ fontSize: '9px', font: 'var(--mono)', color: '#7a8e84' }}>
            COGNITION CONTEXT SANDBOX v2026 · cognition agent · ZERO UNCHECKED NETWORK DISPATCH
          </div>
          <button
            className="button button-primary"
            style={{ minHeight: '34px', fontSize: '10px' }}
            onClick={onClose}
          >
            {isAutoCommitted || humanDecision !== null ? 'Close & Return to Agent' : 'Close Sandbox'} <span>↗</span>
          </button>
        </div>
      </div>
    </div>
  );
};
