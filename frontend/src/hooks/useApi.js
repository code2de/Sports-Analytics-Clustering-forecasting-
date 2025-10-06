import { useState } from 'react'
import { API_BASE_URL, USE_MOCKS } from '../config'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [cleaningSummary, setCleaningSummary] = useState('')
  const [eda, setEda] = useState(null)
  const [clusters, setClusters] = useState(null)
  const [forecast, setForecast] = useState(null)

  async function runPreprocess(rows) {
    setLoading(true)
    setCleaningSummary('')
    try {
      if (USE_MOCKS) {
        await sleep(600)
        const rowCount = rows.length
        const cols = rowCount ? Object.keys(rows[0]) : []
        setCleaningSummary(`Rows: ${rowCount}\nColumns: ${cols.join(', ')}\nMissing values handled: none (mock)`)
        return
      }
      const res = await fetch(`${API_BASE_URL}/preprocess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows })
      })
      const json = await res.json()
      setCleaningSummary(json.summary || 'No summary')
    } finally {
      setLoading(false)
    }
  }

  async function runAnalysis({ k, goalsCol, assistsCol, playerCol }) {
    setLoading(true)
    setClusters(null)
    try {
      if (USE_MOCKS) {
        await sleep(800)
        // produce a tiny mock clustering result
        const points = Array.from({ length: 150 }, (_, i) => ({
          Goals: Math.round(Math.random()*30),
          Assists: Math.round(Math.random()*20),
          cluster: Math.floor(Math.random()*k)
        }))
        setClusters({ points, summary: `KMeans with k=${k} complete (mock).` })
        return
      }
      const res = await fetch(`${API_BASE_URL}/cluster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ k, goalsCol, assistsCol, playerCol })
      })
      const json = await res.json()
      setClusters(json)
    } finally {
      setLoading(false)
    }
  }

  async function runForecast({ player, playerCol }) {
    setLoading(true)
    setForecast(null)
    try {
      if (USE_MOCKS) {
        await sleep(700)
        const x = Array.from({ length: 24 }, (_, i) => i+1)
        const y = x.map(i => 5 + 0.8*i + (Math.random()*2-1))
        setForecast({ series: [
          { name: 'History', x: x.slice(0, 12), y: y.slice(0,12), mode: 'lines', line: { color: '#6b7280' } },
          { name: 'Forecast', x: x.slice(12), y: y.slice(12), mode: 'lines', line: { color: '#16a34a' } }
        ] })
        return
      }
      const res = await fetch(`${API_BASE_URL}/forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player, playerCol })
      })
      const json = await res.json()
      setForecast(json)
    } finally {
      setLoading(false)
    }
  }

  return { loading, cleaningSummary, eda, clusters, forecast, runPreprocess, runAnalysis, runForecast }
}
