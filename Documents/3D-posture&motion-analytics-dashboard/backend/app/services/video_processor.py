import cv2
import numpy as np
from pathlib import Path
from typing import List
import subprocess
import tempfile
import shutil


class VideoProcessor:
    """
    Handles video frame extraction using OpenCV and FFmpeg
    """
    
    def __init__(self, target_fps: int = 15):
        """
        Initialize video processor
        
        Args:
            target_fps: Target frames per second for extraction (default: 15)
        """
        self.target_fps = target_fps
    
    def extract_frames(self, video_path: str) -> List[np.ndarray]:
        """
        Extract frames from video at specified FPS
        
        Args:
            video_path: Path to video file
        
        Returns:
            List of frames as numpy arrays (BGR format)
        """
        frames = []
        
        try:
            # Open video file
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                raise ValueError(f"Cannot open video file: {video_path}")
            
            # Get video properties
            original_fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            print(f"Video FPS: {original_fps}, Total frames: {total_frames}")
            
            # Calculate frame sampling interval
            frame_interval = max(1, int(original_fps / self.target_fps))
            
            frame_count = 0
            extracted_count = 0
            
            while True:
                ret, frame = cap.read()
                
                if not ret:
                    break
                
                # Sample frames at target FPS
                if frame_count % frame_interval == 0:
                    frames.append(frame)
                    extracted_count += 1
                
                frame_count += 1
            
            cap.release()
            
            print(f"Extracted {extracted_count} frames at ~{self.target_fps} FPS")
            
            return frames
        
        except Exception as e:
            raise RuntimeError(f"Frame extraction failed: {str(e)}")
    
    def validate_video(self, video_path: str) -> dict:
        """
        Validate video file and return metadata
        
        Args:
            video_path: Path to video file
        
        Returns:
            Dictionary with video metadata
        """
        try:
            cap = cv2.VideoCapture(video_path)
            
            if not cap.isOpened():
                return {"valid": False, "error": "Cannot open video"}
            
            metadata = {
                "valid": True,
                "fps": cap.get(cv2.CAP_PROP_FPS),
                "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
                "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
                "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
                "duration": cap.get(cv2.CAP_PROP_FRAME_COUNT) / cap.get(cv2.CAP_PROP_FPS)
            }
            
            cap.release()
            
            return metadata
        
        except Exception as e:
            return {"valid": False, "error": str(e)}
    
    def resize_frame(self, frame: np.ndarray, target_width: int = 640) -> np.ndarray:
        """
        Resize frame while maintaining aspect ratio
        
        Args:
            frame: Input frame
            target_width: Target width in pixels
        
        Returns:
            Resized frame
        """
        height, width = frame.shape[:2]
        aspect_ratio = height / width
        target_height = int(target_width * aspect_ratio)
        
        resized = cv2.resize(frame, (target_width, target_height))
        return resized
