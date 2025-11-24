import { useState, useRef } from 'react'
import { uploadVideo } from '../services/api'
import './UploadSection.css'

export default function UploadSection({ onUploadComplete }) {
    const [selectedFile, setSelectedFile] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const fileInputRef = useRef(null)

    const allowedTypes = ['video/mp4', 'video/mov', 'video/quicktime', 'video/avi']
    const maxSize = 100 * 1024 * 1024 // 100MB

    const validateFile = (file) => {
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Please upload MP4, MOV, or AVI files.')
            return false
        }
        if (file.size > maxSize) {
            setError('File too large. Maximum size is 100MB.')
            return false
        }
        return true
    }

    const handleFileSelect = (file) => {
        setError(null)

        if (validateFile(file)) {
            setSelectedFile(file)

            // Create video preview
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleFileInputChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsUploading(true)
        setError(null)
        setUploadProgress(0)

        try {
            const result = await uploadVideo(selectedFile, (progress) => {
                setUploadProgress(progress)
            })

            // Call parent callback with results
            onUploadComplete(result)
        } catch (err) {
            setError(err.response?.data?.detail || 'Upload failed. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleReset = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setError(null)
        setUploadProgress(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="upload-section">
            <div className="upload-container glass-card">
                <h2 className="text-gradient text-3xl font-bold mb-6">Upload Video</h2>

                {!selectedFile ? (
                    <div
                        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="drop-zone-content">
                            <svg
                                className="upload-icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="text-xl font-semibold mb-2">
                                Drag & drop your video here
                            </p>
                            <p className="text-gray-400 mb-4">or click to browse</p>
                            <p className="text-sm text-gray-500">
                                Supports: MP4, MOV, AVI • Max size: 100MB
                            </p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/mov,video/quicktime,video/avi"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div className="file-preview">
                        {previewUrl && (
                            <video
                                src={previewUrl}
                                controls
                                className="preview-video"
                            />
                        )}
                        <div className="file-info">
                            <p className="file-name">{selectedFile.name}</p>
                            <p className="file-size">
                                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </div>

                        {isUploading ? (
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <p className="progress-text">{uploadProgress}%</p>
                                <p className="processing-text">
                                    {uploadProgress < 100 ? 'Uploading...' : 'Processing video...'}
                                </p>
                            </div>
                        ) : (
                            <div className="button-group">
                                <button onClick={handleUpload} className="btn-gradient">
                                    Analyze Video
                                </button>
                                <button onClick={handleReset} className="btn-secondary">
                                    Choose Different Video
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {error && (
                    <div className="error-message">
                        <svg
                            className="error-icon"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
