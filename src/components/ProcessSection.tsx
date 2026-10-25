import React, { useState, useEffect, useRef } from 'react';

interface PipelineStageSpec {
  id: number;
  count: string;
  code: string;
  title: string;
  subtitle: string;
  desc: string;
  stateBadge: string;
  latency: string;
  jsonSchema: string;
}

const PIPELINE_STAGES: PipelineStageSpec[] = [
  {
    id: 0,
    count: '01',
    code: 'STAGE_01 // PROPOSE_BUFFER',
    title: 'Propose',
    subtitle: 'Draft the intended action without executing it.',
    desc: 'The agent serializes its intended tool call into an immutable proposal buffer. Side-effect drivers (SMTP, REST, SQL) remain physically disconnected while the payload awaits sandbox verification.',
    stateBadge: 'INPUT_BUFFERED',
    latency: '1.2ms',
    jsonSchema: `{
  "schema_version": "cognition.v2026.1",
  "stage": "01_PROPOSE_BUFFER",
  "side_effect_lock": true,
  "proposal": {
    "tool": "smtp.send_message",
    "recipients": ["developer-team@acme.com"],
    "subject": "URGENT: Production Broken & Immediate Action Required",
    "body_hash": "sha256:9f86d081884c7d659a2feaa0c55ad015",
    "raw_tokens": 34
  }
}`,
  },
  {
    id: 1,
    count: '02',
    code: 'STAGE_02 // AIRGAP_SANDBOX',
    title: 'Simulate',
    subtitle: 'Evaluate risk, evidence, and predicted downstream outcomes.',
    desc: 'An adversarial consequence auditor executes 3 verification passes: deterministic policy regex, downstream blast-radius scoring, and strict substring citation verification against the source buffer.',
    stateBadge: 'SANDBOX_AUDIT',
    latency: '9.4ms',
    jsonSchema: `{
  "schema_version": "cognition.v2026.1",
  "stage": "02_AIRGAP_SANDBOX",
  "consequence_report": {
    "risk_level": "CRITICAL",
    "risk_score": 0.95,
    "blast_radius": "HIGH (company-wide / credentials)",
    "policy_violations": ["RULE_EXFIL_04", "RULE_PANIC_01"],
    "grounded_evidence": [
      {
        "claim": "Credential harvesting risk via email",
        "quoted_text": "send your personal api keys",
        "is_supported": true
      }
    ]
  }
}`,
  },
  {
    id: 2,
    count: '03',
    code: 'STAGE_03 // COMMIT_GATE',
    title: 'Commit gate',
    subtitle: 'Apply the decision policy before any real side effect.',
    desc: 'The commit gate evaluates the audited score and grounding invariant. High-risk payloads trigger an automated self-healing loop that synthesizes a compliant revision before releasing the 250 OK receipt.',
    stateBadge: 'GATE_ENFORCED',
    latency: '3.4ms',
    jsonSchema: `{
  "schema_version": "cognition.v2026.1",
  "stage": "03_COMMIT_GATE",
  "resolution": {
    "attempt_01": "VETOED_QUARANTINED (score: 0.95)",
    "self_healing_loop": "APPLIED_FEEDBACK_REVISION",
    "attempt_02_score": 0.15,
    "state_diff_verified": true,
    "final_decision": "COMMITTED_AUTO",
    "smtp_receipt": "250 OK: Message accepted for delivery"
  }
}`,
  },
];

export const ProcessSection: React.FC = () => {
  const [activeStage, setActiveStage] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0.15);
  const sectionRef = useRef<HTMLElement | null>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Compute normalized scroll progress through the Process Section [0.0 .. 1.0]
      const totalScrollable = rect.height + viewportHeight * 0.35;
      const currentScrolled = viewportHeight * 0.65 - rect.top;
      const clamped = Math.max(0.08, Math.min(1, currentScrolled / totalScrollable));
      setScrollProgress(clamped);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    stepRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStage(index);
            }
          });
        },
        {
          root: null,
          rootMargin: '-28% 0px -38% 0px',
          threshold: 0.2,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
    };
  }, []);

  const currentSpec = PIPELINE_STAGES[activeStage];
  // Packet Y position on the 360px SVG trace spine
  const packetY = Math.round(32 + (activeStage / 2) * 256);

  return (
    <section className="process-section" id="process" ref={sectionRef}>
      {/* Left-Hand Inspection Viewport: Dynamic JSON Schema & Stage Telemetry */}
      <div className="process-visual">
        <div className="schema-viewport-window">
          <div className="schema-viewport-header">
            <div className="schema-header-left">
              <span className="schema-stage-indicator">[{currentSpec.count}]</span>
              <span className="schema-title">{currentSpec.code}</span>
            </div>
            <div className="schema-header-right">
              <span>LATENCY: {currentSpec.latency}</span>
              <span className="schema-sep">//</span>
              <span className="schema-status-tag">{currentSpec.stateBadge}</span>
            </div>
          </div>

          {/* Crisp SVG Bus Diagram inside the viewport */}
          <div className="schema-svg-bus-strip">
            <svg viewBox="0 0 520 58" className="schema-bus-svg" aria-hidden="true">
              <line x1="36" y1="29" x2="484" y2="29" stroke="#22262C" strokeWidth="1.5" />
              <line
                x1="36"
                y1="29"
                x2={activeStage === 0 ? 110 : activeStage === 1 ? 260 : 484}
                y2="29"
                stroke="#10B981"
                strokeWidth="1.5"
                style={{ transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              />

              {PIPELINE_STAGES.map((st, idx) => {
                const cx = idx === 0 ? 80 : idx === 1 ? 260 : 440;
                const isNodeActive = idx === activeStage;
                const isNodePassed = idx <= activeStage;
                return (
                  <g
                    key={st.count}
                    transform={`translate(${cx}, 29)`}
                    onClick={() => setActiveStage(idx)}
                    style={{ cursor: 'pointer' }}
                  >
                    <rect
                      x="-58"
                      y="-16"
                      width="116"
                      height="32"
                      fill={isNodeActive ? '#141D1A' : '#0C0D0E'}
                      stroke={isNodeActive ? '#10B981' : isNodePassed ? '#34D399' : '#22262C'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={isNodeActive ? '#10B981' : '#9CA3AF'}
                      fontSize="9"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={isNodeActive ? '700' : '400'}
                    >
                      {st.count}: {st.title.toUpperCase()}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Live JSON Schema Inspection Block */}
          <div className="schema-code-container">
            <div className="schema-code-meta">
              <span>PAYLOAD_SCHEMA_INSPECTOR</span>
              <span>MIME: application/json</span>
            </div>
            <pre className="schema-json-pre">
              <code>{currentSpec.jsonSchema}</code>
            </pre>
          </div>

          <div className="schema-viewport-footer">
            <span>SCROLL_SCRUB: {(scrollProgress * 100).toFixed(0)}%</span>
            <span>MEM_ISOLATION: VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Right-Hand Scroll-Scrubbed Pipeline Trace */}
      <div className="process-copy">
        <div className="section-kicker">02. THE TWO-PHASE COMMIT PIPELINE</div>
        <h2>
          From intention<br />
          to <span>verified execution.</span>
        </h2>
        <p className="process-intro">
          Autonomous agents never jump directly from prompt generation to external side effects. Scroll or select each pipeline node to inspect the live state transition schema.
        </p>

        <div className="pipeline-trace-layout">
          {/* Vertical SVG Spine with Scrubbed Data Packet */}
          <div className="trace-spine-col" aria-hidden="true">
            <svg viewBox="0 0 36 320" className="trace-spine-svg">
              {/* Background Track */}
              <line x1="18" y1="12" x2="18" y2="308" stroke="#22262C" strokeWidth="1.5" />
              {/* Active Emerald Scrubbed Track */}
              <line
                x1="18"
                y1="12"
                x2="18"
                y2={packetY}
                stroke="#10B981"
                strokeWidth="1.5"
                style={{ transition: 'all 160ms cubic-bezier(0.16, 1, 0.3, 1)' }}
              />
              {/* Crosshairs at Node Anchors */}
              {[32, 160, 288].map((ny, i) => (
                <g key={i} transform={`translate(18, ${ny})`}>
                  <rect
                    x="-5"
                    y="-5"
                    width="10"
                    height="10"
                    fill={activeStage >= i ? '#10B981' : '#121417'}
                    stroke={activeStage >= i ? '#10B981' : '#3A414C'}
                    strokeWidth="1"
                  />
                </g>
              ))}
              {/* Scrubbing Data Packet */}
              <g
                style={{
                  transform: `translate(18px, ${packetY}px)`,
                  transition: 'transform 160ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <rect x="-8" y="-8" width="16" height="16" fill="none" stroke="#10B981" strokeWidth="1" />
                <rect x="-3" y="-3" width="6" height="6" fill="#34D399" />
              </g>
            </svg>
          </div>

          {/* Interactive Step Nodes */}
          <div className="step-list">
            {PIPELINE_STAGES.map((s, idx) => {
              const isActive = activeStage === idx;
              return (
                <div
                  key={s.count}
                  ref={(el) => {
                    stepRefs.current[idx] = el;
                  }}
                  className={`step-trace-card ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveStage(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveStage(idx);
                    }
                  }}
                >
                  <div className="step-trace-top">
                    <span className="step-count">[{s.count}]</span>
                    <span className="step-code-label">{s.code}</span>
                    <span className="step-state">{s.stateBadge}</span>
                  </div>
                  <h3>{s.title} — {s.subtitle}</h3>
                  <p>{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
