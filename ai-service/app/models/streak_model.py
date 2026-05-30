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

class StreakModel:
    """ML model for predicting habit streak continuation"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'streak_model.pkl')
        self.scaler_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'streak_scaler.pkl')
        
        # Load or train model
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train with sample data"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print("Streak model loaded successfully")
            else:
                print("Training new streak model...")
                self._train_model()
        except Exception as e:
            print(f"Error loading model: {e}. Training new model...")
            self._train_model()
    
    def _train_model(self):
        """Train the streak model with sample data"""
        # Generate sample training data
        np.random.seed(42)
        n_samples = 800
        
        # Features: current_streak, completion_rate, habit_frequency, mood_avg, days_since_start, time_consistency
        current_streak = np.random.randint(0, 30, n_samples)
        completion_rate = np.random.uniform(0, 1, n_samples)
        habit_frequency = np.random.choice([1, 7, 30], n_samples)  # Daily=1, Weekly=7, Monthly=30
        mood_avg = np.random.uniform(1, 5, n_samples)
        days_since_start = np.random.randint(1, 365, n_samples)
        time_consistency = np.random.uniform(0, 1, n_samples)
        
        # Target: will_continue_streak (0=No, 1=Yes)
        # Higher probability of continuation with better metrics
        streak_probability = (
            (current_streak / 30) * 0.3 +
            completion_rate * 0.3 +
            (mood_avg / 5) * 0.2 +
            time_consistency * 0.2
        )
        will_continue_streak = (np.random.random(n_samples) < streak_probability).astype(int)
        
        # Create DataFrame
        data = pd.DataFrame({
            'current_streak': current_streak,
            'completion_rate': completion_rate,
            'habit_frequency': habit_frequency,
            'mood_avg': mood_avg,
            'days_since_start': days_since_start,
            'time_consistency': time_consistency,
            'will_continue_streak': will_continue_streak
        })
        
        # Prepare features and target
        X = data[['current_streak', 'completion_rate', 'habit_frequency', 'mood_avg', 'days_since_start', 'time_consistency']]
        y = data['will_continue_streak']
        
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
        print(f"Streak model trained with accuracy: {accuracy:.2f}")
        
        # Save model and scaler
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
    
    def predict(self, user_id: str, habit_id: str, historical_data: List[Dict]) -> Dict[str, Any]:
        """Predict streak continuation for a specific habit"""
        try:
            # Extract features from historical data
            features = self._extract_features(historical_data)
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get confidence
            confidence = max(probabilities)
            predicted_streak_days = self._predict_streak_length(features, prediction)
            
            # Generate insights
            risk_factors = self._analyze_risk_factors(features)
            suggestions = self._generate_suggestions(features, prediction, risk_factors)
            
            return {
                'predictedStreak': predicted_streak_days,
                'probability': round(confidence * 100, 2),
                'willContinue': bool(prediction),
                'riskFactors': risk_factors,
                'suggestions': suggestions,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in streak prediction: {e}")
            return {
                'predictedStreak': 7,
                'probability': 50.0,
                'willContinue': True,
                'riskFactors': ['Insufficient data'],
                'suggestions': ['Continue tracking for better predictions'],
                'timestamp': datetime.now().isoformat()
            }
    
    def _extract_features(self, historical_data: List[Dict]) -> List[float]:
        """Extract features from historical habit data"""
        if not historical_data:
            return [0, 0, 1, 3, 1, 0.5]  # Default values
        
        # Current streak
        current_streak = historical_data[-1].get('streak', 0)
        
        # Completion rate
        completed_days = sum(1 for day in historical_data if day.get('completed', False))
        completion_rate = completed_days / len(historical_data)
        
        # Habit frequency (convert to days)
        frequency_map = {'DAILY': 1, 'WEEKLY': 7, 'MONTHLY': 30}
        habit_frequency = frequency_map.get(historical_data[-1].get('frequency', 'DAILY'), 1)
        
        # Average mood
        mood_scores = []
        for day in historical_data:
            mood_type = day.get('mood', 'NEUTRAL')
            mood_score = self._mood_to_score(mood_type)
            mood_scores.append(mood_score)
        avg_mood = np.mean(mood_scores) if mood_scores else 3
        
        # Days since habit started
        if 'created_at' in historical_data[-1]:
            created_date = pd.to_datetime(historical_data[-1]['created_at'])
            days_since_start = (datetime.now() - created_date).days
        else:
            days_since_start = len(historical_data)
        
        # Time consistency (standard deviation of completion times)
        completion_hours = [day.get('completed_hour', 12) for day in historical_data if day.get('completed', False)]
        time_consistency = 1 - (np.std(completion_hours) / 24) if completion_hours else 0.5
        
        return [
            current_streak,
            completion_rate,
            habit_frequency,
            avg_mood,
            days_since_start,
            time_consistency
        ]
    
    def _mood_to_score(self, mood_type: str) -> int:
        """Convert mood type to numerical score"""
        mood_scores = {
            'HAPPY': 5,
            'MOTIVATED': 4,
            'NEUTRAL': 3,
            'STRESSED': 2,
            'SAD': 1
        }
        return mood_scores.get(mood_type.upper(), 3)
    
    def _predict_streak_length(self, features: List[float], will_continue: int) -> int:
        """Predict the length of streak if it continues"""
        current_streak, completion_rate, habit_frequency, avg_mood, days_since_start, time_consistency = features
        
        if not will_continue:
            return current_streak
        
        # Predict additional days based on features
        base_prediction = current_streak
        
        # Adjust based on completion rate
        if completion_rate > 0.8:
            base_prediction += 7
        elif completion_rate > 0.6:
            base_prediction += 3
        
        # Adjust based on mood
        if avg_mood > 4:
            base_prediction += 5
        elif avg_mood > 3:
            base_prediction += 2
        
        # Adjust based on time consistency
        if time_consistency > 0.8:
            base_prediction += 3
        
        return min(base_prediction, 30)  # Cap at 30 days
    
    def _analyze_risk_factors(self, features: List[float]) -> List[str]:
        """Analyze risk factors for streak continuation"""
        risk_factors = []
        
        current_streak, completion_rate, habit_frequency, avg_mood, days_since_start, time_consistency = features
        
        if completion_rate < 0.5:
            risk_factors.append("Low completion rate")
        if avg_mood < 3:
            risk_factors.append("Low mood scores")
        if time_consistency < 0.6:
            risk_factors.append("Inconsistent timing")
        if current_streak < 3:
            risk_factors.append("Short current streak")
        if days_since_start < 7:
            risk_factors.append("Habit is too new")
        
        return risk_factors
    
    def _generate_suggestions(self, features: List[float], prediction: int, risk_factors: List[str]) -> List[str]:
        """Generate suggestions based on analysis"""
        suggestions = []
        
        current_streak, completion_rate, habit_frequency, avg_mood, days_since_start, time_consistency = features
        
        if prediction == 1:  # Will continue
            suggestions.extend([
                "Maintain your current routine",
                "Set up reminders for consistency",
                "Track your mood alongside habits"
            ])
        else:  # Will not continue
            suggestions.extend([
                "Start with smaller, achievable goals",
                "Focus on rebuilding consistency",
                "Consider changing habit timing"
            ])
        
        # Address specific risk factors
        if "Low completion rate" in risk_factors:
            suggestions.append("Reduce habit difficulty temporarily")
        if "Low mood scores" in risk_factors:
            suggestions.append("Practice mood-boosting activities")
        if "Inconsistent timing" in risk_factors:
            suggestions.append("Set fixed times for habit completion")
        
        return suggestions[:4]  # Return top 4 suggestions
