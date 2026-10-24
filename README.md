# Cognition2026 — Consequence Prediction AI

A two-phase commit architecture with an adversarial consequence sandbox and safety gates for autonomous AI agents, rewritten as a modern React application.

## Overview

Cognition inserts an adversarial consequence prediction and verification layer between an agent's proposal and real-world execution.

### Two-Phase Architecture
1. **Propose (Draft Action)**: Generates the intended action draft without triggering any real side effects.
2. **Simulate (Consequence Sandbox)**:
   - **Layer 1: Deterministic Heuristic Checks**: Detects credential leaks, sensitive keyword leaks to external domains, and mass-distribution blast hazards.
   - **Layer 2: Adversarial Consequence Evaluation**: Evaluates blast radius, operational fallout, and risk score (0.0 to 1.0).
   - **Layer 3: Deterministic Grounding Audit**: Requires verbatim quotation citations from the source text to prevent hallucinated warnings.
3. **Commit Gate**:
   - **Tier 1 (< 0.40 Risk, Grounded)**: Auto-commits the action and generates execution receipt.
   - **Tier 2 (0.40 - 0.70 Risk)**: Escalates to Human-in-the-Loop review for operator authorization.
   - **Tier 3 (>= 0.70 Risk / Violations)**: Triggers an automated self-healing feedback loop to sanitize hazards, or blocks execution if risks cannot be mitigated.

## Key Features
- **Interactive Consequence Lab**: Run the 3-stage evaluation suite benchmark or test custom agent intents directly in the browser.
- **Evaluation Suite**:
  - Scenario 1: Autonomous Low-Risk (Direct Commit)
  - Scenario 2: Amber-Risk Ambiguity (Human-in-the-Loop Operator Gate)
  - Scenario 3: High-Risk Roadblock (Self-Healing Revision Loop)
- **Luminous Orbital Visualization**: Real-time CSS canvas with pointer-parallax tracking.
- **Full Architecture Explorer**: Interactive breakdown of sandbox layers and gating rules.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
