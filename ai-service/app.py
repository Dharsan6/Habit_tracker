import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import logging
from datetime import datetime, timedelta

# Import AI models
from app.models.productivity_model import ProductivityModel
from app.models.streak_model import StreakModel
from app.models.burnout_model import BurnoutModel
from app.models.analytics_service import AnalyticsService

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=getattr(logging, os.getenv('LOG_LEVEL', 'INFO')))
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize AI models
productivity_model = ProductivityModel()
streak_model = StreakModel()
burnout_model = BurnoutModel()
analytics_service = AnalyticsService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'LifeTracker AI Service'
    })

@app.route('/predict/productivity', methods=['POST'])
def predict_productivity():
    """Predict user productivity score"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        habit_data = data.get('habit_data', [])
        mood_data = data.get('mood_data', [])
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get productivity prediction
        prediction = productivity_model.predict(user_id, habit_data, mood_data)
        
        return jsonify({
            'success': True,
            'data': prediction
        })
    
    except Exception as e:
        logger.error(f"Error in productivity prediction: {str(e)}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/predict/streak', methods=['POST'])
def predict_streak():
    """Predict habit streak continuation"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        habit_id = data.get('habit_id')
        historical_data = data.get('historical_data', [])
        
        if not user_id or not habit_id:
            return jsonify({'error': 'user_id and habit_id are required'}), 400
        
        # Get streak prediction
        prediction = streak_model.predict(user_id, habit_id, historical_data)
        
        return jsonify({
            'success': True,
            'data': prediction
        })
    
    except Exception as e:
        logger.error(f"Error in streak prediction: {str(e)}")
        return jsonify({'error': 'Prediction failed'}), 500

@app.route('/analytics/burnout', methods=['POST'])
def analyze_burnout():
    """Analyze burnout risk"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        habit_data = data.get('habit_data', [])
        mood_data = data.get('mood_data', [])
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get burnout analysis
        analysis = burnout_model.analyze(user_id, habit_data, mood_data)
        
        return jsonify({
            'success': True,
            'data': analysis
        })
    
    except Exception as e:
        logger.error(f"Error in burnout analysis: {str(e)}")
        return jsonify({'error': 'Analysis failed'}), 500

@app.route('/analytics/weekly', methods=['POST'])
def weekly_analytics():
    """Generate weekly performance analysis"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get weekly analytics
        analytics = analytics_service.weekly_analysis(user_id, start_date, end_date)
        
        return jsonify({
            'success': True,
            'data': analytics
        })
    
    except Exception as e:
        logger.error(f"Error in weekly analytics: {str(e)}")
        return jsonify({'error': 'Analytics failed'}), 500

@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    """Generate AI-driven recommendations"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        habit_data = data.get('habit_data', [])
        mood_data = data.get('mood_data', [])
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get recommendations
        recommendations = analytics_service.generate_recommendations(user_id, habit_data, mood_data)
        
        return jsonify({
            'success': True,
            'data': recommendations
        })
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        return jsonify({'error': 'Recommendations failed'}), 500

@app.route('/patterns/behavioral', methods=['POST'])
def analyze_patterns():
    """Analyze behavioral patterns"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        habit_data = data.get('habit_data', [])
        mood_data = data.get('mood_data', [])
        
        if not user_id:
            return jsonify({'error': 'user_id is required'}), 400
        
        # Get pattern analysis
        patterns = analytics_service.analyze_behavioral_patterns(user_id, habit_data, mood_data)
        
        return jsonify({
            'success': True,
            'data': patterns
        })
    
    except Exception as e:
        logger.error(f"Error in pattern analysis: {str(e)}")
        return jsonify({'error': 'Pattern analysis failed'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting LifeTracker AI Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
