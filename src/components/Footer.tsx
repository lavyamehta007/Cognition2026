import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer
      className="footer scroll-reveal"
      id="principles"
      style={{ '--stagger-idx': 0 } as React.CSSProperties}
    >
      <a
        className="brand footer-brand scroll-reveal"
        href="#top"
        style={{ '--stagger-idx': 0 } as React.CSSProperties}
      >
        <span className="brand-mark" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span className="brand-wordmark">
          Cognition<span className="brand-year">2026</span>
        </span>
      </a>
      <p
        className="scroll-reveal"
        style={{ '--stagger-idx': 1 } as React.CSSProperties}
      >
        Safer autonomous agents start with deterministic pre-execution verification.
      </p>
      <span
        className="footer-status scroll-reveal"
        style={{ '--stagger-idx': 2 } as React.CSSProperties}
      >
        BUILT FOR DELIBERATE ACTION · TWO-PHASE COMMIT ARCHITECTURE
      </span>
    </footer>
  );
};
