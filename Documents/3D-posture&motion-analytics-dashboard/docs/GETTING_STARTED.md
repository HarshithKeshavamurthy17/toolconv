# Getting Started Guide

## Prerequisites

Before running the application, ensure you have the following installed:

### Required Software
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.9+ ([Download](https://www.python.org/downloads/))
- **FFmpeg** (for video processing)
  - Mac: `brew install ffmpeg`
  - Ubuntu: `sudo apt install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

## Quick Start

### 1. Clone the Repository
```bash
cd /Users/anithalakshmipathy/Documents/3D-posture&motion-analytics-dashboard
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Mac/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
uvicorn app.main:app --reload
```

The backend API will be available at: **http://localhost:8000**

API Documentation (Swagger UI): **http://localhost:8000/docs**

### 3. Frontend Setup

Open a **new terminal window**:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will be available at: **http://localhost:5173** (or another port if 5173 is in use)

### 4. Using the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Upload a video file (MP4, MOV, or AVI)
   - Recommended: 5-15 second clips showing a person performing an action
   - Examples: walking, squatting, jumping jacks, yoga poses
3. Wait for processing (this may take 10-30 seconds depending on video length)
4. Explore the 3D visualization and analytics

## Testing the Application

### Sample Test Workflow

1. **Upload Test**: Try uploading a short video
2. **3D Viewer Test**: 
   - Verify skeleton appears
   - Test playback controls (play, pause, speed)
   - Test camera rotation with mouse drag
   - Test zoom with mouse scroll
3. **Analytics Test**:
   - Check that all metrics appear
   - Verify charts render correctly
   - Test JSON export

### Common Issues & Solutions

#### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'mediapipe'`
- **Solution**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

**Problem**: `cv2.error: OpenCV(4.x.x) ... error: (-215:Assertion failed)`
- **Solution**: Install system dependencies:
  - Mac: `brew install opencv`
  - Ubuntu: `sudo apt-get install python3-opencv`

**Problem**: Video processing fails
- **Solution**: Ensure FFmpeg is installed and in your PATH

#### Frontend Issues

**Problem**: CORS errors in browser console
- **Solution**: Make sure backend is running on `http://localhost:8000`

**Problem**: "Cannot connect to backend"
- **Solution**: Check that backend is running and the API URL in frontend matches

**Problem**: 3D viewer shows blank screen
- **Solution**: Check browser console for errors. Try a different browser (Chrome or Firefox recommended)

## Development Tips

### Backend Development

- **Auto-reload**: The `--reload` flag enables automatic restart on code changes
- **Logs**: Backend prints detailed logs to console for debugging
- **API Testing**: Use the Swagger UI at `/docs` to test endpoints directly

### Frontend Development

- **Hot Reload**: Vite automatically updates the browser on code changes
- **React DevTools**: Install React DevTools browser extension for debugging
- **Console Logs**: Check browser console for errors

## Deployment

See [README.md](../README.md) for deployment instructions to:
- **Vercel** (frontend)
- **Render** (backend)

## Environment Variables

### Backend
No environment variables required for local development.

### Frontend
Create a `.env` file in the `frontend` directory:
```
VITE_API_URL=http://localhost:8000
```

For production, update to your deployed backend URL.

## Performance Optimization

### Video Processing Tips
- **Shorter videos** (5-15 seconds) process faster
- **Lower resolution** videos require less memory
- **Higher FPS** extraction gives smoother animations but slower processing

### Browser Performance
- **Chrome/Firefox** recommended for best Three.js performance
- **GPU Acceleration** should be enabled in browser settings
- Close other tabs if experiencing lag in 3D viewer

## Next Steps

- Try different types of videos (running, yoga, sports)
- Experiment with the analytics dashboard
- Export results as JSON
- Customize the frontend styling
- Add new analytics metrics

## Support

For issues or questions:
1. Check this guide first
2. Review the main [README.md](../README.md)
3. Check browser console and terminal logs for error messages
