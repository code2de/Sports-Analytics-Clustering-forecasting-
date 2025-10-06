import React, { useId } from 'react'
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-basic-dist-min'

export default function ForecastPlot({ title, series = [], onExport }) {
  const plotId = useId()

  // Identify history and forecast series by name (fallback to order)
  const hist = series.find(s => /history/i.test(s.name || '')) || series[0]
  const fc = series.find(s => /forecast/i.test(s.name || '')) || series[1]

  const traces = []
  if (hist) {
    traces.push({
      x: hist.x,
      y: hist.y,
      mode: 'lines',
      type: 'scatter',
      name: hist.name || 'History',
      line: { color: '#6b7280', width: 2, shape: 'spline' },
      hovertemplate: '%{x}: %{y}<extra></extra>'
    })
  }

  if (fc) {
    // Client-side confidence band: +/- 12% of forecast value (visual aid)
    const upper = fc.y.map(v => Number(v) * 1.12)
    const lower = fc.y.map(v => Number(v) * 0.88)

    // Upper band (invisible line)
    traces.push({
      x: fc.x,
      y: upper,
      mode: 'lines',
      type: 'scatter',
      name: 'Upper CI',
      line: { width: 0, shape: 'spline' },
      hoverinfo: 'skip',
      showlegend: false
    })
    // Lower band, filled to previous (creates shaded CI)
    traces.push({
      x: fc.x,
      y: lower,
      mode: 'lines',
      type: 'scatter',
      name: 'Lower CI',
      line: { width: 0, shape: 'spline' },
      fill: 'tonexty',
      fillcolor: 'rgba(34,211,238,0.18)',
      hoverinfo: 'skip',
      showlegend: false
    })
    // Forecast line on top
    traces.push({
      x: fc.x,
      y: fc.y,
      mode: 'lines',
      type: 'scatter',
      name: fc.name || 'Forecast',
      line: { color: '#22d3ee', width: 3, shape: 'spline' },
      hovertemplate: '%{x}: %{y}<extra></extra>'
    })
  }

  return (
    <div className="plot-card">
      <div className="plot-header">
        <h3>{title}</h3>
        <div className="spacer" />
        <button onClick={() => onExport?.(plotId)} disabled={!series.length}>Export Image</button>
      </div>
      <Plot
        divId={plotId}
        data={traces}
        layout={{
          margin: { t: 10, r: 10, b: 50, l: 50 },
          autosize: true,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          xaxis: { gridcolor: '#1f2937', zerolinecolor: '#334155' },
          yaxis: { gridcolor: '#1f2937', zerolinecolor: '#334155' },
          font: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#e5e7eb' }
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: true, responsive: true }}
        onInitialized={(figure, graphDiv) => { graphDiv._fullLayout._plotly = Plotly }}
        onUpdate={(figure, graphDiv) => { graphDiv._fullLayout._plotly = Plotly }}
      />
    </div>
  )
}
