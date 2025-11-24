# AI 3D Posture & Motion Analytics Dashboard

A cutting-edge web application that uses AI to analyze body movement in 3D. Upload a video, and get detailed posture analysis, motion metrics, and actionable insights.

## Features

- 🎥 **Video Upload** - Support for MP4, MOV, and AVI formats
- 🤖 **AI Pose Estimation** - MediaPipe-powered 33-point body tracking
- 🎨 **3D Visualization** - Real-time skeleton rendering with Three.js
- 📊 **Advanced Analytics** - Joint angles, posture scoring, symmetry analysis
- 📈 **Interactive Dashboard** - Beautiful charts and insights
- 📥 **Export Results** - Download analytics as JSON or PDF

## Tech Stack

### Frontend
- React + Vite
- Tailwind CSS
- Three.js (3D rendering)
- Recharts (data visualization)

### Backend
- Python FastAPI
- MediaPipe Pose
- OpenCV
- NumPy, Pandas, Scikit-Learn

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+
- FFmpeg (for video processing)

### Installation

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Usage

1. Start both frontend and backend servers
2. Navigate to `http://localhost:5173`
3. Upload a video showing a person performing an action
4. Wait for AI processing
5. Explore the 3D visualization and analytics dashboard
6. Export results

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Render)
- Connect your GitHub repository
- Select "Web Service"
- Set build command: `pip install -r requirements.txt`
- Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Project Structure

```
.
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
│
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── routers/
│   │   ├── services/
│   │   └── models/
│   └── requirements.txt
│
└── docs/             # Documentation
```

## Analytics Metrics

- **Joint Angles**: Shoulder, elbow, hip, knee flexion
- **Posture Score**: Spine alignment and head positioning
- **Symmetry Score**: Left vs right balance
- **Motion Metrics**: Velocity, acceleration, range of motion
- **Anomaly Detection**: Jerky movement identification

## License

MIT License - feel free to use this project for your own applications!

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
