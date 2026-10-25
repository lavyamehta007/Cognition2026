import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" id="principles">
      <a className="brand footer-brand" href="#top">
        <span className="brand-mark" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span className="brand-wordmark">
          Cognition<span className="brand-year">2026</span>
        </span>
      </a>
      <p>Safer autonomous agents start with deterministic pre-execution verification.</p>
      <span className="footer-status">
        BUILT FOR DELIBERATE ACTION · TWO-PHASE COMMIT ARCHITECTURE
      </span>
    </footer>
  );
};
