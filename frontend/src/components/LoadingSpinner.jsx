import React from 'react'

export default function LoadingSpinner({ text='Loading...' }) {
  return (
    <div className="spinner">
      <div className="lds-ring"><div></div><div></div><div></div><div></div></div>
      <span>{text}</span>
    </div>
  )
}
