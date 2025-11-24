import numpy as np
from typing import List, Dict, Any, Tuple
from sklearn.ensemble import IsolationForest


class AnalyticsEngine:
    """
    Comprehensive analytics engine for pose and motion analysis
    Computes joint angles, posture scores, symmetry, and motion metrics
    """
    
    def __init__(self):
        """Initialize the analytics engine"""
        pass
    
    def compute_analytics(self, pose_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute all analytics metrics
        
        Args:
            pose_data: List of 3D pose data
        
        Returns:
            Dictionary containing all analytics
        """
        analytics = {
            "joint_angles": self.compute_joint_angles(pose_data),
            "posture_metrics": self.compute_posture_metrics(pose_data),
            "motion_metrics": self.compute_motion_metrics(pose_data),
            "symmetry_score": self.compute_symmetry_score(pose_data),
            "anomalies": self.detect_anomalies(pose_data),
            "summary": {}
        }
        
        # Generate summary insights
        analytics["summary"] = self.generate_summary(analytics)
        
        return analytics
    
    def compute_joint_angles(self, pose_data: List[Dict[str, Any]]) -> Dict[str, List[float]]:
        """
        Compute joint angles over time
        
        Returns angles for:
        - Left/Right Shoulder
        - Left/Right Elbow
        - Left/Right Hip
        - Left/Right Knee
        """
        angles = {
            "left_shoulder": [],
            "right_shoulder": [],
            "left_elbow": [],
            "right_elbow": [],
            "left_hip": [],
            "right_hip": [],
            "left_knee": [],
            "right_knee": []
        }
        
        for frame_data in pose_data:
            if not frame_data["pose_detected"] or not frame_data["landmarks"]:
                # Append None for missing frames
                for key in angles:
                    angles[key].append(None)
                continue
            
            landmarks = {lm["id"]: lm for lm in frame_data["landmarks"]}
            
            # Left shoulder angle (shoulder-elbow-wrist)
            if all(k in landmarks for k in [11, 13, 15]):
                angles["left_shoulder"].append(
                    self.calculate_angle(landmarks[11], landmarks[13], landmarks[15])
                )
            else:
                angles["left_shoulder"].append(None)
            
            # Right shoulder angle
            if all(k in landmarks for k in [12, 14, 16]):
                angles["right_shoulder"].append(
                    self.calculate_angle(landmarks[12], landmarks[14], landmarks[16])
                )
            else:
                angles["right_shoulder"].append(None)
            
            # Left elbow angle
            if all(k in landmarks for k in [11, 13, 15]):
                angles["left_elbow"].append(
                    self.calculate_angle(landmarks[11], landmarks[13], landmarks[15])
                )
            else:
                angles["left_elbow"].append(None)
            
            # Right elbow angle
            if all(k in landmarks for k in [12, 14, 16]):
                angles["right_elbow"].append(
                    self.calculate_angle(landmarks[12], landmarks[14], landmarks[16])
                )
            else:
                angles["right_elbow"].append(None)
            
            # Left hip angle (shoulder-hip-knee)
            if all(k in landmarks for k in [11, 23, 25]):
                angles["left_hip"].append(
                    self.calculate_angle(landmarks[11], landmarks[23], landmarks[25])
                )
            else:
                angles["left_hip"].append(None)
            
            # Right hip angle
            if all(k in landmarks for k in [12, 24, 26]):
                angles["right_hip"].append(
                    self.calculate_angle(landmarks[12], landmarks[24], landmarks[26])
                )
            else:
                angles["right_hip"].append(None)
            
            # Left knee angle (hip-knee-ankle)
            if all(k in landmarks for k in [23, 25, 27]):
                angles["left_knee"].append(
                    self.calculate_angle(landmarks[23], landmarks[25], landmarks[27])
                )
            else:
                angles["left_knee"].append(None)
            
            # Right knee angle
            if all(k in landmarks for k in [24, 26, 28]):
                angles["right_knee"].append(
                    self.calculate_angle(landmarks[24], landmarks[26], landmarks[28])
                )
            else:
                angles["right_knee"].append(None)
        
        return angles
    
    def calculate_angle(self, point1: Dict, point2: Dict, point3: Dict) -> float:
        """
        Calculate angle between three points (in degrees)
        
        Args:
            point1: First point (x, y, z)
            point2: Vertex point (x, y, z)
            point3: Third point (x, y, z)
        
        Returns:
            Angle in degrees
        """
        # Create vectors
        v1 = np.array([point1["x"] - point2["x"], 
                       point1["y"] - point2["y"], 
                       point1["z"] - point2["z"]])
        v2 = np.array([point3["x"] - point2["x"], 
                       point3["y"] - point2["y"], 
                       point3["z"] - point2["z"]])
        
        # Calculate angle using dot product
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2) + 1e-6)
        cos_angle = np.clip(cos_angle, -1.0, 1.0)
        angle = np.arccos(cos_angle)
        
        return float(np.degrees(angle))
    
    def compute_posture_metrics(self, pose_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute posture quality metrics
        
        Returns:
        - Spine alignment score (0-100)
        - Head tilt angle
        - Shoulder balance score
        """
        spine_scores = []
        head_tilts = []
        shoulder_balances = []
        
        for frame_data in pose_data:
            if not frame_data["pose_detected"] or not frame_data["landmarks"]:
                continue
            
            landmarks = {lm["id"]: lm for lm in frame_data["landmarks"]}
            
            # Spine alignment (nose, shoulders, hips)
            if all(k in landmarks for k in [0, 11, 12, 23, 24]):
                nose = landmarks[0]
                left_shoulder = landmarks[11]
                right_shoulder = landmarks[12]
                left_hip = landmarks[23]
                right_hip = landmarks[24]
                
                # Calculate spine straightness
                shoulder_center_y = (left_shoulder["y"] + right_shoulder["y"]) / 2
                hip_center_y = (left_hip["y"] + right_hip["y"]) / 2
                nose_y = nose["y"]
                
                # Ideal: nose, shoulder center, and hip center should be vertically aligned
                spine_deviation = abs(nose["x"] - (left_shoulder["x"] + right_shoulder["x"]) / 2)
                spine_score = max(0, 100 - spine_deviation * 10)
                spine_scores.append(spine_score)
                
                # Head tilt
                head_tilt = np.arctan2(nose["y"] - shoulder_center_y, nose["x"] - (left_shoulder["x"] + right_shoulder["x"]) / 2)
                head_tilts.append(np.degrees(head_tilt))
                
                # Shoulder balance
                shoulder_diff = abs(left_shoulder["y"] - right_shoulder["y"])
                shoulder_balance = max(0, 100 - shoulder_diff * 20)
                shoulder_balances.append(shoulder_balance)
        
        return {
            "spine_alignment_score": float(np.mean(spine_scores)) if spine_scores else 0,
            "average_head_tilt": float(np.mean(head_tilts)) if head_tilts else 0,
            "shoulder_balance_score": float(np.mean(shoulder_balances)) if shoulder_balances else 0,
            "overall_posture_score": float(np.mean([
                np.mean(spine_scores) if spine_scores else 0,
                np.mean(shoulder_balances) if shoulder_balances else 0
            ]))
        }
    
    def compute_motion_metrics(self, pose_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute motion-related metrics
        
        Returns:
        - Velocity per joint
        - Acceleration spikes
        - Range of motion
        """
        velocities = {i: [] for i in range(33)}  # 33 landmarks
        
        for i in range(len(pose_data) - 1):
            if not pose_data[i]["pose_detected"] or not pose_data[i + 1]["pose_detected"]:
                continue
            
            landmarks_curr = {lm["id"]: lm for lm in pose_data[i]["landmarks"]}
            landmarks_next = {lm["id"]: lm for lm in pose_data[i + 1]["landmarks"]}
            
            for lm_id in range(33):
                if lm_id in landmarks_curr and lm_id in landmarks_next:
                    # Calculate Euclidean distance
                    dx = landmarks_next[lm_id]["x"] - landmarks_curr[lm_id]["x"]
                    dy = landmarks_next[lm_id]["y"] - landmarks_curr[lm_id]["y"]
                    dz = landmarks_next[lm_id]["z"] - landmarks_curr[lm_id]["z"]
                    
                    velocity = np.sqrt(dx**2 + dy**2 + dz**2)
                    velocities[lm_id].append(velocity)
        
        # Calculate average velocity per landmark
        avg_velocities = {
            lm_id: float(np.mean(vels)) if vels else 0
            for lm_id, vels in velocities.items()
        }
        
        # Range of motion (max - min position for each joint)
        rom = self.calculate_range_of_motion(pose_data)
        
        return {
            "average_velocities": avg_velocities,
            "max_velocity": float(max(avg_velocities.values())) if avg_velocities else 0,
            "range_of_motion": rom
        }
    
    def calculate_range_of_motion(self, pose_data: List[Dict[str, Any]]) -> Dict[str, float]:
        """Calculate range of motion for each landmark"""
        positions = {i: {"x": [], "y": [], "z": []} for i in range(33)}
        
        for frame_data in pose_data:
            if not frame_data["pose_detected"]:
                continue
            
            for landmark in frame_data["landmarks"]:
                lm_id = landmark["id"]
                positions[lm_id]["x"].append(landmark["x"])
                positions[lm_id]["y"].append(landmark["y"])
                positions[lm_id]["z"].append(landmark["z"])
        
        rom = {}
        for lm_id, coords in positions.items():
            if coords["x"]:
                range_x = max(coords["x"]) - min(coords["x"])
                range_y = max(coords["y"]) - min(coords["y"])
                range_z = max(coords["z"]) - min(coords["z"])
                rom[lm_id] = float(np.sqrt(range_x**2 + range_y**2 + range_z**2))
            else:
                rom[lm_id] = 0.0
        
        return rom
    
    def compute_symmetry_score(self, pose_data: List[Dict[str, Any]]) -> float:
        """
        Compute left-right symmetry score (0-100)
        Higher score = more symmetric movement
        """
        symmetry_scores = []
        
        # Pairs of symmetric landmarks (left, right)
        symmetric_pairs = [
            (11, 12),  # Shoulders
            (13, 14),  # Elbows
            (15, 16),  # Wrists
            (23, 24),  # Hips
            (25, 26),  # Knees
            (27, 28),  # Ankles
        ]
        
        for frame_data in pose_data:
            if not frame_data["pose_detected"]:
                continue
            
            landmarks = {lm["id"]: lm for lm in frame_data["landmarks"]}
            
            frame_symmetry = []
            for left_id, right_id in symmetric_pairs:
                if left_id in landmarks and right_id in landmarks:
                    left = landmarks[left_id]
                    right = landmarks[right_id]
                    
                    # Compare Y positions (height)
                    diff = abs(left["y"] - right["y"])
                    symmetry = max(0, 100 - diff * 10)
                    frame_symmetry.append(symmetry)
            
            if frame_symmetry:
                symmetry_scores.append(np.mean(frame_symmetry))
        
        return float(np.mean(symmetry_scores)) if symmetry_scores else 0.0
    
    def detect_anomalies(self, pose_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Detect anomalous movements (jerky motions, sudden spikes)
        """
        velocities = []
        
        for i in range(len(pose_data) - 1):
            if not pose_data[i]["pose_detected"] or not pose_data[i + 1]["pose_detected"]:
                continue
            
            landmarks_curr = {lm["id"]: lm for lm in pose_data[i]["landmarks"]}
            landmarks_next = {lm["id"]: lm for lm in pose_data[i + 1]["landmarks"]}
            
            total_velocity = 0
            for lm_id in range(33):
                if lm_id in landmarks_curr and lm_id in landmarks_next:
                    dx = landmarks_next[lm_id]["x"] - landmarks_curr[lm_id]["x"]
                    dy = landmarks_next[lm_id]["y"] - landmarks_curr[lm_id]["y"]
                    dz = landmarks_next[lm_id]["z"] - landmarks_curr[lm_id]["z"]
                    total_velocity += np.sqrt(dx**2 + dy**2 + dz**2)
            
            velocities.append(total_velocity)
        
        if len(velocities) < 10:
            return {"anomaly_frames": [], "anomaly_count": 0}
        
        # Use z-score method for anomaly detection
        velocities = np.array(velocities).reshape(-1, 1)
        mean_vel = np.mean(velocities)
        std_vel = np.std(velocities)
        
        anomaly_frames = []
        for i, vel in enumerate(velocities):
            z_score = abs((vel[0] - mean_vel) / (std_vel + 1e-6))
            if z_score > 2.5:  # More than 2.5 standard deviations
                anomaly_frames.append(i)
        
        return {
            "anomaly_frames": anomaly_frames,
            "anomaly_count": len(anomaly_frames)
        }
    
    def generate_summary(self, analytics: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary insights and recommendations"""
        insights = []
        recommendations = []
        
        # Posture insights
        posture_score = analytics["posture_metrics"]["overall_posture_score"]
        if posture_score < 50:
            insights.append("Poor posture detected")
            recommendations.append("Focus on spine alignment and shoulder balance")
        elif posture_score < 75:
            insights.append("Moderate posture quality")
            recommendations.append("Minor posture adjustments recommended")
        else:
            insights.append("Excellent posture")
        
        # Symmetry insights
        symmetry = analytics["symmetry_score"]
        if symmetry < 60:
            insights.append(f"Significant asymmetry detected ({symmetry:.1f}/100)")
            recommendations.append("Check for left-right imbalances in movement")
        elif symmetry < 80:
            insights.append(f"Slight asymmetry ({symmetry:.1f}/100)")
        else:
            insights.append(f"Well-balanced movement ({symmetry:.1f}/100)")
        
        # Anomaly insights
        anomaly_count = analytics["anomalies"]["anomaly_count"]
        if anomaly_count > 0:
            insights.append(f"{anomaly_count} jerky movements detected")
            recommendations.append("Work on smoother, more controlled movements")
        
        return {
            "insights": insights,
            "recommendations": recommendations,
            "overall_score": float((posture_score + symmetry) / 2)
        }
