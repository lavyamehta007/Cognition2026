import React, { useState, useEffect } from 'react';

interface TelemetryNode {
  id: number;
  code: string;
  label: string;
  sublabel: string;
  register: string;
  status: string;
  payloadPreview: string;
}

const TELEMETRY_NODES: TelemetryNode[] = [
  {
    id: 0,
    code: '[01: PROPOSE_BUFFER]',
    label: 'INTENT CAPTURE & DRAFTING',
    sublabel: 'SIDE_EFFECT_LOCK: ENGAGED',
    register: '0x7F8A_0100',
    status: 'BUFFERED_READ_ONLY',
    payloadPreview: 'op: "smtp.dispatch" | target: "developer-team@acme.com" | state: UNVETTED',
  },
  {
    id: 1,
    code: '[02: AIRGAP_SANDBOX]',
    label: 'ADVERSARIAL CONSEQUENCE AUDIT',
    sublabel: 'CITATION_GROUNDING: STRICT',
    register: '0x7F8A_0240',
    status: 'ISOLATED_SIMULATION',
    payloadPreview: 'heuristics: PASS | blast_radius: LOW (0.15) | citations: 2/2 VERBATIM',
  },
  {
    id: 2,
    code: '[03: COMMIT_GATE]',
    label: 'POLICY ENFORCEMENT & RELEASE',
    sublabel: 'THRESHOLD: < 0.40 AUTO_COMMIT',
    register: '0x7F8A_03FF',
    status: '250_OK_DISPATCHED',
    payloadPreview: 'gate_decision: PROCEED | signature: VERIFIED | receipt: 250_OK_SMTP',
  },
];

export const Hero: React.FC = () => {
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(0);
  const [isAutoCycling, setIsAutoCycling] = useState<boolean>(true);

  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = window.setInterval(() => {
      setActiveNodeIndex((prev) => (prev + 1) % TELEMETRY_NODES.length);
    }, 2400);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  const activeNode = TELEMETRY_NODES[activeNodeIndex];

  // Crosshair coordinates on the SVG grid
  const crosshairs = [
    { x: 40, y: 40 },
    { x: 280, y: 40 },
    { x: 520, y: 40 },
    { x: 40, y: 210 },
    { x: 520, y: 210 },
    { x: 40, y: 380 },
    { x: 280, y: 380 },
    { x: 520, y: 380 },
  ];

  return (
    <section className="hero">
      <div className="hero-grid" aria-hidden="true"></div>

      <div className="hero-split">
        {/* Left Column: Copy & Primary Controls */}
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-tag">PRE-EXECUTION SAFETY LAYER</span>
            <span className="eyebrow-sep">·</span>
            <span>TWO-PHASE COMMIT ARCHITECTURE</span>
          </div>

          <h1>
            Before AI acts,<br />
            <span>think it through.</span>
          </h1>

          <p className="hero-description">
            Cognition intercepts autonomous agent proposals in an air-gapped consequence sandbox—auditing blast radius, policy leaks, and verbatim evidence before any side effect reaches production.
          </p>

          <div className="hero-actions">
            <a className="button button-primary" href="#lab">
              <span>Inspect Live Sandbox</span>
              <kbd className="kbd-badge kbd-dark">[ENTER]</kbd>
            </a>
            <a className="button button-quiet" href="#process">
              <span>Trace Pipeline Schema</span>
              <span className="arrow-glyph">→</span>
            </a>
          </div>

          <div className="hero-proof">
            <div className="proof-step">
              <span className="proof-idx">01</span>
              <span>PROPOSE_BUFFER</span>
            </div>
            <span className="proof-arrow">→</span>
            <div className="proof-step">
              <span className="proof-idx">02</span>
              <span>AIRGAP_SANDBOX</span>
            </div>
            <span className="proof-arrow">→</span>
            <div className="proof-step">
              <span className="proof-idx">03</span>
              <span>COMMIT_GATE</span>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Isometric Wireframe / Live State Machine Diagram */}
        <div className="telemetry-schematic-panel" aria-label="Interactive State Machine Telemetry Diagram">
          <div className="schematic-topbar">
            <div className="schematic-title">
              <span className="schematic-id">SYS_SCHEMATIC_01</span>
              <span className="schematic-sep">/</span>
              <span>STATE_MACHINE_TOPOLOGY</span>
            </div>
            <div className="schematic-readout">
              LATENCY: 14ms // MEM_ISOLATION: ACTIVE
            </div>
          </div>

          <div className="schematic-svg-wrapper">
            <svg
              viewBox="0 0 560 420"
              className="schematic-svg"
              role="img"
              aria-label="Hardware state machine diagram showing packet traversal from Propose Buffer to Airgap Sandbox to Commit Gate"
            >
              <defs>
                <pattern id="isoGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#22262C"
                    strokeWidth="0.75"
                    strokeOpacity="0.55"
                  />
                </pattern>
              </defs>

              {/* Precision 1px Coordinate Grid Background */}
              <rect x="0" y="0" width="560" height="420" fill="url(#isoGrid)" />

              {/* Subtle SVG Crosshair Markers (+) at Grid Intersections */}
              {crosshairs.map((pt, i) => (
                <g key={i} transform={`translate(${pt.x}, ${pt.y})`} stroke="#3A414C" strokeWidth="1">
                  <line x1="-4" y1="0" x2="4" y2="0" />
                  <line x1="0" y1="-4" x2="0" y2="4" />
                </g>
              ))}

              {/* Isometric Wireframe Backplane Platform */}
              <polygon
                points="280,28 528,118 280,208 32,118"
                fill="none"
                stroke="#22262C"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <polygon
                points="280,212 528,302 280,392 32,302"
                fill="none"
                stroke="#22262C"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <line x1="32" y1="118" x2="32" y2="302" stroke="#22262C" strokeWidth="1" strokeDasharray="2 4" />
              <line x1="528" y1="118" x2="528" y2="302" stroke="#22262C" strokeWidth="1" strokeDasharray="2 4" />
              <line x1="280" y1="208" x2="280" y2="392" stroke="#22262C" strokeWidth="1" strokeDasharray="2 4" />

              {/* Exposed Coordinate Axis Labels */}
              <text x="16" y="22" fill="#525B66" fontSize="9" fontFamily="JetBrains Mono, monospace">
                X:000 Y:000 // BUS_WIDTH: 128B
              </text>
              <text x="382" y="22" fill="#10B981" fontSize="9" fontFamily="JetBrains Mono, monospace">
                CLK: 4.2GHz_SYNC
              </text>

              {/* Connecting Bus Lines Between Hardware Nodes */}
              {/* Path 1 -> 2 */}
              <path
                d="M 280 112 L 280 166"
                fill="none"
                stroke={activeNodeIndex >= 1 ? '#10B981' : '#22262C'}
                strokeWidth="1.5"
              />
              {/* Path 2 -> 3 */}
              <path
                d="M 280 248 L 280 302"
                fill="none"
                stroke={activeNodeIndex >= 2 ? '#10B981' : '#22262C'}
                strokeWidth="1.5"
              />

              {/* Secondary Telemetry Feedback Loop Path (Self-Healing Return Bus) */}
              <path
                d="M 430 207 L 486 207 L 486 78 L 430 78"
                fill="none"
                stroke="#22262C"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x="494"
                y="146"
                fill="#525B66"
                fontSize="8"
                fontFamily="JetBrains Mono, monospace"
                transform="rotate(90, 494, 146)"
                textAnchor="middle"
              >
                SELF_HEAL_FEEDBACK_BUS
              </text>

              {/* Live Moving Packet Indicator along the vertical bus */}
              <g
                className="packet-carrier"
                style={{
                  transform: `translate(280px, ${
                    activeNodeIndex === 0 ? 78 : activeNodeIndex === 1 ? 207 : 338
                  }px)`,
                  transition: 'transform 420ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                <rect
                  x="-178"
                  y="-38"
                  width="356"
                  height="76"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="1"
                  strokeOpacity="0.4"
                />
              </g>

              {/* Animated Data Packet Pulse on Bus */}
              <rect
                x="276"
                y={activeNodeIndex === 0 ? 120 : activeNodeIndex === 1 ? 256 : 300}
                width="8"
                height="8"
                fill="#10B981"
                className="svg-packet-bit"
              />

              {/* NODE 01: [01: PROPOSE_BUFFER] */}
              <g
                className="schematic-node"
                transform="translate(110, 44)"
                onClick={() => {
                  setIsAutoCycling(false);
                  setActiveNodeIndex(0);
                }}
                style={{ cursor: 'pointer' }}
              >
                {/* Isometric 3D Wireframe Offset Frame */}
                <rect
                  x="4"
                  y="4"
                  width="340"
                  height="68"
                  fill="#0C0D0E"
                  stroke="#22262C"
                  strokeWidth="1"
                />
                <rect
                  x="0"
                  y="0"
                  width="340"
                  height="68"
                  fill={activeNodeIndex === 0 ? '#141918' : '#121417'}
                  stroke={activeNodeIndex === 0 ? '#10B981' : '#22262C'}
                  strokeWidth="1"
                />
                {/* Corner ticks */}
                <path d="M 0 6 L 0 0 L 6 0" fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d="M 334 0 L 340 0 L 340 6" fill="none" stroke="#10B981" strokeWidth="1.5" />

                <text x="14" y="22" fill="#10B981" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  [01: PROPOSE_BUFFER]
                </text>
                <text x="236" y="22" fill="#64707D" fontSize="9" fontFamily="JetBrains Mono, monospace">
                  REG: 0x7F8A_0100
                </text>
                <line x1="14" y1="32" x2="326" y2="32" stroke="#22262C" strokeWidth="1" />
                <text x="14" y="50" fill="#D1D5DB" fontSize="10" fontFamily="JetBrains Mono, monospace">
                  INTENT_CAPTURE // NO_SIDE_EFFECT_EXECUTION
                </text>
              </g>

              {/* NODE 02: [02: AIRGAP_SANDBOX] */}
              <g
                className="schematic-node"
                transform="translate(110, 173)"
                onClick={() => {
                  setIsAutoCycling(false);
                  setActiveNodeIndex(1);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="4"
                  y="4"
                  width="340"
                  height="68"
                  fill="#0C0D0E"
                  stroke="#22262C"
                  strokeWidth="1"
                />
                <rect
                  x="0"
                  y="0"
                  width="340"
                  height="68"
                  fill={activeNodeIndex === 1 ? '#141918' : '#121417'}
                  stroke={activeNodeIndex === 1 ? '#10B981' : '#22262C'}
                  strokeWidth="1"
                />
                <path d="M 0 6 L 0 0 L 6 0" fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d="M 334 0 L 340 0 L 340 6" fill="none" stroke="#10B981" strokeWidth="1.5" />

                <text x="14" y="22" fill="#10B981" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  [02: AIRGAP_SANDBOX]
                </text>
                <text x="236" y="22" fill="#64707D" fontSize="9" fontFamily="JetBrains Mono, monospace">
                  REG: 0x7F8A_0240
                </text>
                <line x1="14" y1="32" x2="326" y2="32" stroke="#22262C" strokeWidth="1" />
                <text x="14" y="50" fill="#D1D5DB" fontSize="10" fontFamily="JetBrains Mono, monospace">
                  HEURISTICS + ADVERSARIAL_SIM + CITATION_AUDIT
                </text>
              </g>

              {/* NODE 03: [03: COMMIT_GATE] */}
              <g
                className="schematic-node"
                transform="translate(110, 304)"
                onClick={() => {
                  setIsAutoCycling(false);
                  setActiveNodeIndex(2);
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x="4"
                  y="4"
                  width="340"
                  height="68"
                  fill="#0C0D0E"
                  stroke="#22262C"
                  strokeWidth="1"
                />
                <rect
                  x="0"
                  y="0"
                  width="340"
                  height="68"
                  fill={activeNodeIndex === 2 ? '#141918' : '#121417'}
                  stroke={activeNodeIndex === 2 ? '#10B981' : '#22262C'}
                  strokeWidth="1"
                />
                <path d="M 0 6 L 0 0 L 6 0" fill="none" stroke="#10B981" strokeWidth="1.5" />
                <path d="M 334 0 L 340 0 L 340 6" fill="none" stroke="#10B981" strokeWidth="1.5" />

                <text x="14" y="22" fill="#10B981" fontSize="11" fontWeight="600" fontFamily="JetBrains Mono, monospace">
                  [03: COMMIT_GATE]
                </text>
                <text x="236" y="22" fill="#64707D" fontSize="9" fontFamily="JetBrains Mono, monospace">
                  REG: 0x7F8A_03FF
                </text>
                <line x1="14" y1="32" x2="326" y2="32" stroke="#22262C" strokeWidth="1" />
                <text x="14" y="50" fill="#D1D5DB" fontSize="10" fontFamily="JetBrains Mono, monospace">
                  DECISION_GATE: AUTO (&lt;0.40) | HITL | VETO
                </text>
              </g>

              {/* Bottom Coordinate Readout */}
              <text x="16" y="406" fill="#525B66" fontSize="9" fontFamily="JetBrains Mono, monospace">
                PACKET_STATE: {activeNode.status}
              </text>
              <text x="378" y="406" fill="#64707D" fontSize="9" fontFamily="JetBrains Mono, monospace">
                ADDR: {activeNode.register}
              </text>
            </svg>
          </div>

          {/* Interactive Node Telemetry Footer Bar */}
          <div className="schematic-inspector-bar">
            <div className="inspector-node-tabs">
              {TELEMETRY_NODES.map((node, idx) => (
                <button
                  key={node.code}
                  type="button"
                  className={`inspector-tab ${activeNodeIndex === idx ? 'active' : ''}`}
                  onClick={() => {
                    setIsAutoCycling(false);
                    setActiveNodeIndex(idx);
                  }}
                >
                  <span>0{idx + 1}</span>
                  <span>{node.code.replace(/^\[0\d:\s*|\s*\]$/g, '')}</span>
                </button>
              ))}
              <button
                type="button"
                className={`inspector-tab mode-tab ${isAutoCycling ? 'active' : ''}`}
                onClick={() => setIsAutoCycling(!isAutoCycling)}
                title="Toggle automatic packet stepping"
              >
                {isAutoCycling ? 'CLK: AUTO' : 'CLK: MANUAL'}
              </button>
            </div>
            <div className="inspector-payload-line">
              <span className="payload-key">BUS_STREAM:</span>
              <code className="payload-code">{activeNode.payloadPreview}</code>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
