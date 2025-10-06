import React, { useMemo, useState } from 'react'

export default function DataTable({ rows = [], columns = [], pageSize = 10 }) {
  const [page, setPage] = useState(0)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query) return rows
    const q = query.toLowerCase()
    return rows.filter(r => columns.some(c => String(r[c] ?? '').toLowerCase().includes(q)))
  }, [rows, columns, query])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const view = filtered.slice(page * pageSize, (page + 1) * pageSize)

  const onPrev = () => setPage(p => Math.max(0, p - 1))
  const onNext = () => setPage(p => Math.min(totalPages - 1, p + 1))

  return (
    <div className="datatable">
      <div className="datatable-toolbar">
        <input
          className="datatable-search"
          placeholder="Search..."
          value={query}
          onChange={e => { setPage(0); setQuery(e.target.value) }}
        />
        <div className="datatable-pages">
          <button onClick={onPrev} disabled={page === 0}>Prev</button>
          <span>{page + 1} / {totalPages}</span>
          <button onClick={onNext} disabled={page >= totalPages - 1}>Next</button>
        </div>
      </div>
      <div className="table-wrapper fancy">
        <table>
          <thead>
            <tr>
              {columns.map(c => <th key={c}>{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {view.map((row, i) => (
              <tr key={i}>
                {columns.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && <p className="muted">No data to display.</p>}
    </div>
  )
}
