import React from 'react'

export default function SelectDropdown({ label, value, onChange, options = [], placeholder='Select', disabled=false }) {
  return (
    <div className="form-row">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
        {!value && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  )
}
