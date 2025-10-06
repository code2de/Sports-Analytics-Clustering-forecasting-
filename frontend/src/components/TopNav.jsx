import React from 'react'

export default function TopNav({ tabs = [], activeKey, onTabChange }) {
  return (
    <header className="topnav">
      <div className="brand">Predictive Edge</div>
      <nav className="nav-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`nav-tab ${activeKey === t.key ? 'active' : ''}`}
            onClick={() => onTabChange?.(t.key)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
