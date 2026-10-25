import React, { useState, useEffect, useCallback } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { BENCHMARK_TEST_CASES } from '../engine/benchmarks';
import { GroundedSandbox } from '../engine/sandbox';
import { SafeExecutionAgent } from '../engine/agent';
import { EmailDraft, TestCase } from '../types';

interface AgentComposerProps {
  onInterceptSend: (draft: EmailDraft, intent: string) => void;
  isSandboxOpen: boolean;
}

export const AgentComposer: React.FC<AgentComposerProps> = ({
  onInterceptSend,
  isSandboxOpen,
}) => {
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase>(BENCHMARK_TEST_CASES[2]);
  const [customIntent, setCustomIntent] = useState<string>(BENCHMARK_TEST_CASES[2].intent);
  const [isShielded, setIsShielded] = useState<boolean>(true);
  const [currentDraft, setCurrentDraft] = useState<EmailDraft | null>(null);
  const [unshieldedSentNotice, setUnshieldedSentNotice] = useState<string | null>(null);
  const [autoSendCountdown, setAutoSendCountdown] = useState<number | null>(null);
  const [isLockingScan, setIsLockingScan] = useState<boolean>(false);

  const sandbox = new GroundedSandbox('acme.com');
  const agent = new SafeExecutionAgent(sandbox, 2);

  const {
    displayedText,
    isTyping,
    start: startTyping,
    skip: skipTyping,
    reset: resetTyping,
  } = useTypewriter({
    speed: 14,
    onComplete: () => {
      setAutoSendCountdown(2);
    },
  });

  const generateAndTypeDraft = useCallback(
    (intent: string) => {
      resetTyping();
      setAutoSendCountdown(null);
      setUnshieldedSentNotice(null);
      setIsLockingScan(false);

      const initialDraft = agent.draftAction(intent);
      setCurrentDraft(initialDraft);
      startTyping(initialDraft.body);
    },
    [resetTyping, startTyping]
  );

  const handleSelectCase = useCallback(
    (tc: TestCase) => {
      setSelectedTestCase(tc);
      setCustomIntent(tc.intent);
      generateAndTypeDraft(tc.intent);
    },
    [generateAndTypeDraft]
  );

  const handleTriggerSend = useCallback(() => {
    if (!currentDraft || isLockingScan) return;
    setAutoSendCountdown(null);

    if (isShielded) {
      setUnshieldedSentNotice(null);
      // 0ms-260ms: Lock the composer window with a scanline overlay before opening modal
      setIsLockingScan(true);
      window.setTimeout(() => {
        setIsLockingScan(false);
        onInterceptSend(
          {
            ...currentDraft,
            body: displayedText || currentDraft.body,
          },
          customIntent
        );
      }, 260);
    } else {
      if (selectedTestCase.id === 'test-3' || customIntent.toLowerCase().includes('api key')) {
        setUnshieldedSentNotice(
          'CRITICAL INCIDENT: Hazardous email was dispatched directly to developer-team@acme.com without safety gating. Unencrypted API key harvesting and unauthorized layoff panic reached 150+ employees.'
        );
      } else if (selectedTestCase.id === 'test-2') {
        setUnshieldedSentNotice(
          'UNVETTED CLIENT OUTREACH: Staging database latency report was sent directly to enterprise client client-lead@megacorp.com without operator review.'
        );
      } else {
        setUnshieldedSentNotice(
          'ROUTINE DISPATCH: Direct message dispatched to alice@acme.com.'
        );
      }
    }
  }, [currentDraft, isLockingScan, isShielded, onInterceptSend, displayedText, customIntent, selectedTestCase.id]);

  // Countdown timer to simulate autonomous agent dispatch
  useEffect(() => {
    if (autoSendCountdown === null) return;
    if (autoSendCountdown > 0) {
      const timer = window.setTimeout(() => {
        setAutoSendCountdown((prev) => (prev !== null ? prev - 1 : null));
      }, 900);
      return () => clearTimeout(timer);
    } else if (autoSendCountdown === 0 && !isSandboxOpen && currentDraft) {
      handleTriggerSend();
    }
  }, [autoSendCountdown, isSandboxOpen, currentDraft, handleTriggerSend]);

  useEffect(() => {
    generateAndTypeDraft(selectedTestCase.intent);
  }, []);

  // Global keyboard shortcuts: [1], [2], [3] for scenarios, [CMD + ENTER] for dispatch
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSandboxOpen) return;
      const target = e.target as HTMLElement;
      const isInputFocused =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isTyping) {
          skipTyping();
        }
        handleTriggerSend();
        return;
      }

      if (!isInputFocused && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') {
          e.preventDefault();
          handleSelectCase(BENCHMARK_TEST_CASES[0]);
        } else if (e.key === '2') {
          e.preventDefault();
          handleSelectCase(BENCHMARK_TEST_CASES[1]);
        } else if (e.key === '3') {
          e.preventDefault();
          handleSelectCase(BENCHMARK_TEST_CASES[2]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSandboxOpen, isTyping, skipTyping, handleTriggerSend, handleSelectCase]);

  return (
    <div className="agent-composer-container">
      {/* Scenario Selector Bar with [1], [2], [3] Keyboard Shortcut Badges */}
      <div className="composer-scenarios">
        <div className="scenarios-topbar">
          <span className="scenarios-kicker">BENCHMARK_SCENARIO_SELECTOR</span>
          <span className="scenarios-hint">HOTKEYS: [1] [2] [3] TO SWITCH · [CMD + ENTER] TO DISPATCH</span>
        </div>

        <div className="scenario-chips-row">
          {BENCHMARK_TEST_CASES.map((tc, index) => {
            const isActive = selectedTestCase.id === tc.id;
            return (
              <button
                key={tc.id}
                type="button"
                className={`scenario-chip ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectCase(tc)}
              >
                <kbd className="kbd-badge">[{index + 1}]</kbd>
                <span className="chip-text">{tc.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Mail Client Window */}
      <div className={`mail-client-window ${isLockingScan ? 'scanline-locked' : ''}`}>
        {isLockingScan && (
          <div className="composer-scanline-overlay" aria-live="polite">
            <div className="scanline-sweep-bar" />
            <div className="scanline-lock-badge">
              <span>INTERCEPTING_OUTBOUND_SYSCALL // LOCKING_PROPOSE_BUFFER...</span>
            </div>
          </div>
        )}

        {/* Mail Client Topbar */}
        <div className="mail-client-topbar">
          <div className="agent-status-tag">
            <span className="status-square" aria-hidden="true" />
            <span>AGENT_RUNTIME: ACTIVE</span>
            <span className="tag-sep">//</span>
            <span className="tag-muted">PID: 0x48F2_SMTP</span>
          </div>

          {/* Sharp Rectangular Technical Safety Interceptor Switch */}
          <div className="interceptor-switch-box">
            <span className={`switch-state-label ${isShielded ? 'armed' : 'unshielded'}`}>
              {isShielded ? 'SAFETY INTERCEPTOR: ARMED' : 'UNSHIELDED DIRECT SEND'}
            </span>
            <button
              type="button"
              className={`tech-switch ${isShielded ? 'active' : 'inactive'}`}
              onClick={() => {
                setIsShielded(!isShielded);
                setUnshieldedSentNotice(null);
              }}
              title="Toggle Cognition Consequence Prediction Interceptor"
              aria-pressed={isShielded}
            >
              <span className="tech-switch-cell">OFF</span>
              <span className="tech-switch-cell">ON</span>
            </button>
          </div>
        </div>

        {/* Mail Composer Fields */}
        <div className="mail-form">
          <div className="mail-row">
            <label>RCPT_TO:</label>
            <div className="mail-input-chip">
              {currentDraft ? currentDraft.recipients.join(', ') : '...'}
            </div>
          </div>

          <div className="mail-row">
            <label>SUBJECT:</label>
            <div className="mail-subject-display">
              {currentDraft ? currentDraft.subject : 'Drafting...'}
            </div>
          </div>

          <div className="mail-row body-row">
            <label>PAYLOAD:</label>
            <div className="mail-body-editor">
              <pre className="typewriter-content">
                {displayedText}
                {isTyping && <span className="blinking-caret">▋</span>}
              </pre>

              {isTyping && (
                <div className="typing-status-indicator">
                  <span>STREAMING_AGENT_TOKENS (14ms/char)</span>
                  <button type="button" className="skip-button" onClick={skipTyping}>
                    <span>Skip typing</span>
                    <kbd className="kbd-badge">[ESC]</kbd>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Unshielded Disaster Alert */}
        {unshieldedSentNotice && (
          <div className="unshielded-alert-banner">
            <div className="alert-banner-header">
              <span>[ALERT_0x99] UNSHIELDED SEND OCCURRED</span>
              <span>SIDE_EFFECT_COMMITTED</span>
            </div>
            <div className="alert-banner-body">{unshieldedSentNotice}</div>
            <div className="alert-banner-actions">
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  setIsShielded(true);
                  setUnshieldedSentNotice(null);
                  generateAndTypeDraft(selectedTestCase.intent);
                }}
              >
                <span>Re-run with Cognition Safety Gate Armed</span>
                <span>→</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Controls Footer */}
        <div className="mail-footer">
          <div className="playback-controls">
            <button
              type="button"
              className="button button-quiet"
              onClick={() => generateAndTypeDraft(customIntent)}
              disabled={isTyping}
            >
              <span>Redraft Buffer</span>
              <kbd className="kbd-badge">[R]</kbd>
            </button>

            {isTyping && (
              <button
                type="button"
                className="button button-quiet"
                onClick={skipTyping}
              >
                <span>Instant Finish</span>
              </button>
            )}
          </div>

          <div className="send-action-wrapper">
            {autoSendCountdown !== null && autoSendCountdown > 0 && (
              <span className="countdown-badge">
                AUTO_DISPATCH IN {autoSendCountdown}s
              </span>
            )}

            <button
              type="button"
              className={`button ${isShielded ? 'button-primary' : 'button-danger'}`}
              onClick={handleTriggerSend}
              disabled={isTyping || !currentDraft}
            >
              <span>{isShielded ? 'Send (Intercept with Sandbox)' : 'Send Email (Unshielded)'}</span>
              <kbd className={`kbd-badge ${isShielded ? 'kbd-dark' : ''}`}>[CMD + ENTER]</kbd>
              <span>↗</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
