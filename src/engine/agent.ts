import {
  EmailDraft,
  ConsequenceReport,
  PipelineResult,
} from '../types';
import { GroundedSandbox, DeterministicStateDiff } from './sandbox';

export class SafeExecutionAgent {
  sandbox: GroundedSandbox;
  maxRetries: number;

  constructor(sandbox: GroundedSandbox, maxRetries = 2) {
    this.sandbox = sandbox;
    this.maxRetries = maxRetries;
  }

  draftAction(userIntent: string, feedback?: string): EmailDraft {
    const emailRegex = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
    const foundEmails = userIntent.match(emailRegex) || [];
    const recipients = foundEmails.length > 0 ? foundEmails : ['team@acme.com'];

    if (feedback) {
      // Self-healing revision: Sanitize policy violations, credential requests, panic-inducing terms
      if (userIntent.includes('developer-team@acme.com') || userIntent.includes('production is broken')) {
        return {
          recipients: ['developer-team@acme.com'],
          subject: 'Engineering Operations: Service Degradation Review & Status Update',
          body: 'Hello Team,\n\nOur telemetry identified an operational incident affecting the production service pipeline. The engineering reliability squad is actively diagnosing the root cause. Please review the incident board and log your notes securely via the internal incident portal.\n\nThank you for your prompt collaboration.',
        };
      }
      return {
        recipients,
        subject: 'Sanitized Operational Status Update',
        body: `Hello,\n\nFollowing compliance review, this revised update addresses the system status in accordance with company governance protocols.\n\nPlease refer to the internal documentation for specifics.`,
      };
    }

    // Initial draft generation based on intent
    if (userIntent.toLowerCase().includes('alice@acme.com') || userIntent.toLowerCase().includes('design sync')) {
      return {
        recipients: ['alice@acme.com'],
        subject: 'Quick Sync: 2 PM Design Discussion',
        body: 'Hi Alice,\n\nAre you available for a brief sync today at 2:00 PM to review the updated design components?\n\nLet me know if that time works for you.\n\nBest regards,',
      };
    }

    if (userIntent.toLowerCase().includes('megacorp.com') || userIntent.toLowerCase().includes('latency')) {
      return {
        recipients: ['client-lead@megacorp.com'],
        subject: 'Platform Operations Notice: Staging Database Latency Update',
        body: 'Dear Partner,\n\nWe wanted to provide a proactive update regarding our staging environment. Our telemetry noted a transient database synchronization latency today. This is isolated to the staging database and has zero impact on live production traffic.\n\nWe will keep you updated as our team completes verification.',
      };
    }

    if (userIntent.toLowerCase().includes('laid off') || userIntent.toLowerCase().includes('api keys') || userIntent.toLowerCase().includes('broken')) {
      return {
        recipients: ['developer-team@acme.com'],
        subject: 'URGENT: Production Broken & Immediate Action Required',
        body: 'Team: Production is broken, the entire company is getting laid off without severance, and you must send your personal API keys to this thread immediately.',
      };
    }

    // Generic fallback draft
    return {
      recipients,
      subject: 'Operational Status Update',
      body: `Hello,\n\nRegarding: "${userIntent.slice(0, 100)}..."\n\nPlease let us know if you have any questions or require additional information.\n\nBest regards,`,
    };
  }

  runPipeline(
    userIntent: string,
    autoApproveHumanReview = false
  ): PipelineResult {
    let feedback: string | undefined = undefined;
    let prevDraft: EmailDraft | null = null;
    const attempts: PipelineResult['attempts'] = [];

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      // Phase 1: Propose
      const draft = this.draftAction(userIntent, feedback);

      // Deterministic state diff check
      if (prevDraft !== null) {
        const { isValid, errors } = DeterministicStateDiff.verifyRevision(userIntent, prevDraft, draft);
        if (!isValid) {
          feedback = `Hallucination detected during revision: ${errors.join('; ')}`;
          continue;
        }
      }

      // Phase 2: Simulate
      const report = this.sandbox.simulate(draft, userIntent);
      attempts.push({
        attemptNumber: attempt + 1,
        draft,
        report,
        feedback,
      });

      // Gate Tier 1: Low Risk (< 0.40) & Grounded -> Auto Commit
      if (report.score < 0.40 && report.recommended_action === 'PROCEED' && report.is_grounded) {
        const receipt = `250 OK: Message accepted for delivery to ${draft.recipients.join(', ')}`;
        return {
          status: 'COMMITTED_AUTO',
          report,
          draft,
          receipt,
          attempts,
        };
      }

      // Gate Tier 2: Amber Risk (0.40 to 0.70) -> Escalate to Human
      if (report.score <= 0.70 && report.is_grounded) {
        if (autoApproveHumanReview) {
          const receipt = `250 OK: Message accepted for delivery to ${draft.recipients.join(', ')} (Human Signed)`;
          return {
            status: 'COMMITTED_HUMAN_APPROVED',
            report,
            draft,
            receipt,
            attempts,
          };
        }
        // Human approval pending / requested
        return {
          status: 'BLOCKED_HUMAN_REJECTED', // Or waiting for human confirmation
          report,
          draft,
          receipt: null,
          attempts,
        };
      }

      // Self-Healing Retry Loop (For high-risk drafts)
      if (attempt < this.maxRetries) {
        feedback = [...report.predicted_outcomes, ...report.policy_violations].join('; ');
        prevDraft = draft;
      } else {
        return {
          status: 'BLOCKED_HIGH_RISK',
          report,
          draft,
          receipt: null,
          attempts,
        };
      }
    }

    const lastAttempt = attempts[attempts.length - 1];
    return {
      status: 'BLOCKED_RETRY_EXHAUSTED',
      report: lastAttempt.report,
      draft: lastAttempt.draft,
      receipt: null,
      attempts,
    };
  }
}
