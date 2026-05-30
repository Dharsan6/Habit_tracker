import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any

class ProductivityModel:
    """ML model for predicting user productivity scores"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'productivity_model.pkl')
        self.scaler_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'productivity_scaler.pkl')
        self.encoder_path = os.path.join(os.getenv('MODEL_PATH', 'models/'), 'productivity_encoder.pkl')
        
        # Load or train model
        self._load_or_train_model()
    
    def _load_or_train_model(self):
        """Load existing model or train with sample data"""
        try:
            if os.path.exists(self.model_path):
                self.model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                self.label_encoder = joblib.load(self.encoder_path)
                print("Productivity model loaded successfully")
            else:
                print("Training new productivity model...")
                self._train_model()
        except Exception as e:
            print(f"Error loading model: {e}. Training new model...")
            self._train_model()
    
    def _train_model(self):
        """Train the productivity model with sample data"""
        # Generate sample training data
        np.random.seed(42)
        n_samples = 1000
        
        # Features: habits_completed, streak_days, mood_score, consistency_rate, time_of_day
        habits_completed = np.random.randint(0, 10, n_samples)
        streak_days = np.random.randint(0, 30, n_samples)
        mood_score = np.random.randint(1, 6, n_samples)  # 1-5 scale
        consistency_rate = np.random.uniform(0, 1, n_samples)
        time_of_day = np.random.randint(0, 24, n_samples)
        
        # Target: productivity_score (0-100)
        productivity_score = (
            habits_completed * 8 +
            streak_days * 1.5 +
            mood_score * 10 +
            consistency_rate * 20 -
            abs(time_of_day - 12) * 0.5
        )
        productivity_score = np.clip(productivity_score, 0, 100)
        
        # Create DataFrame
        data = pd.DataFrame({
            'habits_completed': habits_completed,
            'streak_days': streak_days,
            'mood_score': mood_score,
            'consistency_rate': consistency_rate,
            'time_of_day': time_of_day,
            'productivity_score': productivity_score
        })
        
        # Prepare features and target
        X = data[['habits_completed', 'streak_days', 'mood_score', 'consistency_rate', 'time_of_day']]
        y = self._categorize_productivity(data['productivity_score'])
        
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
        print(f"Productivity model trained with accuracy: {accuracy:.2f}")
        
        # Save model and components
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)
        joblib.dump(self.label_encoder, self.encoder_path)
    
    def _categorize_productivity(self, scores):
        """Categorize productivity scores into levels"""
        categories = []
        for score in scores:
            if score < 40:
                categories.append('Low')
            elif score < 70:
                categories.append('Medium')
            else:
                categories.append('High')
        return self.label_encoder.fit_transform(categories)
    
    def predict(self, user_id: str, habit_data: List[Dict], mood_data: List[Dict]) -> Dict[str, Any]:
        """Predict productivity score for a user"""
        try:
            # Extract features from user data
            features = self._extract_features(habit_data, mood_data)
            
            # Scale features
            features_scaled = self.scaler.transform([features])
            
            # Predict
            prediction = self.model.predict(features_scaled)[0]
            probabilities = self.model.predict_proba(features_scaled)[0]
            
            # Get confidence
            confidence = max(probabilities)
            
            # Convert prediction back to score
            predicted_category = self.label_encoder.inverse_transform([prediction])[0]
            predicted_score = self._category_to_score(predicted_category)
            
            # Generate insights
            factors = self._analyze_factors(features)
            recommendations = self._generate_recommendations(features, predicted_category)
            
            return {
                'predictedScore': predicted_score,
                'confidence': round(confidence * 100, 2),
                'category': predicted_category,
                'factors': factors,
                'recommendations': recommendations,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Error in productivity prediction: {e}")
            return {
                'predictedScore': 50,
                'confidence': 0.5,
                'category': 'Medium',
                'factors': ['Insufficient data'],
                'recommendations': ['Continue tracking habits for better predictions'],
                'timestamp': datetime.now().isoformat()
            }
    
    def _extract_features(self, habit_data: List[Dict], mood_data: List[Dict]) -> List[float]:
        """Extract features from habit and mood data"""
        # Habit features
        total_habits = len(habit_data)
        completed_habits = sum(1 for h in habit_data if h.get('completed', False))
        avg_streak = np.mean([h.get('streak', 0) for h in habit_data]) if habit_data else 0
        max_streak = max([h.get('streak', 0) for h in habit_data]) if habit_data else 0
        
        # Mood features
        if mood_data:
            mood_scores = []
            for mood in mood_data:
                mood_type = mood.get('type', 'NEUTRAL')
                score = self._mood_to_score(mood_type)
                mood_scores.append(score)
            avg_mood = np.mean(mood_scores)
        else:
            avg_mood = 3  # Neutral
        
        # Consistency features
        consistency_rate = completed_habits / total_habits if total_habits > 0 else 0
        
        # Time features
        current_hour = datetime.now().hour
        
        return [
            completed_habits,
            avg_streak,
            avg_mood,
            consistency_rate,
            current_hour
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
    
    def _category_to_score(self, category: str) -> int:
        """Convert productivity category to numerical score"""
        category_scores = {
            'Low': 25,
            'Medium': 60,
            'High': 85
        }
        return category_scores.get(category, 50)
    
    def _analyze_factors(self, features: List[float]) -> List[str]:
        """Analyze factors affecting productivity"""
        factors = []
        
        completed_habits, avg_streak, avg_mood, consistency_rate, current_hour = features
        
        if completed_habits < 3:
            factors.append("Low habit completion rate")
        if avg_streak < 5:
            factors.append("Short average streak duration")
        if avg_mood < 3:
            factors.append("Lower mood scores")
        if consistency_rate < 0.7:
            factors.append("Inconsistent habit tracking")
        if 9 <= current_hour <= 17:  # Business hours
            factors.append("Peak productivity hours")
        
        return factors
    
    def _generate_recommendations(self, features: List[float], predicted_category: str) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []
        
        completed_habits, avg_streak, avg_mood, consistency_rate, current_hour = features
        
        if predicted_category == 'Low':
            recommendations.extend([
                "Start with smaller, achievable habits",
                "Focus on consistency over intensity",
                "Schedule habits during your most productive hours"
            ])
        elif predicted_category == 'Medium':
            recommendations.extend([
                "Increase habit frequency gradually",
                "Track mood patterns to optimize timing",
                "Set slightly more challenging goals"
            ])
        else:  # High
            recommendations.extend([
                "Maintain current habit streak",
                "Add new challenging habits",
                "Share your success to motivate others"
            ])
        
        if avg_mood < 3:
            recommendations.append("Consider stress management techniques")
        
        if consistency_rate < 0.8:
            recommendations.append("Set daily reminders for habits")
        
        return recommendations[:4]  # Return top 4 recommendations
