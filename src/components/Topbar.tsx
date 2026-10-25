import React, { useState } from 'react';

export const Topbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Cognition2026 home">
        <span className="brand-mark" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
        <span className="brand-wordmark">
          Cognition<span className="brand-year">2026</span>
        </span>
      </a>

      <nav className={`nav-links ${isOpen ? 'open' : ''}`} aria-label="Main navigation">
        <a href="#lab" onClick={() => setIsOpen(false)}>Live Sandbox</a>
        <a href="#capabilities" onClick={() => setIsOpen(false)}>Specifications</a>
        <a href="#process" onClick={() => setIsOpen(false)}>Pipeline Trace</a>
        <a href="#explore" onClick={() => setIsOpen(false)}>Architecture</a>
      </nav>

      <div className="topbar-actions">
        <a className="nav-cta" href="#lab" onClick={() => setIsOpen(false)}>
          <span>Launch Interceptor</span>
          <kbd className="kbd-badge">[↗]</kbd>
        </a>
        <button
          className="menu-toggle"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
};
