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

  private findVerbatimMatch(text: string, patterns: string[]): string | null {
    const lower = text.toLowerCase();
    for (const pattern of patterns) {
      const idx = lower.indexOf(pattern.toLowerCase());
      if (idx !== -1) {
        return text.slice(idx, idx + pattern.length);
      }
    }
    return null;
  }

  simulate(draft: EmailDraft, originalIntent: string): ConsequenceReport {
    // Layer 1: Deterministic Heuristic Checks
    const externalRecipients = draft.recipients.filter(
      (r) => !r.toLowerCase().endsWith(`@${this.companyDomain}`)
    );
    const violations: string[] = [];
    const combinedSource = `${draft.subject} ${draft.body}`;
    const lowerBody = combinedSource.toLowerCase();

    const credentialPatterns = [
      'send your personal api keys',
      'submit their api keys',
      'aws secret key',
      'secret key',
      'private key',
      'api keys',
      'api key',
      'api_key',
      'passwords immediately',
      'root password',
      'passwords',
      'password',
      'access token',
      'bearer token',
      'ssh key',
      'credentials',
      'seed phrase',
    ];

    const dlpPatterns = [
      'social security',
      'ssn',
      'credit card',
      'salary spreadsheet',
      'salaries',
      'salary',
      'payroll',
      'wire transfer',
      'bank account',
      'confidential',
      'proprietary',
      'customer pii',
      'nda',
    ];

    const panicPatterns = [
      'laid off without severance',
      'getting laid off',
      'laid off',
      'layoffs',
      'layoff',
      'without severance',
      'severance',
      'everyone is fired',
      'fired',
      'terminated',
      'bankrupt',
      'insolvent',
      'lawsuit',
    ];

    const blastPatterns = [
      'production database tables were dropped',
      'database tables were dropped',
      'dropped database',
      'drop table',
      'production is broken',
      'deleted production',
      'ransomware',
      'data breach',
      'security breach',
      'servers are down',
      'compromised',
      'hacked',
      'outage',
      'broken',
    ];

    const matchedCred = this.findVerbatimMatch(combinedSource, credentialPatterns);
    const matchedDlp = this.findVerbatimMatch(combinedSource, dlpPatterns);
    const matchedPanic = this.findVerbatimMatch(combinedSource, panicPatterns);
    const matchedBlast = this.findVerbatimMatch(combinedSource, blastPatterns);

    if (externalRecipients.length > 0 && (matchedCred || matchedDlp)) {
      violations.push(
        `External recipient policy leak: detected sensitive data targeted outside ${this.companyDomain} (${externalRecipients.join(', ')}).`
      );
    }

    const isMassEmail = draft.recipients.some(
      (r) =>
        r.startsWith('all@') ||
        r.startsWith('all-company@') ||
        r.startsWith('developer-team@') ||
        r.startsWith('engineering@') ||
        r.startsWith('company@')
    );

    if (isMassEmail && (matchedPanic || matchedBlast || lowerBody.includes('urgent'))) {
      violations.push(
        'Mass distribution blast hazard: high-anxiety or destructive operational claims sent to group distribution list.'
      );
    }

    if (matchedCred) {
      violations.push(
        `Credential exfiltration hazard: unencrypted secret or authentication token ("${matchedCred.toLowerCase()}") detected in outbound payload.`
      );
    }

    if (matchedDlp) {
      violations.push(
        `DLP governance violation: restricted financial, PII, or confidential material ("${matchedDlp.toLowerCase()}") flagged in message buffer.`
      );
    }

    // Layer 2: Consequence Evaluation & Risk Assessment
    let riskLevel: RiskLevel = 'LOW';
    let riskScore = 0.15;
    let blastRadius = 'LOW (internal team notification)';
    let recommendedAction: 'PROCEED' | 'REVISE' | 'BLOCK' = 'PROCEED';
    const predictedConsequences: string[] = [];
    const candidateQuotes: Array<{ claim: string; text: string }> = [];

    if (matchedPanic || matchedCred || matchedDlp || matchedBlast || violations.length > 0) {
      riskLevel = 'CRITICAL';
      riskScore = 0.95;
      blastRadius = 'HIGH (company-wide / security credentials / compliance)';
      recommendedAction = 'BLOCK';

      if (matchedPanic) {
        predictedConsequences.push(
          'Catastrophic organizational morale impact: unverified termination or panic-inducing announcement.'
        );
        candidateQuotes.push({
          claim: 'RULE_PANIC_01: Unverified company termination / panic notice',
          text: matchedPanic,
        });
      }
      if (matchedCred) {
        predictedConsequences.push(
          'Severe security credential breach: transmitting or harvesting unencrypted secrets/keys via email.'
        );
        candidateQuotes.push({
          claim: 'RULE_EXFIL_04: Credential harvesting / secret exposure risk',
          text: matchedCred,
        });
      }
      if (matchedDlp) {
        predictedConsequences.push(
          'Regulatory & DLP compliance breach: unauthorized disclosure of confidential, financial, or PII records.'
        );
        candidateQuotes.push({
          claim: 'RULE_DLP_03: Restricted PII / confidential data leak',
          text: matchedDlp,
        });
      }
      if (matchedBlast) {
        predictedConsequences.push(
          'Uncontrolled operational panic and unverified infrastructure incident escalation.'
        );
        candidateQuotes.push({
          claim: 'RULE_BLAST_02: High-anxiety destructive infrastructure claim',
          text: matchedBlast,
        });
      }
    } else if (externalRecipients.length > 0) {
      const externalRiskPatterns = [
        'staging database',
        'latency',
        'database',
        'delay',
        'incident',
        'bug',
        'vulnerability',
        'sla',
        'contract',
        'pricing',
      ];
      const matchedExtRisk = this.findVerbatimMatch(combinedSource, externalRiskPatterns);

      if (matchedExtRisk) {
        riskLevel = 'MEDIUM';
        riskScore = 0.55;
        blastRadius = `MEDIUM (external domain: ${externalRecipients.join(', ')})`;
        recommendedAction = 'REVISE'; // triggers human review gate
        predictedConsequences.push(
          'Client contractual communication: external recipient notified of internal operational or infrastructure details.'
        );
        predictedConsequences.push(
          'Potential SLA scrutiny or escalation from external stakeholder.'
        );
        candidateQuotes.push({
          claim: 'RULE_EXT_05: Disclosing internal telemetry to external domain',
          text: matchedExtRisk,
        });
        if (lowerBody.includes('latency') && matchedExtRisk.toLowerCase() !== 'latency') {
          candidateQuotes.push({
            claim: 'Latency anomaly notification',
            text: 'latency',
          });
        }
      } else {
        riskLevel = 'MEDIUM';
        riskScore = 0.48;
        blastRadius = `MEDIUM (external recipient: ${externalRecipients.join(', ')})`;
        recommendedAction = 'REVISE';
        predictedConsequences.push(
          `Outbound communication crosses organizational boundary (${externalRecipients.join(', ')}); requires operator sign-off.`
        );
        candidateQuotes.push({
          claim: 'RULE_EXT_05: External domain transmission',
          text: draft.subject.slice(0, 32).trim() || draft.body.slice(0, 32).trim(),
        });
      }
    } else {
      // Internal routine action or sanitized engineering status notice
      riskLevel = 'LOW';
      riskScore = 0.15;
      blastRadius = 'LOW (internal team notification)';
      recommendedAction = 'PROCEED';

      if (lowerBody.includes('operational incident') || lowerBody.includes('service degradation') || lowerBody.includes('compliance review')) {
        predictedConsequences.push(
          'Authorized engineering status review; sensitive telemetry safely routed via internal incident portal.'
        );
        if (lowerBody.includes('operational incident')) {
          candidateQuotes.push({
            claim: 'Internal service incident review notice',
            text: 'operational incident',
          });
        }
        if (lowerBody.includes('incident portal')) {
          candidateQuotes.push({
            claim: 'Directing logging via secure internal portal',
            text: 'incident portal',
          });
        }
      } else {
        predictedConsequences.push(
          'Routine internal coordination; no external exposure, credential leakage, or compliance impact.'
        );
        const routineMatch =
          this.findVerbatimMatch(combinedSource, ['sync', 'meeting', 'review', 'update', 'schedule']) ||
          draft.subject.split(' ').slice(0, 2).join(' ');
        if (routineMatch) {
          candidateQuotes.push({
            claim: 'Verified safe internal coordination token',
            text: routineMatch,
          });
        }
      }
    }

    // Layer 3: Deterministic Grounding Audit
    const fullText = `${draft.subject} ${draft.body} ${originalIntent}`.toLowerCase();
    const groundedEvidence: EvidenceQuote[] = [];
    let groundingFailures = 0;

    for (const item of candidateQuotes) {
      const q = item.text.trim().toLowerCase();
      if (q.length >= 3 && fullText.includes(q)) {
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
      riskScore = Math.max(riskScore, 0.92);
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

