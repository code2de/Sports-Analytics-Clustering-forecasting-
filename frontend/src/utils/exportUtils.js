export function exportCSV(rows, filename='export.csv') {
  if (!rows?.length) return
  const cols = Object.keys(rows[0])
  const csv = [cols.join(','), ...rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportPlotAsImage(divId, filename='chart.png') {
  const el = document.getElementById(divId)
  if (!el || !el._fullLayout || !el._fullLayout._plotly) return
  const Plotly = el._fullLayout._plotly
  try {
    const url = await Plotly.toImage(el, { format: 'png', height: 600, width: 900, scale: 2 })
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  } catch (e) {
    console.error('Export failed', e)
  }
}
