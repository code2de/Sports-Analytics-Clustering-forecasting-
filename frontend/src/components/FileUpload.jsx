import React, { useRef, useState } from 'react'
import Papa from 'papaparse'

const MAX_SIZE_MB = 10

export default function FileUpload({ onParsed }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [parsing, setParsing] = useState(false)
  const [status, setStatus] = useState('')

  const handleFile = (file) => {
    setError('')
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a .csv file.')
      return
    }
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_SIZE_MB) {
      setError(`File too large. Max ${MAX_SIZE_MB} MB`)
      return
    }
    setFileName(file.name)

    setParsing(true)
    setStatus('Parsing file...')

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      worker: true,
      complete: (results) => {
        const data = results.data
        const columns = results.meta.fields || (data.length ? Object.keys(data[0]) : [])
        const preview = data.slice(0, 10)
        onParsed?.({ data, columns, preview })
        setStatus(`Parsed ${data.length} rows, ${columns.length} columns`)
        setParsing(false)
      },
      error: (err) => {
        setError(`Parse error: ${err?.message || 'unknown'}`)
        setStatus('')
        setParsing(false)
      }
    })
  }

  return (
    <div className="file-upload">
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ display: 'none' }}
      />
      <button className="neon" onClick={() => inputRef.current?.click()}>Choose CSV</button>
      {fileName && <span className="file-name">{fileName}</span>}
      {error && <div className="error">{error}</div>}
      {parsing && (
        <div className="progress">
          <div className="progress-bar indeterminate" />
          <span className="progress-label">{status}</span>
        </div>
      )}
      {!parsing && status && <div className="status">{status}</div>}
    </div>
  )
}
