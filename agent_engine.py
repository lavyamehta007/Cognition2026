import json
import os
import re
import time
import random
import warnings
import logging
from dataclasses import dataclass, field
from typing import List, Optional, Tuple, Dict, Any, Callable
from enum import Enum

# Suppress the automatic function calling (AFC) SDK warning
warnings.filterwarnings("ignore")
logging.getLogger("google.genai").setLevel(logging.ERROR)
logging.getLogger("google").setLevel(logging.ERROR)

try:
    from google import genai
    from google.genai import types
    SDK_TYPE = "genai"
except ImportError:
    try:
        import google.generativeai as legacy_genai
        SDK_TYPE = "legacy"
    except ImportError:
        SDK_TYPE = None

DEFAULT_MODEL = "gemini-3.8-flash"

def generate_json_response(prompt: str, model_name: str = DEFAULT_MODEL, temperature: float = 0.0, max_retries: int = 5) -> dict:
    """Invokes Gemini API with exponential backoff retry on 503/429 errors."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    for attempt in range(max_retries):
        try:
            if SDK_TYPE == "genai":
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=temperature,
                    ),
                )
                return json.loads(response.text)
            elif SDK_TYPE == "legacy":
                legacy_genai.configure(api_key=api_key)
                model = legacy_genai.GenerativeModel(
                    model_name,
                    generation_config={"response_mime_type": "application/json", "temperature": temperature}
                )
                response = model.generate_content(prompt)
                return json.loads(response.text)
            else:
                raise ImportError("No Google GenAI SDK installed. Run: pip install google-genai")
        except Exception as e:
            err_msg = str(e).lower()
            # If server is busy (503), rate-limited (429), or unavailable, back off and retry
            if ("503" in err_msg or "unavailable" in err_msg or "429" in err_msg or "resource_exhausted" in err_msg) and attempt < max_retries - 1:
                sleep_time = (2 ** attempt) + random.uniform(1.0, 2.5)
                print(f"\n  [Server Busy 503] Retrying in {sleep_time:.1f}s (Attempt {attempt + 1}/{max_retries})...")
                time.sleep(sleep_time)
            else:
                raise e


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ExecutionStatus(str, Enum):
    COMMITTED_AUTO = "COMMITTED_AUTO"
    COMMITTED_HUMAN_APPROVED = "COMMITTED_HUMAN_APPROVED"
    BLOCKED_HUMAN_REJECTED = "BLOCKED_HUMAN_REJECTED"
    BLOCKED_HIGH_RISK = "BLOCKED_HIGH_RISK"
    BLOCKED_RETRY_EXHAUSTED = "BLOCKED_RETRY_EXHAUSTED"
    HALLUCINATION_DETECTED = "HALLUCINATION_DETECTED"


@dataclass
class EmailDraft:
    recipients: List[str]
    subject: str
    body: str


@dataclass
class EvidenceQuote:
    claim: str
    quoted_text: str
    is_supported: bool


@dataclass
class ConsequenceReport:
    risk_level: RiskLevel
    score: float
    blast_radius: str
    predicted_outcomes: List[str]
    policy_violations: List[str]
    grounded_evidence: List[EvidenceQuote]
    recommended_action: str
    passed: bool
    is_grounded: bool = True


class GroundedSandbox:
    def __init__(self, company_domain: str = "acme.com", model_name: str = DEFAULT_MODEL):
        self.company_domain = company_domain
        self.model_name = model_name

    def simulate(self, draft: EmailDraft, original_intent: str) -> ConsequenceReport:
        # Layer 1: Deterministic Heuristic Checks
        external_recipients = [
            r for r in draft.recipients if not r.endswith(f"@{self.company_domain}")
        ]
        violations = []
        lower_body = draft.body.lower()

        sensitive_keywords = ["confidential", "api_key", "password", "salary", "ssn", "secret", "private key"]
        if external_recipients and any(kw in lower_body for kw in sensitive_keywords):
            violations.append(f"External recipient policy leak: detected sensitive data targeted outside {self.company_domain}.")

        if any(r.startswith("all@") or r.startswith("all-company@") for r in draft.recipients):
            if any(term in lower_body for term in ["urgent", "fired", "terminated", "severance", "outage"]):
                violations.append("Mass distribution blast hazard: high-anxiety keywords sent to whole-company list.")

        # Layer 2: LLM Adversarial Consequence Evaluation with Strict Grounded Citation
        prompt = f"""# Role
You are an adversarial Consequence Sandbox and verification auditor for an autonomous agent.

# Context
The user issued a prompt. The agent drafted an email. You must evaluate risk and verify that claims are supported by verbatim text.

# Ground Truth Inputs
<user_intent>
{original_intent}
</user_intent>

<draft>
- Intended Recipients: {draft.recipients}
- External Recipients: {external_recipients}
- Subject: {draft.subject}
- Body:
\"\"\"{draft.body}\"\"\"
</draft>

# Task
1. Predict genuine downstream operational, legal, and reputational consequences.
2. For EVERY claim or risk identified, provide the exact verbatim substring from <draft> or <user_intent>.
3. If an identified claim cannot be cited verbatim, discard it.
4. Categorize blast radius and assess risk score (0.0 to 1.0).

# Constraints
- Strict JSON output only.
- recommended_action must be one of: "PROCEED", "REVISE", "BLOCK".

# Output Format
{{
  "claims_validation": [
    {{"claim": "Reason why risky", "quoted_text": "exact words from draft or intent"}}
  ],
  "predicted_consequences": ["point 1", "point 2"],
  "blast_radius": "LOW (single peer) | MEDIUM (team/dept) | HIGH (clients/legal/public)",
  "risk_score": 0.0,
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "recommended_action": "PROCEED" | "REVISE" | "BLOCK"
}}"""

        data = generate_json_response(prompt, model_name=self.model_name, temperature=0.0)

        # Layer 3: Deterministic Grounding Audit
        grounded_evidence = []
        full_text = f"{draft.subject} {draft.body} {original_intent}".lower()

        claims_raw = data.get("claims_validation", [])
        grounding_failures = 0
        for item in claims_raw:
            q = item.get("quoted_text", "").strip().lower()
            # Must be a non-trivial verbatim substring
            if len(q) > 4 and q in full_text:
                grounded_evidence.append(EvidenceQuote(claim=item.get("claim", ""), quoted_text=q, is_supported=True))
            else:
                grounding_failures += 1
                grounded_evidence.append(EvidenceQuote(claim=item.get("claim", ""), quoted_text=q, is_supported=False))

        # Hallucination Guard: If the checker invented citations, penalize its confidence
        is_grounded = grounding_failures == 0 or len(grounded_evidence) > grounding_failures

        # Merge deterministic vetoes
        if violations:
            data["risk_score"] = max(data["risk_score"], 0.90)
            data["risk_level"] = "CRITICAL"
            data["recommended_action"] = "BLOCK"
            data["predicted_consequences"] = violations + data.get("predicted_consequences", [])

        passed = (data["recommended_action"] == "PROCEED") and (data["risk_score"] < 0.40) and is_grounded

        return ConsequenceReport(
            risk_level=RiskLevel(data["risk_level"]),
            score=data["risk_score"],
            blast_radius=data["blast_radius"],
            predicted_outcomes=data["predicted_consequences"],
            policy_violations=violations,
            grounded_evidence=grounded_evidence,
            recommended_action=data["recommended_action"],
            passed=passed,
            is_grounded=is_grounded
        )


class DeterministicStateDiff:
    """Verifies that the agent does not hallucinate new recipients or unauthorized attachments."""
    @staticmethod
    def verify_revision(initial_intent: str, prev_draft: EmailDraft, new_draft: EmailDraft) -> Tuple[bool, List[str]]:
        errors = []
        
        # Check recipient drift: New draft cannot add surprise recipients not in intent
        for r in new_draft.recipients:
            prefix = r.split("@")[0].lower()
            if prefix not in initial_intent.lower() and r not in prev_draft.recipients:
                errors.append(f"Recipient hallucination: '{r}' was never requested in original prompt.")

        # Check total destruction: revision shouldn't be completely empty or trivial
        if len(new_draft.body.strip()) < 10:
            errors.append("Degenerate revision: agent produced an empty or truncated body.")

        return (len(errors) == 0, errors)


class SafeExecutionAgent:
    def __init__(
        self,
        sandbox: GroundedSandbox,
        model_name: str = DEFAULT_MODEL,
        max_retries: int = 2,
        human_approval_callback: Optional[Callable[[EmailDraft, ConsequenceReport], bool]] = None
    ):
        self.sandbox = sandbox
        self.model_name = model_name
        self.max_retries = max_retries
        self.human_approval_callback = human_approval_callback or self._default_cli_human_approval
        self.audit_log = []

    def draft_action(self, user_intent: str, feedback: Optional[str] = None) -> EmailDraft:
        feedback_prompt = f"\nFEEDBACK FROM AUDITOR (PREVIOUS DRAFT REJECTED):\n{feedback}\nFix the violations above." if feedback else ""
        prompt = f"""# Role
You are a precise autonomous executive assistant.

# Task
Draft an email based strictly on the user command and any auditor feedback provided.

# Context
<user_intent>
{user_intent}
</user_intent>
{feedback_prompt}

# Output Format
Return valid JSON only:
{{
  "recipients": ["user@acme.com"],
  "subject": "...",
  "body": "..."
}}"""
        parsed = generate_json_response(prompt, model_name=self.model_name, temperature=0.2)
        return EmailDraft(**parsed)

    def run_pipeline(self, user_intent: str) -> Tuple[ExecutionStatus, ConsequenceReport, Optional[str]]:
        feedback = None
        prev_draft = None

        for attempt in range(self.max_retries + 1):
            # Phase 1: Propose
            draft = self.draft_action(user_intent, feedback=feedback)

            # Hallucination Check 1: Deterministic state diff against previous draft & original prompt
            if prev_draft is not None:
                is_valid_diff, diff_errors = DeterministicStateDiff.verify_revision(user_intent, prev_draft, draft)
                if not is_valid_diff:
                    print(f"  [State Diff] Revision rejected for ungrounded mutations: {diff_errors}")
                    feedback = f"Hallucination detected during revision: {'; '.join(diff_errors)}"
                    continue

            # Phase 2: Simulate
            report = self.sandbox.simulate(draft, original_intent=user_intent)

            # Gate Tier 1: Low Risk (< 0.40) & Grounded -> Auto Commit
            if report.score < 0.40 and report.recommended_action == "PROCEED" and report.is_grounded:
                receipt = self._commit_real_side_effect(draft)
                self.audit_log.append({"attempt": attempt, "intent": user_intent, "status": ExecutionStatus.COMMITTED_AUTO, "report": report})
                return ExecutionStatus.COMMITTED_AUTO, report, receipt

            # Gate Tier 2: Amber Risk (0.40 to 0.70) -> Escalate to Human
            elif report.score <= 0.70 and report.is_grounded:
                human_approved = self.human_approval_callback(draft, report)
                if human_approved:
                    receipt = self._commit_real_side_effect(draft)
                    self.audit_log.append({"attempt": attempt, "intent": user_intent, "status": ExecutionStatus.COMMITTED_HUMAN_APPROVED, "report": report})
                    return ExecutionStatus.COMMITTED_HUMAN_APPROVED, report, receipt
                else:
                    self.audit_log.append({"attempt": attempt, "intent": user_intent, "status": ExecutionStatus.BLOCKED_HUMAN_REJECTED, "report": report})
                    return ExecutionStatus.BLOCKED_HUMAN_REJECTED, report, None

            # Self-Healing Retry Loop (For high-risk drafts)
            if attempt < self.max_retries:
                feedback = "; ".join(report.predicted_outcomes + report.policy_violations)
                prev_draft = draft
                print(f"  [Self-Healing Loop] Attempt {attempt + 1} blocked. Retrying with sandbox feedback...")
            else:
                self.audit_log.append({"attempt": attempt, "intent": user_intent, "status": ExecutionStatus.BLOCKED_HIGH_RISK, "report": report})
                return ExecutionStatus.BLOCKED_HIGH_RISK, report, None

        return ExecutionStatus.BLOCKED_RETRY_EXHAUSTED, report, None

    def _default_cli_human_approval(self, draft: EmailDraft, report: ConsequenceReport) -> bool:
        print("\n" + "=" * 60)
        print("🧑‍💼 HUMAN-IN-THE-LOOP APPROVAL REQUIRED")
        print("=" * 60)
        print(f"Risk Score:    {report.score:.2f} ({report.risk_level.value})")
        print(f"Blast Radius:  {report.blast_radius}")
        print(f"Recipients:    {draft.recipients}")
        print(f"Subject:       {draft.subject}")
        print("Grounded Proofs / Citations:")
        for ev in report.grounded_evidence:
            mark = "✓" if ev.is_supported else "✗"
            print(f"  [{mark}] Quote: '{ev.quoted_text}' -> {ev.claim}")
        print("-" * 60)
        decision = input("Do you authorize this email? [y/N]: ").strip().lower()
        return decision in ["y", "yes"]

    def _commit_real_side_effect(self, draft: EmailDraft) -> str:
        return f"250 OK: Message accepted for delivery to {draft.recipients}"