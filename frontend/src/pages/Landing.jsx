import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div className="landing">
      <div className="hero">
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">Predictive Edge: Sports Data Intelligence</h1>
          <p className="hero-tagline">Discover patterns, cluster talent, and forecast performance with a modern analytics workspace.</p>
          <button className="cta neon" onClick={() => navigate('/dashboard')}>Launch Dashboard →</button>
        </div>
        <div className="hero-bg" aria-hidden>
          <div className="grid-lines" />
          <div className="flow" />
        </div>
      </div>

      <section className="features">
        <div className="feature-card">
          <h3>Advanced Forecasting</h3>
          <p>Model future trends with smooth, informative visuals and confidence bands.</p>
        </div>
        <div className="feature-card">
          <h3>Player Clustering</h3>
          <p>Segment players with clear cluster colors and centroid markers.</p>
        </div>
        <div className="feature-card">
          <h3>Interactive EDA</h3>
          <p>Zoom, pan, and explore relationships with dynamic axis selection.</p>
        </div>
      </section>
    </div>
  )
}
