import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any

class AnalyticsService:
    """Service for generating analytics and insights"""
    
    def __init__(self):
        pass
    
    def weekly_analysis(self, user_id: str, start_date: str = None, end_date: str = None) -> Dict[str, Any]:
        """Generate weekly performance analysis"""
        try:
            # Default to last 7 days if no dates provided
            if not end_date:
                end_date = datetime.now()
            else:
                end_date = pd.to_datetime(end_date)
            
            if not start_date:
                start_date = end_date - timedelta(days=7)
            else:
                start_date = pd.to_datetime(start_date)
            
            # This would typically fetch from database
            # For now, we'll generate sample insights
            analysis = {
                'period': {
                    'startDate': start_date.isoformat(),
                    'endDate': end_date.isoformat(),
                    'days': (end_date - start_date).days
                },
                'summary': {
                    'totalHabits': np.random.randint(5, 12),
                    'completedHabits': np.random.randint(20, 50),
                    'completionRate': round(np.random.uniform(65, 95), 1),
                    'averageStreak': round(np.random.uniform(5, 15), 1),
                    'longestStreak': np.random.randint(10, 25)
                },
                'dailyBreakdown': self._generate_daily_breakdown(start_date, end_date),
                'habitPerformance': self._generate_habit_performance(),
                'moodTrends': self._generate_mood_trends(start_date, end_date),
                'insights': self._generate_weekly_insights()
            }
            
            return analysis
            
        except Exception as e:
            print(f"Error in weekly analysis: {e}")
            return {'error': 'Analysis failed'}
    
    def generate_recommendations(self, user_id: str, habit_data: List[Dict], mood_data: List[Dict]) -> List[str]:
        """Generate AI-driven recommendations"""
        recommendations = []
        
        # Analyze habit patterns
        if habit_data:
            completion_rates = [h.get('completion_rate', 0) for h in habit_data]
            avg_completion = np.mean(completion_rates)
            
            if avg_completion < 0.6:
                recommendations.append("Focus on consistency over intensity - try reducing habit difficulty")
            elif avg_completion > 0.9:
                recommendations.append("Excellent consistency! Consider adding new challenging habits")
            
            # Check for time patterns
            completion_hours = [h.get('completion_hour', 12) for h in habit_data if h.get('completed')]
            if completion_hours:
                peak_hour = np.bincount(completion_hours).argmax()
                if 6 <= peak_hour <= 10:
                    recommendations.append("You're most productive in the morning - schedule important habits then")
                elif 18 <= peak_hour <= 22:
                    recommendations.append("Evening productivity is strong - consider evening habit sessions")
        
        # Analyze mood patterns
        if mood_data:
            mood_scores = []
            for mood in mood_data[-7:]:  # Last 7 days
                mood_type = mood.get('type', 'NEUTRAL')
                score = self._mood_to_score(mood_type)
                mood_scores.append(score)
            
            avg_mood = np.mean(mood_scores) if mood_scores else 3
            
            if avg_mood < 3:
                recommendations.append("Lower mood detected - consider stress management techniques")
            elif avg_mood > 4:
                recommendations.append("Great mood energy! Use this motivation for challenging habits")
        
        # General recommendations based on patterns
        recommendations.extend([
            "Try habit stacking - link new habits to existing ones",
            "Set up environment cues to trigger habit completion",
            "Use the 2-minute rule for difficult habits",
            "Track progress visually to maintain motivation"
        ])
        
        return recommendations[:6]  # Return top 6 recommendations
    
    def analyze_behavioral_patterns(self, user_id: str, habit_data: List[Dict], mood_data: List[Dict]) -> Dict[str, Any]:
        """Analyze behavioral patterns and insights"""
        patterns = {
            'timePatterns': self._analyze_time_patterns(habit_data),
            'consistencyAnalysis': self._analyze_consistency(habit_data),
            'moodCorrelation': self._analyze_mood_correlation(habit_data, mood_data),
            'habitInteractions': self._analyze_habit_interactions(habit_data),
            'weeklyPatterns': self._analyze_weekly_patterns(habit_data),
            'insights': []
        }
        
        # Generate insights based on patterns
        insights = []
        
        if patterns['timePatterns']['peakProductivityHour']:
            insights.append({
                'type': 'time_optimization',
                'message': f"Peak productivity at {patterns['timePatterns']['peakProductivityHour']}:00",
                'action': 'Schedule challenging habits during this time'
            })
        
        if patterns['consistencyAnalysis']['overallConsistency'] > 0.8:
            insights.append({
                'type': 'strength',
                'message': 'Excellent habit consistency maintained',
                'action': 'Consider adding new habits'
            })
        
        if patterns['moodCorrelation']['correlation'] > 0.5:
            insights.append({
                'type': 'mood_habit_link',
                'message': 'Strong correlation between mood and habit completion',
                'action': 'Focus on mood management to improve habit success'
            })
        
        patterns['insights'] = insights
        
        return patterns
    
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
    
    def _generate_daily_breakdown(self, start_date: datetime, end_date: datetime) -> List[Dict]:
        """Generate daily breakdown for the period"""
        daily_data = []
        current_date = start_date
        
        while current_date <= end_date:
            # Generate sample daily data
            completed = np.random.choice([True, False], p=[0.7, 0.3])
            habits_completed = np.random.randint(2, 8) if completed else np.random.randint(0, 3)
            
            daily_data.append({
                'date': current_date.strftime('%Y-%m-%d'),
                'completed': completed,
                'habitsCompleted': habits_completed,
                'totalHabits': np.random.randint(5, 10),
                'mood': np.random.choice(['HAPPY', 'NEUTRAL', 'MOTIVATED', 'STRESSED', 'SAD']),
                'productivityScore': round(np.random.uniform(60, 95), 1)
            })
            
            current_date += timedelta(days=1)
        
        return daily_data
    
    def _generate_habit_performance(self) -> List[Dict]:
        """Generate sample habit performance data"""
        habits = [
            'Morning Exercise', 'Reading', 'Meditation', 'Journaling',
            'Water Intake', 'Sleep Schedule', 'Learning', 'Social Connection'
        ]
        
        performance = []
        for habit in habits:
            performance.append({
                'name': habit,
                'completionRate': round(np.random.uniform(60, 95), 1),
                'currentStreak': np.random.randint(0, 20),
                'longestStreak': np.random.randint(10, 30),
                'category': np.random.choice(['Health', 'Learning', 'Mental Health', 'Productivity'])
            })
        
        return performance
    
    def _generate_mood_trends(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """Generate sample mood trend data"""
        mood_types = ['HAPPY', 'NEUTRAL', 'MOTIVATED', 'STRESSED', 'SAD']
        mood_counts = {mood: np.random.randint(0, 5) for mood in mood_types}
        
        total_moods = sum(mood_counts.values())
        mood_distribution = {
            mood: {
                'count': count,
                'percentage': round((count / total_moods) * 100, 1) if total_moods > 0 else 0
            }
            for mood, count in mood_counts.items()
        }
        
        return {
            'distribution': mood_distribution,
            'trend': 'improving' if np.random.random() > 0.5 else 'stable',
            'averageScore': round(np.random.uniform(3.2, 4.5), 1)
        }
    
    def _generate_weekly_insights(self) -> List[str]:
        """Generate weekly insights"""
        insights = [
            "Your consistency improved by 15% this week",
            "Morning habits show 25% higher completion rate",
            "Mood positively correlates with habit completion",
            "Weekend performance could use improvement",
            "Consider adding a recovery day to prevent burnout"
        ]
        
        return np.random.choice(insights, size=3, replace=False).tolist()
    
    def _analyze_time_patterns(self, habit_data: List[Dict]) -> Dict[str, Any]:
        """Analyze time-based patterns"""
        if not habit_data:
            return {'peakProductivityHour': None, 'consistency': 0}
        
        completion_hours = [h.get('completion_hour', 12) for h in habit_data if h.get('completed')]
        
        if completion_hours:
            hour_counts = np.bincount(completion_hours, minlength=24)
            peak_hour = np.argmax(hour_counts)
            consistency = len(set(completion_hours)) / min(24, len(completion_hours))
        else:
            peak_hour = None
            consistency = 0
        
        return {
            'peakProductivityHour': peak_hour,
            'mostActiveHours': [int(h) for h in np.argsort(hour_counts)[-3:]] if completion_hours else [],
            'consistency': round(consistency, 2)
        }
    
    def _analyze_consistency(self, habit_data: List[Dict]) -> Dict[str, Any]:
        """Analyze habit consistency patterns"""
        if not habit_data:
            return {'overallConsistency': 0, 'bestDay': None, 'worstDay': None}
        
        # Group by day of week
        day_completion = {}
        for habit in habit_data:
            date_str = habit.get('date', '')
            if date_str:
                date = pd.to_datetime(date_str)
                day_name = date.strftime('%A')
                
                if day_name not in day_completion:
                    day_completion[day_name] = []
                day_completion[day_name].append(habit.get('completed', False))
        
        # Calculate consistency for each day
        day_consistency = {}
        for day, completions in day_completion.items():
            if completions:
                day_consistency[day] = sum(completions) / len(completions)
        
        overall_consistency = np.mean(list(day_consistency.values())) if day_consistency else 0
        
        return {
            'overallConsistency': round(overall_consistency, 2),
            'bestDay': max(day_consistency, key=day_consistency.get) if day_consistency else None,
            'worstDay': min(day_consistency, key=day_consistency.get) if day_consistency else None,
            'dailyBreakdown': day_consistency
        }
    
    def _analyze_mood_correlation(self, habit_data: List[Dict], mood_data: List[Dict]) -> Dict[str, Any]:
        """Analyze correlation between mood and habit completion"""
        if not habit_data or not mood_data:
            return {'correlation': 0, 'insight': 'Insufficient data'}
        
        # Create date-based mapping for mood and completion
        mood_map = {m.get('date'): m.get('type') for m in mood_data}
        completion_map = {h.get('date'): h.get('completed', False) for h in habit_data}
        
        # Find matching dates
        common_dates = set(mood_map.keys()) & set(completion_map.keys())
        
        if len(common_dates) < 3:
            return {'correlation': 0, 'insight': 'Insufficient overlapping data'}
        
        # Calculate correlation
        moods = []
        completions = []
        for date in common_dates:
            mood_score = self._mood_to_score(mood_map[date])
            moods.append(mood_score)
            completions.append(1 if completion_map[date] else 0)
        
        correlation = np.corrcoef(moods, completions)[0, 1] if len(moods) > 1 else 0
        
        insight = ""
        if correlation > 0.5:
            insight = "Strong positive correlation between mood and habit completion"
        elif correlation < -0.5:
            insight = "Negative correlation - consider mood management strategies"
        else:
            insight = "Weak correlation between mood and completion"
        
        return {
            'correlation': round(correlation, 2),
            'insight': insight,
            'sampleSize': len(common_dates)
        }
    
    def _analyze_habit_interactions(self, habit_data: List[Dict]) -> Dict[str, Any]:
        """Analyze how different habits interact with each other"""
        # This would typically use more sophisticated analysis
        # For now, return basic interaction insights
        
        habit_names = list(set([h.get('name', '') for h in habit_data]))
        
        return {
            'synergisticPairs': [
                ['Morning Exercise', 'Meditation'],
                ['Reading', 'Journaling']
            ],
            'conflictingPairs': [
                ['Intense Exercise', 'Late Night Reading']
            ],
            'totalHabits': len(habit_names)
        }
    
    def _analyze_weekly_patterns(self, habit_data: List[Dict]) -> Dict[str, Any]:
        """Analyze weekly patterns"""
        if not habit_data:
            return {'weekendPerformance': 0, 'weekdayPerformance': 0, 'pattern': 'none'}
        
        # Separate weekday and weekend performance
        weekday_completion = []
        weekend_completion = []
        
        for habit in habit_data:
            date_str = habit.get('date', '')
            if date_str:
                date = pd.to_datetime(date_str)
                if date.weekday() < 5:  # Monday-Friday
                    weekday_completion.append(habit.get('completed', False))
                else:  # Saturday-Sunday
                    weekend_completion.append(habit.get('completed', False))
        
        weekday_avg = np.mean(weekday_completion) if weekday_completion else 0
        weekend_avg = np.mean(weekend_completion) if weekend_completion else 0
        
        pattern = ""
        if weekday_avg > weekend_avg + 0.2:
            pattern = "weekday_stronger"
        elif weekend_avg > weekday_avg + 0.2:
            pattern = "weekend_stronger"
        else:
            pattern = "balanced"
        
        return {
            'weekdayPerformance': round(weekday_avg, 2),
            'weekendPerformance': round(weekend_avg, 2),
            'pattern': pattern,
            'insight': f"You perform better on {'weekdays' if pattern == 'weekday_stronger' else 'weekends' if pattern == 'weekend_stronger' else 'both days equally'}"
        }
