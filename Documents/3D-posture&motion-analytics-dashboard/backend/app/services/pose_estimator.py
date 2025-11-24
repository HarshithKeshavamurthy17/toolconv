import mediapipe as mp
import cv2
import numpy as np
from typing import List, Dict, Any


class PoseEstimator:
    """
    Handles pose estimation using MediaPipe Pose
    Extracts 33 body landmarks from each frame
    """
    
    def __init__(self, min_detection_confidence: float = 0.5, min_tracking_confidence: float = 0.5):
        """
        Initialize MediaPipe Pose estimator
        
        Args:
            min_detection_confidence: Minimum confidence for detection (0.0 - 1.0)
            min_tracking_confidence: Minimum confidence for tracking (0.0 - 1.0)
        """
        self.mp_pose = mp.solutions.pose
        self.mp_drawing = mp.solutions.drawing_utils
        
        self.pose = self.mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,  # 0, 1, or 2 (2 is most accurate but slowest)
            min_detection_confidence=min_detection_confidence,
            min_tracking_confidence=min_tracking_confidence
        )
    
    def process_frames(self, frames: List[np.ndarray]) -> List[Dict[str, Any]]:
        """
        Process video frames and extract pose landmarks
        
        Args:
            frames: List of video frames (BGR format)
        
        Returns:
            List of dictionaries containing pose data for each frame
        """
        all_pose_data = []
        
        for frame_idx, frame in enumerate(frames):
            # Convert BGR to RGB (MediaPipe uses RGB)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            # Process frame
            results = self.pose.process(rgb_frame)
            
            frame_data = {
                "frame_index": frame_idx,
                "landmarks": [],
                "pose_detected": False
            }
            
            if results.pose_landmarks:
                frame_data["pose_detected"] = True
                
                # Extract landmark data
                for idx, landmark in enumerate(results.pose_landmarks.landmark):
                    frame_data["landmarks"].append({
                        "id": idx,
                        "x": landmark.x,  # Normalized [0, 1]
                        "y": landmark.y,  # Normalized [0, 1]
                        "z": landmark.z,  # Depth (relative to hips)
                        "visibility": landmark.visibility  # Confidence [0, 1]
                    })
            
            all_pose_data.append(frame_data)
        
        return all_pose_data
    
    def get_landmark_names(self) -> List[str]:
        """
        Get list of all MediaPipe landmark names
        
        Returns:
            List of 33 landmark names
        """
        return [
            "NOSE", "LEFT_EYE_INNER", "LEFT_EYE", "LEFT_EYE_OUTER",
            "RIGHT_EYE_INNER", "RIGHT_EYE", "RIGHT_EYE_OUTER",
            "LEFT_EAR", "RIGHT_EAR", "MOUTH_LEFT", "MOUTH_RIGHT",
            "LEFT_SHOULDER", "RIGHT_SHOULDER",
            "LEFT_ELBOW", "RIGHT_ELBOW",
            "LEFT_WRIST", "RIGHT_WRIST",
            "LEFT_PINKY", "RIGHT_PINKY",
            "LEFT_INDEX", "RIGHT_INDEX",
            "LEFT_THUMB", "RIGHT_THUMB",
            "LEFT_HIP", "RIGHT_HIP",
            "LEFT_KNEE", "RIGHT_KNEE",
            "LEFT_ANKLE", "RIGHT_ANKLE",
            "LEFT_HEEL", "RIGHT_HEEL",
            "LEFT_FOOT_INDEX", "RIGHT_FOOT_INDEX"
        ]
    
    def filter_low_confidence(self, pose_data: List[Dict], min_visibility: float = 0.5) -> List[Dict]:
        """
        Filter out landmarks with low confidence
        
        Args:
            pose_data: List of pose data dictionaries
            min_visibility: Minimum visibility threshold
        
        Returns:
            Filtered pose data
        """
        filtered_data = []
        
        for frame_data in pose_data:
            filtered_landmarks = []
            
            for landmark in frame_data.get("landmarks", []):
                if landmark["visibility"] >= min_visibility:
                    filtered_landmarks.append(landmark)
                else:
                    # Keep structure but mark as invalid
                    filtered_landmarks.append({
                        **landmark,
                        "valid": False
                    })
            
            filtered_data.append({
                **frame_data,
                "landmarks": filtered_landmarks
            })
        
        return filtered_data
    
    def close(self):
        """Clean up MediaPipe resources"""
        self.pose.close()
