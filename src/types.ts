export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ExecutionStatus =
  | 'COMMITTED_AUTO'
  | 'COMMITTED_HUMAN_APPROVED'
  | 'BLOCKED_HUMAN_REJECTED'
  | 'BLOCKED_HIGH_RISK'
  | 'BLOCKED_RETRY_EXHAUSTED'
  | 'HALLUCINATION_DETECTED';

export interface EmailDraft {
  recipients: string[];
  subject: string;
  body: string;
}

export interface EvidenceQuote {
  claim: string;
  quoted_text: string;
  is_supported: boolean;
}

export interface ConsequenceReport {
  risk_level: RiskLevel;
  score: number;
  blast_radius: string;
  predicted_outcomes: string[];
  policy_violations: string[];
  grounded_evidence: EvidenceQuote[];
  recommended_action: 'PROCEED' | 'REVISE' | 'BLOCK';
  passed: boolean;
  is_grounded: boolean;
}

export interface AuditLogEntry {
  attempt: number;
  intent: string;
  status: ExecutionStatus;
  draft: EmailDraft;
  report: ConsequenceReport;
  receipt?: string | null;
  timestamp: string;
}

export interface PipelineResult {
  status: ExecutionStatus;
  report: ConsequenceReport;
  draft: EmailDraft;
  receipt: string | null;
  attempts: Array<{
    attemptNumber: number;
    draft: EmailDraft;
    report: ConsequenceReport;
    feedback?: string;
  }>;
}

export interface TestCase {
  id: string;
  name: string;
  intent: string;
  expected_flow: string;
}
