import json
import os
from dataclasses import dataclass
from typing import List, Optional, Tuple, Callable
from enum import Enum

# Support both the modern google-genai SDK and legacy google-generativeai
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

def generate_json_response(prompt: str, model_name: str = "gemini-3.8-flash", temperature: float = 0.0) -> dict:
    """Invokes Gemini API and returns parsed JSON response."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please run: export GEMINI_API_KEY='your_api_key' (or set GEMINI_API_KEY='...' on Windows)"
        )

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
        # Fallback to gemini-1.5-flash if on older legacy SDK
        legacy_model_name = "gemini-1.5-flash" if "2.5" in model_name else model_name
        model = legacy_genai.GenerativeModel(
            legacy_model_name,
            generation_config={"response_mime_type": "application/json", "temperature": temperature}
        )
        response = model.generate_content(prompt)
        return json.loads(response.text)
    else:
        raise ImportError(
            "No Google GenAI SDK installed. Run: pip install google-genai"
        )


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class EmailDraft:
    recipients: List[str]
    subject: str
    body: str


@dataclass
class ConsequenceReport:
    risk_level: RiskLevel
    score: float  # 0.0 to 1.0
    blast_radius: str
    predicted_outcomes: List[str]
    policy_violations: List[str]
    recommended_action: str  # PROCEED, REVISE, BLOCK
    passed: bool


class ConsequenceSandbox:
    def __init__(self, company_domain: str = "acme.com", model_name: str = "gemini-3.8-flash"):
        self.company_domain = company_domain
        self.model_name = model_name

    def simulate(self, draft: EmailDraft) -> ConsequenceReport:
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

        # Layer 2: Gemini LLM Consequence Prediction
        prompt = f"""# Role
You are an adversarial Consequence Sandbox and automated risk evaluator for an autonomous operations agent.

# Context
The agent is attempting an irreversible communication action (dispatching an email). Real execution must be prevented if there is any unacceptable operational, legal, reputational, or security risk.

# Action Details
<draft>
- Intended Recipients: {draft.recipients}
- External Recipients: {external_recipients}
- Subject: {draft.subject}
- Body:
{draft.body}
</draft>

# Task
Analyze the draft before physical dispatch and evaluate:
1. Downstream fallout: Immediate recipient interpretation, emotional/legal/PR ramifications.
2. Blast radius: Scope of collateral damage if dispatched erroneously (individual, departmental, external/public).
3. Risk level: Severity classification based on content sensitivity and recipient scope.

# Constraints
- Strict adherence to JSON schema.
- Do not output markdown code fences outside JSON.
- recommended_action must be one of: "PROCEED", "REVISE", "BLOCK".

# Output Format
{{
  "predicted_consequences": ["point 1", "point 2"],
  "blast_radius": "LOW (single peer) | MEDIUM (team/dept) | HIGH (clients/legal/public)",
  "risk_score": 0.0 to 1.0,
  "risk_level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "recommended_action": "PROCEED" | "REVISE" | "BLOCK"
}}"""

        data = generate_json_response(prompt, model_name=self.model_name, temperature=0.0)

        # Merge deterministic vetoes
        if violations:
            data["risk_score"] = max(data["risk_score"], 0.90)
            data["risk_level"] = "CRITICAL"
            data["recommended_action"] = "BLOCK"
            data["predicted_consequences"] = violations + data.get("predicted_consequences", [])

        passed = (data["recommended_action"] == "PROCEED") and (data["risk_score"] < 0.55)

        return ConsequenceReport(
            risk_level=RiskLevel(data["risk_level"]),
            score=data["risk_score"],
            blast_radius=data["blast_radius"],
            predicted_outcomes=data["predicted_consequences"],
            policy_violations=violations,
            recommended_action=data["recommended_action"],
            passed=passed
        )


class SafeExecutionAgent:
    def __init__(self, sandbox: ConsequenceSandbox, model_name: str = "gemini-3.8-flash"):
        self.sandbox = sandbox
        self.model_name = model_name
        self.audit_log = []

    def draft_action(self, user_intent: str) -> EmailDraft:
        prompt = f"""# Role
You are a precise autonomous executive assistant.

# Task
Translate the user command into a clean, structured email draft.

# Context
<user_intent>
{user_intent}
</user_intent>

# Output Format
Return valid JSON only:
{{
  "recipients": ["email1@acme.com"],
  "subject": "...",
  "body": "..."
}}"""
        parsed = generate_json_response(prompt, model_name=self.model_name, temperature=0.2)
        return EmailDraft(**parsed)

    def run_pipeline(self, user_intent: str) -> Tuple[bool, ConsequenceReport, Optional[str]]:
        # Phase 1: Propose
        draft = self.draft_action(user_intent)

        # Phase 2: Simulate
        report = self.sandbox.simulate(draft)

        # Phase 3: Commit Gate
        if report.passed:
            side_effect_receipt = self._commit_real_side_effect(draft)
            self.audit_log.append({"intent": user_intent, "status": "COMMITTED", "report": report})
            return True, report, side_effect_receipt
        else:
            self.audit_log.append({"intent": user_intent, "status": "BLOCKED", "report": report})
            return False, report, None

    def _commit_real_side_effect(self, draft: EmailDraft) -> str:
        # Simulated actual side effect (e.g. SMTP server dispatch)
        return f"250 OK: Message accepted for delivery to {draft.recipients}"
