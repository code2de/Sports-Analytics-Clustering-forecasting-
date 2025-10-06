import React from 'react'

export default function TabView({ tabs = [], activeKey, onChange, children }) {
  return (
    <div className="tabs">
      <div className="tab-headers">
        {tabs.map(t => (
          <button
            key={t.key}
            className={activeKey === t.key ? 'tab active' : 'tab'}
            onClick={() => onChange?.(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="tab-panels">
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return null
          const key = child.props['data-key']
          return activeKey === key ? <div className="tab-panel">{child}</div> : null
        })}
      </div>
    </div>
  )
}
