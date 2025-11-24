import numpy as np
from typing import List, Dict, Any
from scipy.signal import savgol_filter


class PoseReconstructor:
    """
    Reconstructs 3D poses from 2D landmarks and applies smoothing
    """
    
    def __init__(self):
        """Initialize the pose reconstructor"""
        self.scale_factor = 100  # Scale factor for better visualization
    
    def reconstruct_3d(self, pose_data_2d: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Convert 2D pose landmarks to 3D coordinates
        
        Args:
            pose_data_2d: List of 2D pose data from MediaPipe
        
        Returns:
            List of 3D pose data with smoothed coordinates
        """
        # First, convert all frames to 3D
        pose_data_3d = []
        
        for frame_data in pose_data_2d:
            frame_3d = {
                "frame_index": frame_data["frame_index"],
                "pose_detected": frame_data["pose_detected"],
                "landmarks": []
            }
            
            if frame_data["pose_detected"] and frame_data["landmarks"]:
                for landmark in frame_data["landmarks"]:
                    # MediaPipe already provides Z coordinate (depth)
                    # Scale coordinates for better visualization
                    frame_3d["landmarks"].append({
                        "id": landmark["id"],
                        "x": landmark["x"] * self.scale_factor,
                        "y": landmark["y"] * self.scale_factor,
                        "z": landmark["z"] * self.scale_factor,
                        "visibility": landmark["visibility"]
                    })
            
            pose_data_3d.append(frame_3d)
        
        # Apply temporal smoothing
        smoothed_data = self.apply_temporal_smoothing(pose_data_3d)
        
        return smoothed_data
    
    def apply_temporal_smoothing(self, pose_data: List[Dict[str, Any]], window_length: int = 5) -> List[Dict[str, Any]]:
        """
        Apply Savitzky-Golay filter for temporal smoothing
        
        Args:
            pose_data: List of 3D pose data
            window_length: Window length for smoothing (must be odd)
        
        Returns:
            Smoothed pose data
        """
        if len(pose_data) < window_length:
            # Not enough frames for smoothing, return as is
            return pose_data
        
        # Ensure window_length is odd
        if window_length % 2 == 0:
            window_length += 1
        
        num_landmarks = 33  # MediaPipe has 33 landmarks
        
        # Extract coordinates into separate arrays for smoothing
        x_coords = np.zeros((len(pose_data), num_landmarks))
        y_coords = np.zeros((len(pose_data), num_landmarks))
        z_coords = np.zeros((len(pose_data), num_landmarks))
        visibility = np.zeros((len(pose_data), num_landmarks))
        
        for frame_idx, frame_data in enumerate(pose_data):
            if frame_data["pose_detected"] and frame_data["landmarks"]:
                for landmark in frame_data["landmarks"]:
                    lm_id = landmark["id"]
                    x_coords[frame_idx, lm_id] = landmark["x"]
                    y_coords[frame_idx, lm_id] = landmark["y"]
                    z_coords[frame_idx, lm_id] = landmark["z"]
                    visibility[frame_idx, lm_id] = landmark["visibility"]
        
        # Apply Savitzky-Golay filter to each landmark's trajectory
        smoothed_x = np.zeros_like(x_coords)
        smoothed_y = np.zeros_like(y_coords)
        smoothed_z = np.zeros_like(z_coords)
        
        for lm_id in range(num_landmarks):
            try:
                smoothed_x[:, lm_id] = savgol_filter(x_coords[:, lm_id], window_length, 3)
                smoothed_y[:, lm_id] = savgol_filter(y_coords[:, lm_id], window_length, 3)
                smoothed_z[:, lm_id] = savgol_filter(z_coords[:, lm_id], window_length, 3)
            except Exception:
                # If smoothing fails, use original data
                smoothed_x[:, lm_id] = x_coords[:, lm_id]
                smoothed_y[:, lm_id] = y_coords[:, lm_id]
                smoothed_z[:, lm_id] = z_coords[:, lm_id]
        
        # Reconstruct smoothed pose data
        smoothed_data = []
        
        for frame_idx, frame_data in enumerate(pose_data):
            smoothed_frame = {
                "frame_index": frame_data["frame_index"],
                "pose_detected": frame_data["pose_detected"],
                "landmarks": []
            }
            
            if frame_data["pose_detected"] and frame_data["landmarks"]:
                for lm_id in range(num_landmarks):
                    smoothed_frame["landmarks"].append({
                        "id": lm_id,
                        "x": float(smoothed_x[frame_idx, lm_id]),
                        "y": float(smoothed_y[frame_idx, lm_id]),
                        "z": float(smoothed_z[frame_idx, lm_id]),
                        "visibility": float(visibility[frame_idx, lm_id])
                    })
            
            smoothed_data.append(smoothed_frame)
        
        return smoothed_data
    
    def normalize_pose(self, pose_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Normalize pose coordinates relative to hip center
        
        Args:
            pose_data: List of 3D pose data
        
        Returns:
            Normalized pose data
        """
        normalized_data = []
        
        for frame_data in pose_data:
            if not frame_data["pose_detected"] or not frame_data["landmarks"]:
                normalized_data.append(frame_data)
                continue
            
            landmarks = frame_data["landmarks"]
            
            # Get hip center (average of left and right hip)
            left_hip = landmarks[23]  # LEFT_HIP
            right_hip = landmarks[24]  # RIGHT_HIP
            
            hip_center_x = (left_hip["x"] + right_hip["x"]) / 2
            hip_center_y = (left_hip["y"] + right_hip["y"]) / 2
            hip_center_z = (left_hip["z"] + right_hip["z"]) / 2
            
            # Normalize all landmarks relative to hip center
            normalized_landmarks = []
            for landmark in landmarks:
                normalized_landmarks.append({
                    "id": landmark["id"],
                    "x": landmark["x"] - hip_center_x,
                    "y": landmark["y"] - hip_center_y,
                    "z": landmark["z"] - hip_center_z,
                    "visibility": landmark["visibility"]
                })
            
            normalized_data.append({
                **frame_data,
                "landmarks": normalized_landmarks
            })
        
        return normalized_data
