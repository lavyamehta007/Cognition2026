import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="footer" id="principles">
      <a className="brand footer-brand" href="#top">
        <span className="brand-mark">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span>
          Cognition<span className="brand-year">2026</span>
          <small>CONSEQUENCE PREDICTION AI</small>
        </span>
      </a>
      <p>Safer agents start with a second thought.</p>
      <span className="footer-status">
        <i></i> BUILT FOR DELIBERATE ACTION
      </span>
    </footer>
  );
};
