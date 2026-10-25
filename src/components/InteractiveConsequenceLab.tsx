import React, { useState } from 'react';
import { AgentComposer } from './AgentComposer';
import { SandboxModal } from './SandboxModal';
import { EmailDraft } from '../types';

export const InteractiveConsequenceLab: React.FC = () => {
  const [interceptedDraft, setInterceptedDraft] = useState<EmailDraft | null>(null);
  const [interceptedIntent, setInterceptedIntent] = useState<string>('');
  const [isSandboxOpen, setIsSandboxOpen] = useState<boolean>(false);

  const handleInterceptSend = (draft: EmailDraft, intent: string) => {
    setInterceptedDraft(draft);
    setInterceptedIntent(intent);
    setIsSandboxOpen(true);
  };

  const handleCloseSandbox = () => {
    setIsSandboxOpen(false);
  };

  return (
    <section className="consequence-lab" id="lab">
      <div className="section-kicker">00. INTERACTIVE AGENT SANDBOX LAB</div>
      <div className="lab-header">
        <div>
          <h2>
            Watch the Agent Type.<br />
            <span>Intercept Before It Sends.</span>
          </h2>
          <p className="lab-intro-copy">
            Experience how Cognition prevents catastrophic execution. Watch an autonomous agent draft high-risk actions, arm the safety gate, and inspect the sandbox quarantine at the moment of dispatch.
          </p>
        </div>

        <div className="lab-legend-strip">
          <div className="legend-item">
            <span className="legend-indicator unshielded"></span>
            <span>Direct Send = Unchecked Side Effects</span>
          </div>
          <div className="legend-item">
            <span className="legend-indicator shielded"></span>
            <span>Cognition Gate = Memory Sandbox Quarantine</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Agent Composer */}
      <AgentComposer
        onInterceptSend={handleInterceptSend}
        isSandboxOpen={isSandboxOpen}
      />

      {/* High-Tech Interception Modal */}
      {interceptedDraft && (
        <SandboxModal
          isOpen={isSandboxOpen}
          onClose={handleCloseSandbox}
          draft={interceptedDraft}
          intent={interceptedIntent}
        />
      )}
    </section>
  );
};
