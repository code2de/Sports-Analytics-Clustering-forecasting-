import React, { useId } from 'react'
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-basic-dist-min'

export default function ScatterPlot({ title, data = [], xKey, yKey, xLabel, yLabel, onExport }) {
  const plotId = useId()
  const xs = (xKey ? data.map(d => d[xKey]) : [])
  const ys = (yKey ? data.map(d => d[yKey]) : [])

  return (
    <div className="plot-card">
      <div className="plot-header">
        <h3>{title}</h3>
        <div className="spacer" />
        <button onClick={() => onExport?.(plotId)} disabled={!xs.length}>Export Image</button>
      </div>
      <Plot
        divId={plotId}
        data={[{
          x: xs,
          y: ys,
          mode: 'markers',
          type: 'scatter',
          marker: { color: '#22d3ee', size: 8, line: { color: '#0ea5e9', width: 1 } },
          hovertemplate: `${xLabel || 'X'}: %{x}<br>${yLabel || 'Y'}: %{y}<extra></extra>`
        }]}
        layout={{
          title: undefined,
          xaxis: { title: xLabel, gridcolor: '#1f2937', zerolinecolor: '#334155' },
          yaxis: { title: yLabel, gridcolor: '#1f2937', zerolinecolor: '#334155' },
          margin: { t: 10, r: 10, b: 50, l: 50 },
          autosize: true,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#e5e7eb' }
        }}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
        config={{ displayModeBar: true, responsive: true, toImageButtonOptions: { format: 'png', filename: 'plot' } }}
        onInitialized={(figure, graphDiv) => { graphDiv._fullLayout._plotly = Plotly }}
        onUpdate={(figure, graphDiv) => { graphDiv._fullLayout._plotly = Plotly }}
      />
    </div>
  )
}
