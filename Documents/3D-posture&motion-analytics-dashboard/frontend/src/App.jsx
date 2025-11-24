import { useState } from 'react'
import UploadSection from './components/UploadSection'
import ThreeDViewer from './components/ThreeDViewer'
import AnalyticsDashboard from './components/AnalyticsDashboard'
import './App.css'

function App() {
  const [results, setResults] = useState(null)
  const [activeTab, setActiveTab] = useState('upload')

  const handleUploadComplete = (data) => {
    setResults(data)
    setActiveTab('viewer')
  }

  const handleReset = () => {
    setResults(null)
    setActiveTab('upload')
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title text-gradient">
            AI 3D Posture & Motion Analytics
          </h1>
          <p className="app-subtitle">
            Upload a video, get instant pose analysis and motion insights
          </p>
        </div>
      </header>

      {/* Navigation Tabs */}
      {results && (
        <nav className="tab-nav glass-card">
          <button
            onClick={() => setActiveTab('upload')}
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          >
            <svg className="tab-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            Upload
          </button>
          <button
            onClick={() => setActiveTab('viewer')}
            className={`tab-btn ${activeTab === 'viewer' ? 'active' : ''}`}
          >
            <svg className="tab-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            3D Viewer
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          >
            <svg className="tab-icon" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Analytics
          </button>
          <button onClick={handleReset} className="reset-btn">
            <svg className="tab-icon" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Reset
          </button>
        </nav>
      )}

      {/* Main Content */}
      <main className="app-content">
        {activeTab === 'upload' && (
          <UploadSection onUploadComplete={handleUploadComplete} />
        )}

        {activeTab === 'viewer' && results && (
          <div className="viewer-section">
            <ThreeDViewer poseData={results.pose_data} />
            <div className="viewer-info glass-card">
              <div className="info-item">
                <span className="info-label">Frames Processed:</span>
                <span className="info-value">{results.frames_processed}</span>
              </div>
              <div className="info-item">
                <span className="info-label">File:</span>
                <span className="info-value">{results.filename}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value success">{results.status}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && results && (
          <AnalyticsDashboard analytics={results.analytics} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Built with React, Three.js, FastAPI & MediaPipe</p>
        <p className="footer-note">© 2024 AI 3D Posture Analytics</p>
      </footer>
    </div>
  )
}

export default App
