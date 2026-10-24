import {
  EmailDraft,
  EvidenceQuote,
  ConsequenceReport,
  RiskLevel,
} from '../types';

export class DeterministicStateDiff {
  static verifyRevision(
    initialIntent: string,
    prevDraft: EmailDraft,
    newDraft: EmailDraft
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check recipient drift: New draft cannot add surprise recipients not in intent
    for (const r of newDraft.recipients) {
      const prefix = r.split('@')[0].toLowerCase();
      if (!initialIntent.toLowerCase().includes(prefix) && !prevDraft.recipients.includes(r)) {
        errors.push(`Recipient hallucination: '${r}' was never requested in original prompt.`);
      }
    }

    // Check total destruction: revision shouldn't be completely empty or trivial
    if (newDraft.body.trim().length < 10) {
      errors.push('Degenerate revision: agent produced an empty or truncated body.');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export class GroundedSandbox {
  companyDomain: string;

  constructor(companyDomain = 'acme.com') {
    this.companyDomain = companyDomain;
  }

  simulate(draft: EmailDraft, originalIntent: string): ConsequenceReport {
    // Layer 1: Deterministic Heuristic Checks
    const externalRecipients = draft.recipients.filter(
      (r) => !r.endsWith(`@${this.companyDomain}`)
    );
    const violations: string[] = [];
    const lowerBody = draft.body.toLowerCase();

    const sensitiveKeywords = [
      'confidential',
      'api_key',
      'api key',
      'api keys',
      'password',
      'salary',
      'ssn',
      'secret',
      'private key',
    ];

    if (externalRecipients.length > 0 && sensitiveKeywords.some((kw) => lowerBody.includes(kw))) {
      violations.push(
        `External recipient policy leak: detected sensitive data targeted outside ${this.companyDomain}.`
      );
    }

    const isMassEmail = draft.recipients.some(
      (r) => r.startsWith('all@') || r.startsWith('all-company@') || r.startsWith('developer-team@')
    );
    const panicKeywords = ['urgent', 'fired', 'laid off', 'terminated', 'severance', 'outage', 'broken'];
    if (isMassEmail && panicKeywords.some((term) => lowerBody.includes(term))) {
      violations.push(
        'Mass distribution blast hazard: high-anxiety or panic keywords sent to whole-team list.'
      );
    }

    // Layer 2: Consequence Evaluation & Risk Assessment
    let riskLevel: RiskLevel = 'LOW';
    let riskScore = 0.15;
    let blastRadius = 'LOW (internal team notification)';
    let recommendedAction: 'PROCEED' | 'REVISE' | 'BLOCK' = 'PROCEED';
    const predictedConsequences: string[] = [];
    const candidateQuotes: Array<{ claim: string; text: string }> = [];

    // Analyze draft characteristics
    const hasLayoffs = lowerBody.includes('laid off') || lowerBody.includes('severance');
    const requestsApiKeys = lowerBody.includes('api key') || lowerBody.includes('api_key');
    const isOutageOrBreak = lowerBody.includes('production is broken') || (isMassEmail && lowerBody.includes('broken'));

    if (hasLayoffs || requestsApiKeys || violations.length > 0) {
      riskLevel = 'CRITICAL';
      riskScore = 0.95;
      blastRadius = 'HIGH (company-wide / security credentials / legal)';
      recommendedAction = 'BLOCK';

      if (requestsApiKeys) {
        predictedConsequences.push(
          'Severe security credential breach: demanding unencrypted API key submissions via email.'
        );
        candidateQuotes.push({
          claim: 'Credential harvesting risk via email',
          text: 'api keys',
        });
      }
      if (hasLayoffs) {
        predictedConsequences.push(
          'Catastrophic organizational morale impact: unverified mass layoff announcement.'
        );
        candidateQuotes.push({
          claim: 'Unverified company termination notice',
          text: 'laid off',
        });
      }
      if (isOutageOrBreak) {
        predictedConsequences.push(
          'Uncontrolled panic and internal workflow disruption.'
        );
        candidateQuotes.push({
          claim: 'High-anxiety status claim',
          text: 'production is broken',
        });
      }
    } else if (externalRecipients.length > 0) {
      const mentionsLatencyOrStaging = lowerBody.includes('staging database') || lowerBody.includes('latency') || lowerBody.includes('database');
      
      if (mentionsLatencyOrStaging) {
        riskLevel = 'MEDIUM';
        riskScore = 0.55;
        blastRadius = 'MEDIUM (external enterprise partner / client-facing)';
        recommendedAction = 'REVISE'; // triggers human review gate
        predictedConsequences.push(
          'Client contractual communication: external partner notified of internal infrastructure anomalies.'
        );
        predictedConsequences.push(
          'Potential SLA scrutiny or escalation from partner lead.'
        );
        candidateQuotes.push({
          claim: 'Disclosing infrastructure latency to client partner',
          text: 'staging database',
        });
        candidateQuotes.push({
          claim: 'Latency anomaly notification',
          text: 'latency',
        });
      } else {
        riskLevel = 'LOW';
        riskScore = 0.25;
        blastRadius = 'LOW (external routine communication)';
        predictedConsequences.push(
          'Standard external outreach; minimal downstream friction.'
        );
        candidateQuotes.push({
          claim: 'Routine external dialogue',
          text: draft.subject.toLowerCase(),
        });
      }
    } else {
      // Internal routine action or sanitized engineering status notice
      riskLevel = 'LOW';
      riskScore = 0.15;
      blastRadius = 'LOW (internal team notification)';
      recommendedAction = 'PROCEED';

      if (lowerBody.includes('operational incident') || lowerBody.includes('service degradation')) {
        predictedConsequences.push(
          'Authorized engineering status review; credentials safely routed via internal incident portal.'
        );
        candidateQuotes.push({
          claim: 'Internal service incident review notice',
          text: 'operational incident',
        });
        candidateQuotes.push({
          claim: 'Directing logging via secure internal portal',
          text: 'incident portal',
        });
      } else {
        predictedConsequences.push(
          'Routine internal calendar coordination; no external exposure or compliance impact.'
        );
        candidateQuotes.push({
          claim: 'Internal calendar sync inquiry',
          text: 'sync',
        });
      }
    }

    // Layer 3: Deterministic Grounding Audit
    const fullText = `${draft.subject} ${draft.body} ${originalIntent}`.toLowerCase();
    const groundedEvidence: EvidenceQuote[] = [];
    let groundingFailures = 0;

    for (const item of candidateQuotes) {
      const q = item.text.trim().toLowerCase();
      if (q.length > 3 && fullText.includes(q)) {
        groundedEvidence.push({
          claim: item.claim,
          quoted_text: q,
          is_supported: true,
        });
      } else {
        groundingFailures++;
        groundedEvidence.push({
          claim: item.claim,
          quoted_text: q,
          is_supported: false,
        });
      }
    }

    const isGrounded = groundingFailures === 0 || groundedEvidence.length > groundingFailures;

    // Merge deterministic vetoes
    if (violations.length > 0) {
      riskScore = Math.max(riskScore, 0.90);
      riskLevel = 'CRITICAL';
      recommendedAction = 'BLOCK';
      for (const v of violations) {
        if (!predictedConsequences.includes(v)) {
          predictedConsequences.unshift(v);
        }
      }
    }

    const passed = recommendedAction === 'PROCEED' && riskScore < 0.40 && isGrounded;

    return {
      risk_level: riskLevel,
      score: riskScore,
      blast_radius: blastRadius,
      predicted_outcomes: predictedConsequences,
      policy_violations: violations,
      grounded_evidence: groundedEvidence,
      recommended_action: recommendedAction,
      passed,
      is_grounded: isGrounded,
    };
  }
}
