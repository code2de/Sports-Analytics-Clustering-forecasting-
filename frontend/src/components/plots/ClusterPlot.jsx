import React, { useId } from 'react'
import Plot from 'react-plotly.js'
import Plotly from 'plotly.js-basic-dist-min'

export default function ClusterPlot({ title, data = [], xKey, yKey, clusterKey='cluster', onExport }) {
  const plotId = useId()
  const clusters = [...new Set(data.map(d => d[clusterKey]))]
  const neon = ['#22d3ee','#22c55e','#e879f9','#f59e0b','#ef4444','#60a5fa','#a78bfa','#34d399','#f472b6','#38bdf8']

  const clusterPoints = (c) => data.filter(d => d[clusterKey] === c)
  const centroidOf = (pts) => {
    const xs = pts.map(p => Number(p[xKey])).filter(Number.isFinite)
    const ys = pts.map(p => Number(p[yKey])).filter(Number.isFinite)
    if (!xs.length || !ys.length) return null
    const mean = (arr) => arr.reduce((a,b)=>a+b,0)/arr.length
    return { x: mean(xs), y: mean(ys) }
  }

  const traces = []
  clusters.forEach((c, i) => {
    const pts = clusterPoints(c)
    traces.push({
      x: pts.map(d => d[xKey]),
      y: pts.map(d => d[yKey]),
      mode: 'markers',
      type: 'scatter',
      name: `Cluster ${c}`,
      marker: { size: 8, color: neon[i % neon.length], line: { color: '#0f172a', width: 1 } },
      hovertemplate: `${xKey || 'X'}: %{x}<br>${yKey || 'Y'}: %{y}<br>Cluster: ${c}<extra></extra>`
    })
    const cent = centroidOf(pts)
    if (cent) {
      traces.push({
        x: [cent.x],
        y: [cent.y],
        mode: 'markers',
        type: 'scatter',
        name: `Centroid ${c}`,
        marker: { size: 14, color: neon[i % neon.length], symbol: 'diamond', line: { color: '#ffffff', width: 2 } },
        hovertemplate: `Centroid ${c}<br>${xKey || 'X'}: %{x}<br>${yKey || 'Y'}: %{y}<extra></extra>`
      })
    }
  })

  return (
    <div className="plot-card">
      <div className="plot-header">
        <h3>{title}</h3>
        <div className="spacer" />
        <button onClick={() => onExport?.(plotId)} disabled={!data.length}>Export Image</button>
      </div>
      <Plot
        divId={plotId}
        data={traces}
        layout={{
          margin: { t: 10, r: 10, b: 50, l: 50 },
          autosize: true,
          legend: { orientation: 'h', font: { color: getComputedStyle(document.documentElement).getPropertyValue('--text') || '#e5e7eb' } },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          xaxis: { gridcolor: '#1f2937', zerolinecolor: '#334155', title: xKey },
          yaxis: { gridcolor: '#1f2937', zerolinecolor: '#334155', title: yKey },
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
