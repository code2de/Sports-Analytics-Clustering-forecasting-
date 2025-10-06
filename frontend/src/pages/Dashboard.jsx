import React, { useMemo, useState } from 'react'
import FileUpload from '../components/FileUpload'
import NumericInput from '../components/NumericInput'
import SelectDropdown from '../components/SelectDropdown'
import TabView from '../components/TabView'
import ScatterPlot from '../components/plots/ScatterPlot'
import ClusterPlot from '../components/plots/ClusterPlot'
import ForecastPlot from '../components/plots/ForecastPlot'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'
import TopNav from '../components/TopNav'
import { useApi } from '../hooks/useApi'
import { exportCSV, exportPlotAsImage } from '../utils/exportUtils'

function inferColumn(columns, names) {
  const lower = columns.map(c => c.toLowerCase())
  for (const n of names) {
    const idx = lower.indexOf(n.toLowerCase())
    if (idx !== -1) return columns[idx]
  }
  return null
}

function detectNumericColumns(rows) {
  if (!rows?.length) return []
  const keys = Object.keys(rows[0] || {})
  // Consider a column numeric if at least 70% of non-null values are finite numbers
  return keys.filter(k => {
    let vals = rows.map(r => r[k]).filter(v => v !== null && v !== '' && v !== undefined)
    if (!vals.length) return false
    let nums = vals.map(v => Number(v)).filter(v => Number.isFinite(v))
    return nums.length / vals.length >= 0.7
  })
}

export default function Dashboard() {
  const [rawData, setRawData] = useState([])
  const [columns, setColumns] = useState([])
  const [previewRows, setPreviewRows] = useState([])
  const [players, setPlayers] = useState([])
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [kClusters, setKClusters] = useState(3)
  const [activeTab, setActiveTab] = useState('Dataset')

  const { loading, cleaningSummary, clusters, forecast, runPreprocess, runAnalysis, runForecast } = useApi()

  const goalsColumn = useMemo(() => inferColumn(columns, ['Goals', 'goals', 'G']), [columns])
  const assistsColumn = useMemo(() => inferColumn(columns, ['Assists', 'assists', 'A']), [columns])
  const playerColumn = useMemo(() => inferColumn(columns, ['Player', 'player', 'Name', 'name']), [columns])

  const numericColumns = useMemo(() => detectNumericColumns(rawData), [rawData])
  const [edaX, setEdaX] = useState(null)
  const [edaY, setEdaY] = useState(null)

  const onFileParsed = ({ data, columns: cols, preview }) => {
    setRawData(data)
    setColumns(cols)
    setPreviewRows(preview)
    const inferredPlayerCol = inferColumn(cols, ['Player', 'player', 'Name', 'name'])
    const playerList = inferredPlayerCol ? [...new Set(data.map(r => r[inferredPlayerCol]).filter(Boolean))] : []
    setPlayers(playerList)
    if (playerList.length) setSelectedPlayer(playerList[0])
  }

  const handleRun = async () => {
    await runPreprocess(rawData)
    await runAnalysis({ k: kClusters, goalsCol: goalsColumn, assistsCol: assistsColumn, playerCol: playerColumn })
    if (selectedPlayer) await runForecast({ player: selectedPlayer, playerCol: playerColumn })
  }

  const tabs = [
    { key: 'Dataset', label: 'Dataset' },
    { key: 'Cleaning', label: 'Cleaning' },
    { key: 'EDA', label: 'EDA' },
    { key: 'Clustering', label: 'Clustering' },
    { key: 'Forecasting', label: 'Forecasting' },
    { key: 'Evaluation', label: 'Evaluation' }
  ]

  const canRun = rawData.length > 0 && goalsColumn && assistsColumn

  // Default EDA axes when numeric columns available
  React.useEffect(() => {
    if (numericColumns.length) {
      setEdaX(prev => prev || numericColumns[0])
      setEdaY(prev => prev || numericColumns[1] || numericColumns[0])
    }
  }, [numericColumns])

  return (
    <div className="page">
      <TopNav tabs={tabs} activeKey={activeTab} onTabChange={setActiveTab} />

      <div className="app">
        <aside className="sidebar">
          <h1>Sports Analytics</h1>
          <p className="subtitle">Interactive Dashboard</p>

          <div className="section">
            <h2>Upload Dataset (CSV)</h2>
            <FileUpload onParsed={onFileParsed} />
          </div>

          <div className="section">
            <h2>Filters</h2>
            <NumericInput label="Number of clusters" min={2} max={10} value={kClusters} onChange={setKClusters} />
            <SelectDropdown label="Player" value={selectedPlayer} options={players} onChange={setSelectedPlayer} placeholder="Select a player" disabled={!players.length} />
          </div>

          <button className="primary" onClick={handleRun} disabled={!canRun || loading}>
            {loading ? 'Running...' : 'Run Analysis'}
          </button>
        </aside>

        <main className="content">
          <TabView tabs={tabs} activeKey={activeTab} onChange={setActiveTab}>
            {/* Dataset */}
            <div data-key="Dataset">
              <div className="toolbar">
                <button onClick={() => exportCSV(previewRows, 'dataset_preview.csv')} disabled={!previewRows.length}>Export Preview CSV</button>
              </div>
              {previewRows.length ? (
                <div className="table-wrapper fancy">
                  <DataTable rows={previewRows} columns={columns} pageSize={10} />
                </div>
              ) : <p>Upload a CSV to see a preview.</p>}
            </div>

            {/* Cleaning */}
            <div data-key="Cleaning">
              {loading ? <LoadingSpinner text="Computing cleaning summary..." /> : (
                <pre className="pre-block">{cleaningSummary || 'No cleaning summary yet. Click Run Analysis.'}</pre>
              )}
            </div>

            {/* EDA */}
            <div data-key="EDA">
              <div className="toolbar">
                <SelectDropdown label="X Axis" value={edaX || ''} options={numericColumns} onChange={setEdaX} placeholder="Select X" />
                <SelectDropdown label="Y Axis" value={edaY || ''} options={numericColumns} onChange={setEdaY} placeholder="Select Y" />
              </div>
              {(edaX && edaY && rawData.length) ? (
                <ScatterPlot
                  title={`${edaX} vs ${edaY}`}
                  xLabel={edaX}
                  yLabel={edaY}
                  data={rawData}
                  xKey={edaX}
                  yKey={edaY}
                  onExport={(id) => exportPlotAsImage(id, 'eda_scatter.png')}
                />
              ) : <p className="muted">Select two numeric columns to render the scatter plot.</p>}
            </div>

            {/* Clustering */}
            <div data-key="Clustering">
              {loading && <LoadingSpinner text="Running clustering..." />}
              {!loading && clusters && clusters.points ? (
                <ClusterPlot
                  title={`K-Means Clustering (k=${kClusters})`}
                  data={clusters.points}
                  xKey={goalsColumn}
                  yKey={assistsColumn}
                  clusterKey={'cluster'}
                  onExport={(id) => exportPlotAsImage(id, 'clusters.png')}
                />
              ) : (!loading && <p>No clustering results yet. Click Run Analysis.</p>)}
            </div>

            {/* Forecasting */}
            <div data-key="Forecasting">
              {loading && <LoadingSpinner text="Generating forecast..." />}
              {!loading && forecast && forecast.series ? (
                <ForecastPlot
                  title={`Forecast for ${selectedPlayer || 'Player'}`}
                  series={forecast.series}
                  onExport={(id) => exportPlotAsImage(id, 'forecast.png')}
                />
              ) : (!loading && <p>No forecast yet. Select a player and run analysis.</p>)}
            </div>

            {/* Evaluation */}
            <div data-key="Evaluation">
              <pre className="pre-block">{clusters?.summary || 'No evaluation yet. Click Run Analysis.'}</pre>
            </div>
          </TabView>
        </main>
      </div>
    </div>
  )
}
