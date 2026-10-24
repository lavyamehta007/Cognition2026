# Animated Agent Mailbox & High-Tech Sandbox Interceptor

An interactive live demonstration experience inside the Cognition Lab where an AI agent types out an email in real time, makes a high-stakes mistake, and when attempting to hit "Send", is intercepted in transit by a high-tech Consequence Sandbox modal that audits risks, sanitizes hazards, and safely gates the action.

## User Review & Critical Decisions

> [!IMPORTANT]
> The user confirmed the visual flow and architecture choices:
> - **Location**: Directly integrated into the main Cognition Lab section, featuring an authentic agent email composer window with live typewriter text generation.
> - **Interception Visual**: High-tech modal popup container that springs open right as the agent hits "Send", visually quarantining the outgoing payload before it touches the real network.
> - **Self-Healing Re-typing**: If the draft is hazardous (as in Case 3), the agent actively re-types the sanitized revision inside the sandbox window, which passes the commit gate and issues a green auto-commit receipt.

---

## 1. Overview & Core Concept

- **The Problem It Solves**: In autonomous agent workflows, users and evaluators struggle to visualize why consequence prediction is needed if all they see is a static output. 
- **The Experience**:
  1. **Unguarded Agent Phase**: The agent receives a command. A live streaming typewriter animation types out the draft in the composer. The agent draft contains a critical mistake (e.g. mass layoff rumors, asking for unencrypted API keys, or leaking staging issues to enterprise partners).
  2. **Interception Button**: The user arms the **"Cognition Safety Gate"** via an interactive toggle/button.
  3. **The Interception Catch**: The agent attempts to dispatch the email (`Agent clicking Send...`). Instead of delivering, a glowing **"COGNITION CONSEQUENCE SANDBOX // PAYLOAD INTERCEPTED"** modal launches, holding the packet in quarantine.
  4. **Sandbox Simulation**: Inside the modal, the 3 sandbox layers execute in real time: heuristic checks, risk scoring with blast radius gauge, and verbatim quote grounding.
  5. **Resolution & Self-Healing**: 
     - If Low Risk: Instant auto-commit receipt.
     - If Amber Risk: Operator authorization buttons inside the modal.
     - If Critical Risk: The agent self-heals by streaming the sanitized, professional revision directly in the sandbox, re-runs the gate, and auto-commits.
  6. **Playback Controls**: Includes an "Instant Finish" toggle so judges and evaluators can watch the cinematic animation or jump directly to the final result.

---

## 2. User Experience & Visual Design

### The Agent Mailbox Composer (Main Lab Canvas)
- **Top Bar**: Simulated agent client status (`AGENT STATUS: ONLINE`, `TARGET: developer-team@acme.com`).
- **Input Fields**: Recipients tag bar, Subject line, and rich email body editor.
- **Typewriter Effect**: Smooth character streaming with a blinking terminal caret (`|`) at adjustable speeds, rendering text in `font-mono` / `font-sans`.
- **Arming Control**: A glowing segmented toggle: `UNSHIELDED AGENT` vs `COGNITION CONSEQUENCE INTERCEPTOR [ACTIVE]`.
- **Primary Action**: Animated "Send Message" button that shows the agent cursor moving or pulsing toward dispatch.

### The Interceptor Modal (High-Tech Sandbox)
- **Visual Stance**: Dark backdrop blur (`backdrop-blur-md`), deep dark emerald/slate panel (`#0a0f0d`), neon mint hairline border (`border-mint/30`), glowing corner brackets.
- **Header**: Pulsing signal dot with status: `PACKET INTERCEPTED BEFORE NETWORK EGRESS // ISOLATED IN MEMORY SANDBOX`.
- **Live Audit Progress Bar**: Multi-step scan animation:
  1. `[✓] Deterministic Policy Scan`
  2. `[✓] Blast Radius & Impact Calculation`
  3. `[✓] Verbatim Citation Verification`
- **Consequence Breakdown**: Live risk meter gauge, blast radius tag, verbatim quotes with green checkmarks or red warnings.
- **Self-Healing Stream**: For high-risk emails, an embedded terminal displays the auditor feedback and streams the sanitized replacement draft before releasing the `250 OK` delivery receipt.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Real-Time Typewriter State Machine**:
  - *Chosen Approach*: Implement a timer-driven typewriter hook (`useTypewriter`) with playback state controls (`playing`, `paused`, `completed`, `skip`).
  - *Why*: Allows the user to appreciate the agent's drafting process without locking them into an unskippable delay.
- **Decision 2: Modal Interception vs. Static Results**:
  - *Chosen Approach*: The modal acts as an authentic "safety net" that explicitly catches the draft in mid-send.
  - *Why*: Directly dramatizes the core product thesis—an agent about to cause damage is prevented from doing so at the commit gate.
- **Decision 3: Retaining Benchmark Selectors**:
  - *Chosen Approach*: Users can switch between Case 1 (Low-Risk Sync), Case 2 (Partner Latency Notice), and Case 3 (Critical Panic/API Key Roadblock), or type a custom command. Each scenario runs through the typewriter & interceptor flow.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                 Agent Mailbox Composer                      │
│   [Select Scenario / Custom Intent]                         │
│   [Typewriter Stream: Recipients, Subject, Draft Body]       │
│                                                             │
│   Toggle: [UNSHIELDED AGENT]  [COGNITION INTERCEPTOR (ON)]  │
│                                                             │
│   Action: [Send Message (Agent Triggered)]                  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               IF UNSHIELDED   │   IF SHIELDED (COGNITION ON)
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌──────────────────────┐              ┌──────────────────────┐
 │ Hazardous Email Sent │              │  INTERCEPTOR MODAL   │
 │ to Real Network!     │              │  Payload Quarantined │
 │ (Blast / Data Leak)  │              │                      │
 └──────────────────────┘              │  1. Heuristic Scan   │
                                       │  2. Risk & Outcomes  │
                                       │  3. Quote Grounding  │
                                       │  4. Self-Healing     │
                                       │                      │
                                       │  Commit Gate Receipt │
                                       └──────────────────────┘
```

- **New & Modified Components**:
  - `src/components/AgentComposer.tsx`: Interactive agent email client with typewriter animation, scenario selector, speed controls, and send trigger.
  - `src/components/SandboxModal.tsx`: High-tech intercepted payload modal with live consequence auditing, self-healing diff view, and commit gate actions.
  - `src/components/InteractiveConsequenceLab.tsx`: Updated container coordinating the composer, unshielded vs shielded states, and modal lifecycle.
  - `src/hooks/useTypewriter.ts`: Resilient typing animation hook with character delay and skip support.
