import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './AnalyticsDashboard.css'

export default function AnalyticsDashboard({ analytics }) {
    if (!analytics) {
        return (
            <div className="dashboard-placeholder">
                <p>Analytics will appear here after video processing</p>
            </div>
        )
    }

    const { joint_angles, posture_metrics, motion_metrics, symmetry_score, anomalies, summary } = analytics

    // Prepare data for joint angle chart
    const angleData = Object.keys(joint_angles).reduce((acc, key, idx) => {
        const frames = joint_angles[key]
        frames.forEach((angle, frameIdx) => {
            if (!acc[frameIdx]) {
                acc[frameIdx] = { frame: frameIdx }
            }
            acc[frameIdx][key] = angle
        })
        return acc
    }, [])

    // Get top 5 joints by range of motion
    const romData = Object.entries(motion_metrics.range_of_motion || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([joint, value]) => ({
            joint: `Joint ${joint}`,
            rom: value.toFixed(2)
        }))

    return (
        <div className="analytics-dashboard">
            <h2 className="text-gradient text-3xl font-bold mb-6">Analytics Dashboard</h2>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{posture_metrics.overall_posture_score.toFixed(1)}</div>
                        <div className="stat-label">Posture Score</div>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{symmetry_score.toFixed(1)}</div>
                        <div className="stat-label">Symmetry Score</div>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{anomalies.anomaly_count}</div>
                        <div className="stat-label">Anomalies</div>
                    </div>
                </div>

                <div className="stat-card glass-card">
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #43e97b, #38f9d7)' }}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <div className="stat-value">{motion_metrics.max_velocity.toFixed(2)}</div>
                        <div className="stat-label">Max Velocity</div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {/* Joint Angles Over Time */}
                <div className="chart-card glass-card">
                    <h3 className="chart-title">Joint Angles Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={angleData.slice(0, 100)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="frame" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#9ca3af' }}
                            />
                            <Legend wrapperStyle={{ color: '#9ca3af' }} />
                            <Line type="monotone" dataKey="left_knee" stroke="#9370db" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="right_knee" stroke="#ff69b4" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="left_elbow" stroke="#32cd32" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="right_elbow" stroke="#ff6347" dot={false} strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Range of Motion */}
                <div className="chart-card glass-card">
                    <h3 className="chart-title">Range of Motion (Top Joints)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={romData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="joint" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip
                                contentStyle={{ background: '#1f1f1f', border: '1px solid #333', borderRadius: '0.5rem' }}
                                labelStyle={{ color: '#9ca3af' }}
                            />
                            <Bar dataKey="rom" fill="url(#colorGradient)" />
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={1} />
                                    <stop offset="100%" stopColor="#d946ef" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="insights-section">
                <div className="insights-card glass-card">
                    <h3 className="section-title">
                        <svg className="section-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        Insights
                    </h3>
                    <ul className="insights-list">
                        {summary.insights.map((insight, idx) => (
                            <li key={idx} className="insight-item">
                                <span className="bullet">•</span>
                                {insight}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="recommendations-card glass-card">
                    <h3 className="section-title">
                        <svg className="section-icon" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        Recommendations
                    </h3>
                    <ul className="recommendations-list">
                        {summary.recommendations.map((rec, idx) => (
                            <li key={idx} className="recommendation-item">
                                <span className="check-icon">✓</span>
                                {rec}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Export Button */}
            <div className="export-section">
                <button
                    onClick={() => {
                        const dataStr = JSON.stringify(analytics, null, 2)
                        const dataBlob = new Blob([dataStr], { type: 'application/json' })
                        const url = URL.createObjectURL(dataBlob)
                        const link = document.createElement('a')
                        link.href = url
                        link.download = 'pose-analytics.json'
                        link.click()
                    }}
                    className="btn-gradient"
                >
                    <svg className="btn-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Export Analytics (JSON)
                </button>
            </div>
        </div>
    )
}
