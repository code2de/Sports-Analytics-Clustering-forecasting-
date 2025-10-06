import React from 'react'

export default function NumericInput({ label, value, onChange, min=2, max=10 }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange?.(Number(e.target.value))}
      />
    </div>
  )
}
