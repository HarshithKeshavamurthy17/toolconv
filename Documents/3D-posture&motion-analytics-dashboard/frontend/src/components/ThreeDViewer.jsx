import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import './ThreeDViewer.css'

// MediaPipe pose connections (bones to draw)
const POSE_CONNECTIONS = [
    // Face
    [0, 1], [1, 2], [2, 3], [3, 7],
    [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10],
    // Upper body
    [11, 12], // Shoulders
    [11, 13], [13, 15], // Left arm
    [12, 14], [14, 16], // Right arm
    [15, 17], [15, 19], [15, 21], // Left hand
    [16, 18], [16, 20], [16, 22], // Right hand
    [11, 23], [12, 24], // Torso
    [23, 24], // Hips
    // Lower body
    [23, 25], [25, 27], [27, 29], [29, 31], // Left leg
    [24, 26], [26, 28], [28, 30], [30, 32], // Right leg
]

// Color scheme for different body parts
const COLORS = {
    head: 0xffd700,     // Gold
    torso: 0x00bfff,    // Deep Sky Blue
    leftArm: 0x32cd32,  // Lime Green
    rightArm: 0xff6347, // Tomato
    leftLeg: 0x9370db,  // Medium Purple
    rightLeg: 0xff69b4, // Hot Pink
}

export default function ThreeDViewer({ poseData }) {
    const mountRef = useRef(null)
    const sceneRef = useRef(null)
    const rendererRef = useRef(null)
    const cameraRef = useRef(null)
    const controlsRef = useRef(null)
    const skeletonRef = useRef(null)
    const animationFrameRef = useRef(null)

    const [isPlaying, setIsPlaying] = useState(true)
    const [currentFrame, setCurrentFrame] = useState(0)
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0)

    useEffect(() => {
        if (!mountRef.current || !poseData || poseData.length === 0) return

        // Initialize Three.js scene
        const scene = new THREE.Scene()
        scene.background = new THREE.Color(0x0a0a0a)
        sceneRef.current = scene

        // Camera - positioned to see the skeleton
        const camera = new THREE.PerspectiveCamera(
            75,
            mountRef.current.clientWidth / mountRef.current.clientHeight,
            0.1,
            1000
        )
        camera.position.set(0, 0, 200)
        cameraRef.current = camera

        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true })
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        mountRef.current.appendChild(renderer.domElement)
        rendererRef.current = renderer

        // Controls
        const controls = new OrbitControls(camera, renderer.domElement)
        controls.enableDamping = true
        controls.dampingFactor = 0.05
        controls.target.set(0, 0, 0)
        controlsRef.current = controls

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
        scene.add(ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
        directionalLight.position.set(10, 10, 10)
        scene.add(directionalLight)

        const pointLight = new THREE.PointLight(0x0ea5e9, 1.0)
        pointLight.position.set(0, 50, 50)
        scene.add(pointLight)

        // Grid helper
        const gridHelper = new THREE.GridHelper(200, 20, 0x444444, 0x222222)
        scene.add(gridHelper)

        // Create skeleton group
        const skeleton = new THREE.Group()
        scene.add(skeleton)
        skeletonRef.current = skeleton

        // Animation loop
        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate)
            controls.update()
            renderer.render(scene, camera)
        }
        animate()

        // Handle window resize
        const handleResize = () => {
            if (!mountRef.current) return
            const width = mountRef.current.clientWidth
            const height = mountRef.current.clientHeight

            camera.aspect = width / height
            camera.updateProjectionMatrix()
            renderer.setSize(width, height)
        }
        window.addEventListener('resize', handleResize)

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize)
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement)
            }
            renderer.dispose()
        }
    }, [poseData])

    // Update skeleton based on current frame
    useEffect(() => {
        if (!poseData || !skeletonRef.current || !poseData[currentFrame]) return

        const frameData = poseData[currentFrame]
        if (!frameData.pose_detected || !frameData.landmarks) return

        // Clear previous skeleton
        while (skeletonRef.current.children.length > 0) {
            skeletonRef.current.remove(skeletonRef.current.children[0])
        }

        const landmarks = frameData.landmarks

        console.log(`Frame ${currentFrame}: Rendering ${landmarks.length} landmarks, ${landmarks.filter(l => l.visibility >= 0.3).length} visible`)

        // Add a bright reference sphere at origin for debugging
        const refGeometry = new THREE.SphereGeometry(10, 16, 16)
        const refMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 })
        const refSphere = new THREE.Mesh(refGeometry, refMaterial)
        refSphere.position.set(0, 0, 0)
        skeletonRef.current.add(refSphere)

        // Draw joints (spheres) - LARGER and more visible
        landmarks.forEach((landmark, index) => {
            if (landmark.visibility < 0.3) return // Lower threshold for more joints

            const geometry = new THREE.SphereGeometry(4, 16, 16) // Large spheres
            const material = new THREE.MeshStandardMaterial({
                color: getJointColor(index),
                emissive: getJointColor(index),
                emissiveIntensity: 0.6
            })
            const sphere = new THREE.Mesh(geometry, material)

            // Center and scale the skeleton
            sphere.position.set(
                (landmark.x - 50) * 2,
                -(landmark.y - 50) * 2,
                landmark.z * 2
            )

            skeletonRef.current.add(sphere)
        })

        // Draw bones (lines) - THICKER
        POSE_CONNECTIONS.forEach(([start, end]) => {
            if (start >= landmarks.length || end >= landmarks.length) return
            if (landmarks[start].visibility < 0.3 || landmarks[end].visibility < 0.3) return

            const points = []
            points.push(new THREE.Vector3(
                (landmarks[start].x - 50) * 2,
                -(landmarks[start].y - 50) * 2,
                landmarks[start].z * 2
            ))
            points.push(new THREE.Vector3(
                (landmarks[end].x - 50) * 2,
                -(landmarks[end].y - 50) * 2,
                landmarks[end].z * 2
            ))

            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({
                color: getBoneColor(start, end),
                linewidth: 5
            })
            const line = new THREE.Line(geometry, material)
            skeletonRef.current.add(line)
        })
    }, [poseData, currentFrame])

    // Playback animation
    useEffect(() => {
        if (!isPlaying || !poseData || poseData.length === 0) return

        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev + 1) % poseData.length)
        }, (1000 / 15) / playbackSpeed)

        return () => clearInterval(interval)
    }, [isPlaying, poseData, playbackSpeed])

    const getJointColor = (index) => {
        if (index <= 10) return COLORS.head
        if (index >= 11 && index <= 17 && index % 2 === 1) return COLORS.leftArm
        if (index >= 11 && index <= 22 && index % 2 === 0) return COLORS.rightArm
        if (index === 23 || index === 25 || index === 27) return COLORS.leftLeg
        if (index === 24 || index === 26 || index === 28) return COLORS.rightLeg
        return COLORS.torso
    }

    const getBoneColor = (start, end) => {
        if (start >= 23 || end >= 23) {
            return (start % 2 === 1 || end % 2 === 1) ? COLORS.leftLeg : COLORS.rightLeg
        }
        if (start >= 11 || end >= 11) {
            return (start % 2 === 1 || end % 2 === 1) ? COLORS.leftArm : COLORS.rightArm
        }
        return COLORS.torso
    }

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying)
    }

    const handleReset = () => {
        setCurrentFrame(0)
        setIsPlaying(false)
    }

    const handleSpeedChange = (speed) => {
        setPlaybackSpeed(speed)
    }

    const handleFrameChange = (e) => {
        setCurrentFrame(parseInt(e.target.value))
        setIsPlaying(false)
    }

    if (!poseData || poseData.length === 0) {
        return (
            <div className="viewer-placeholder">
                <p>Upload a video to see 3D pose visualization</p>
            </div>
        )
    }

    return (
        <div className="viewer-container">
            <div className="viewer-canvas" ref={mountRef} />

            <div className="viewer-controls glass-card">
                <div className="control-row">
                    <button
                        onClick={handlePlayPause}
                        className="control-btn"
                        title={isPlaying ? 'Pause' : 'Play'}
                    >
                        {isPlaying ? (
                            <svg fill="currentColor" viewBox="0 0 20 20" className="control-icon">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg fill="currentColor" viewBox="0 0 20 20" className="control-icon">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>

                    <button onClick={handleReset} className="control-btn" title="Reset">
                        <svg fill="currentColor" viewBox="0 0 20 20" className="control-icon">
                            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                    </button>

                    <div className="speed-controls">
                        <label className="speed-label">Speed:</label>
                        {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                            <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                            >
                                {speed}x
                            </button>
                        ))}
                    </div>
                </div>

                <div className="scrubber-container">
                    <span className="frame-label">
                        Frame: {currentFrame + 1} / {poseData.length}
                    </span>
                    <input
                        type="range"
                        min="0"
                        max={poseData.length - 1}
                        value={currentFrame}
                        onChange={handleFrameChange}
                        className="frame-scrubber"
                    />
                </div>
            </div>
        </div>
    )
}
