import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

class BurnoutModel:
    """ML model for predicting burnout risk"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'burnout_model.pkl')
        self.scaler_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'burnout_scaler.pkl')
        
        # Load or train model
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train with sample data"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print("Burnout model loaded successfully")
            else:
                print("Training new burnout model...")
                self._train_model()
        except Exception as e:
            print(f"Error loading model: {e}. Training new model...")
            self._train_model()
    
    def _train_model(self):
        """Train the burnout model with sample data"""
        # Generate sample training data
        np.random.seed(42)
        n_samples = 600
        
        # Features: avg_completion, workload, stress_level, sleep_hours, mood_variance, streak_breaks
        avg_completion = np.random.uniform(0.3, 1.0, n_samples)
        workload = np.random.uniform(1, 10, n_samples)  # 1-10 scale
        stress_level = np.random.uniform(1, 10, n_samples)  # 1-10 scale
        sleep_hours = np.random.uniform(4, 9, n_samples)
        mood_variance = np.random.uniform(0, 4, n_samples)  # Mood inconsistency
        streak_breaks = np.random.randint(0, 20, n_samples)
        
        # Target: burnout_risk (0=Low, 1=Medium, 2=High)
        # Higher risk with lower completion, higher stress, less sleep, more variance
        risk_score = (
            (1 - avg_completion) * 0.3 +
            (workload / 10) * 0.2 +
            (stress_level / 10) * 0.25 +
            max(0, (6 - sleep_hours) / 6) * 0.15 +
            (mood_variance / 4) * 0.1
        )
        
        burnout_risk = []
        for score in risk_score:
            if score < 0.3:
                burnout_risk.append(0)  # Low
            elif score < 0.6:
                burnout_risk.append(1)  # Medium
            else:
                burnout_risk.append(2)  # High
        
        # Create DataFrame
        data = pd.DataFrame({
            'avg_completion': avg_completion,
            'workload': workload,
            'stress_level': stress_level,
            'sleep_hours': sleep_hours,
            'mood_variance': mood_variance,
            'streak_breaks': streak_breaks,
            'burnout_risk': burnout_risk
        })
        
        # Prepare features and target
        X = data[['avg_completion', 'workload', 'stress_level', 'sleep_hours', 'mood_variance', 'streak_breaks']]
        y = data['burnout_risk']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Train model
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.model.fit(X_train_scaled, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_scaled)
        accuracy = accuracy_score(y_test, y_pred)
        print(f"Burnout model trained with accuracy: {accuracy:.2f}")
        
        # Save model and scaler
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
    
    def analyze(self, user_id: str, habit_data: List[Dict], mood_data: List[Dict]) -> Dict[str, Any]:
        """Analyze burnout risk for a user"""
        try:
            # Extract features from user data
            features = self._extract_features(habit_data, mood_data)
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get confidence and risk level
            confidence = max(probabilities)
            risk_level = self._prediction_to_risk_level(prediction)
            risk_score = confidence * 100
            
            # Generate indicators
            indicators = self._analyze_indicators(features)
            recommendations = self._generate_recommendations(features, risk_level)
            
            return {
                'riskLevel': risk_level,
                'score': round(risk_score, 1),
                'confidence': round(confidence * 100, 2),
                'indicators': indicators,
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in burnout analysis: {e}")
            return {
                'riskLevel': 'MEDIUM',
                'score': 50.0,
                'confidence': 0.5,
                'indicators': ['Insufficient data for analysis'],
                'recommendations': ['Continue tracking habits and mood for better insights'],
                'timestamp': datetime.now().isoformat()
            }
    
    def _extract_features(self, habit_data: List[Dict], mood_data: List[Dict]) -> List[float]:
        """Extract features from habit and mood data"""
        # Habit features
        if habit_data:
            completion_rates = [h.get('completion_rate', 0) for h in habit_data]
            avg_completion = np.mean(completion_rates)
            streak_breaks = sum(1 for h in habit_data if h.get('streak_break', False))
            workload = len(habit_data)  # Number of active habits
        else:
            avg_completion = 0.5
            streak_breaks = 0
            workload = 0
        
        # Mood features
        if mood_data:
            mood_scores = []
            for mood in mood_data:
                mood_type = mood.get('type', 'NEUTRAL')
                score = self._mood_to_score(mood_type)
                mood_scores.append(score)
            
            stress_level = 10 - np.mean(mood_scores)  # Inverse relationship
            mood_variance = np.var(mood_scores) if len(mood_scores) > 1 else 0
        else:
            stress_level = 5
            mood_variance = 0
        
        # Sleep hours (estimated from patterns)
        # This would typically come from user input or wearable data
        # For now, we'll estimate based on completion patterns
        if habit_data:
            completion_times = [h.get('completion_hour', 12) for h in habit_data if h.get('completed', False)]
            if completion_times:
                avg_completion_hour = np.mean(completion_times)
                # Estimate sleep based on completion time (earlier = more sleep)
                if avg_completion_hour < 8:
                    sleep_hours = 7.5
                elif avg_completion_hour < 10:
                    sleep_hours = 7
                elif avg_completion_hour < 14:
                    sleep_hours = 6.5
                else:
                    sleep_hours = 6
            else:
                sleep_hours = 7
        else:
            sleep_hours = 7
        
        return [
            avg_completion,
            workload,
            stress_level,
            sleep_hours,
            mood_variance,
            streak_breaks
        ]
    
    def _mood_to_score(self, mood_type: str) -> int:
        """Convert mood type to numerical score"""
        mood_scores = {
            'HAPPY': 9,
            'MOTIVATED': 8,
            'NEUTRAL': 5,
            'STRESSED': 3,
            'SAD': 2
        }
        return mood_scores.get(mood_type.upper(), 5)
    
    def _prediction_to_risk_level(self, prediction: int) -> str:
        """Convert prediction to risk level"""
        risk_levels = {0: 'LOW', 1: 'MEDIUM', 2: 'HIGH'}
        return risk_levels.get(prediction, 'MEDIUM')
    
    def _analyze_indicators(self, features: List[float]) -> List[str]:
        """Analyze burnout indicators"""
        indicators = []
        
        avg_completion, workload, stress_level, sleep_hours, mood_variance, streak_breaks = features
        
        if avg_completion < 0.6:
            indicators.append("Low habit completion rate")
        if workload > 7:
            indicators.append("High habit workload")
        if stress_level > 7:
            indicators.append("High stress levels")
        if sleep_hours < 6:
            indicators.append("Insufficient sleep")
        if mood_variance > 2:
            indicators.append("High mood variability")
        if streak_breaks > 10:
            indicators.append("Frequent streak breaks")
        
        return indicators
    
    def _generate_recommendations(self, features: List[float], risk_level: str) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        avg_completion, workload, stress_level, sleep_hours, mood_variance, streak_breaks = features
        
        if risk_level == 'HIGH':
            recommendations.extend([
                "Consider reducing habit workload temporarily",
                "Practice stress management techniques",
                "Prioritize sleep and recovery",
                "Take regular breaks between habits",
                "Consider speaking with a mental health professional"
            ])
        elif risk_level == 'MEDIUM':
            recommendations.extend([
                "Focus on maintaining consistent routines",
                "Practice mindfulness or meditation",
                "Ensure adequate sleep (7-8 hours)",
                "Set realistic habit goals"
            ])
        else:  # LOW
            recommendations.extend([
                "Maintain current healthy habits",
                "Continue monitoring stress levels",
                "Keep up the good work with consistency"
            ])
        
        # Address specific indicators
        if avg_completion < 0.7:
            recommendations.append("Focus on quality over quantity of habits")
        if stress_level > 6:
            recommendations.append("Incorporate relaxation techniques")
        if sleep_hours < 7:
            recommendations.append("Establish a consistent sleep schedule")
        
        return recommendations[:5]  # Return top 5 recommendations
