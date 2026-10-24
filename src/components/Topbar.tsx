import React, { useState } from 'react';

export const Topbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Cognition2026 home">
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

      <button
        className="menu-toggle"
        aria-label="Toggle navigation"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '×' : '☰'}
      </button>

      <nav className={`nav-links ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        <a href="#lab" onClick={() => setIsOpen(false)}>Live Lab</a>
        <a href="#capabilities" onClick={() => setIsOpen(false)}>Capabilities</a>
        <a href="#process" onClick={() => setIsOpen(false)}>Process</a>
        <a href="#principles" onClick={() => setIsOpen(false)}>Principles</a>
        <a className="nav-cta" href="#lab" onClick={() => setIsOpen(false)}>
          Explore the system <span>↗</span>
        </a>
      </nav>
    </header>
  );
};
