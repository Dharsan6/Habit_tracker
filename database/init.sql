-- LifeTracker Database Initialization Script
-- This script creates the database schema for the LifeTracker application

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');

-- Create habit frequency enum
CREATE TYPE habit_frequency AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- Create mood type enum
CREATE TYPE mood_type AS ENUM ('HAPPY', 'NEUTRAL', 'SAD', 'STRESSED', 'MOTIVATED');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create habits table
CREATE TABLE IF NOT EXISTS habits (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    frequency habit_frequency NOT NULL,
    target_days INTEGER NOT NULL,
    streak INTEGER DEFAULT 0 NOT NULL,
    completed_today BOOLEAN DEFAULT FALSE NOT NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0.0 NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create mood entries table
CREATE TABLE IF NOT EXISTS moods (
    id BIGSERIAL PRIMARY KEY,
    type mood_type NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create habit check-ins table
CREATE TABLE IF NOT EXISTS habit_check_ins (
    id BIGSERIAL PRIMARY KEY,
    habit_id BIGINT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    notes TEXT,
    mood mood_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_category ON habits(category);
CREATE INDEX IF NOT EXISTS idx_habits_frequency ON habits(frequency);
CREATE INDEX IF NOT EXISTS idx_habits_created_at ON habits(created_at);
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON moods(user_id);
CREATE INDEX IF NOT EXISTS idx_moods_date ON moods(date);
CREATE INDEX IF NOT EXISTS idx_moods_type ON moods(type);
CREATE INDEX IF NOT EXISTS idx_habit_check_ins_habit_id ON habit_check_ins(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_check_ins_date ON habit_check_ins(check_in_date);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for development (optional)
-- This can be commented out in production
DO $$
BEGIN
    -- Check if we should insert sample data
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users' AND (SELECT COUNT(*) FROM users) = 0) THEN
        -- Insert sample user
        INSERT INTO users (username, email, password, first_name, last_name, role) VALUES
        ('demo', 'demo@lifetracker.com', '$2a$10$N9qo8wLOftG6zqA1bM5rH9G5qA1bM5rH9G5qA1bM5rH9G5qA1bM5rH9G5qA1bM5rH9G5qA1bM5rH9G5q', 'Demo', 'User', 'USER');
        
        -- Get the demo user ID
        DECLARE demo_user_id BIGINT;
        SELECT id INTO demo_user_id FROM users WHERE email = 'demo@lifetracker.com';
        
        -- Insert sample habits
        INSERT INTO habits (title, description, category, frequency, target_days, user_id) VALUES
        ('Morning Exercise', '30 minutes workout', 'Health', 'DAILY', 30, demo_user_id),
        ('Read Books', 'Read for 30 minutes', 'Learning', 'DAILY', 30, demo_user_id),
        ('Meditation', '10 minutes mindfulness', 'Mental Health', 'DAILY', 30, demo_user_id),
        ('Journaling', 'Write daily thoughts', 'Mental Health', 'DAILY', 30, demo_user_id),
        ('Water Intake', 'Drink 8 glasses of water', 'Health', 'DAILY', 30, demo_user_id);
        
        -- Insert sample moods
        INSERT INTO moods (type, date, notes, user_id) VALUES
        ('HAPPY', CURRENT_DATE - INTERVAL '7 days', 'Great day! Productive and motivated.', demo_user_id),
        ('NEUTRAL', CURRENT_DATE - INTERVAL '6 days', 'Regular day, nothing special.', demo_user_id),
        ('MOTIVATED', CURRENT_DATE - INTERVAL '5 days', 'Feeling energized and ready to tackle goals.', demo_user_id),
        ('HAPPY', CURRENT_DATE - INTERVAL '4 days', 'Another good day with solid progress.', demo_user_id),
        ('STRESSED', CURRENT_DATE - INTERVAL '3 days', 'Feeling overwhelmed with work.', demo_user_id),
        ('NEUTRAL', CURRENT_DATE - INTERVAL '2 days', 'Steady day, maintained routine.', demo_user_id),
        ('HAPPY', CURRENT_DATE - INTERVAL '1 days', 'Excellent mood, completed all habits!', demo_user_id),
        ('MOTIVATED', CURRENT_DATE, 'Ready to start the week strong!', demo_user_id);
        
        -- Insert sample habit check-ins
        INSERT INTO habit_check_ins (habit_id, check_in_date, completed, notes) VALUES
        (1, CURRENT_DATE - INTERVAL '7 days', TRUE, 'Great morning workout!'),
        (1, CURRENT_DATE - INTERVAL '6 days', TRUE, 'Quick 20min session'),
        (1, CURRENT_DATE - INTERVAL '5 days', FALSE, 'Too tired, skipped exercise'),
        (1, CURRENT_DATE - INTERVAL '4 days', TRUE, 'Back on track with yoga'),
        (1, CURRENT_DATE - INTERVAL '3 days', TRUE, 'Cardio session completed'),
        (1, CURRENT_DATE - INTERVAL '2 days', TRUE, 'Strength training day'),
        (1, CURRENT_DATE - INTERVAL '1 days', TRUE, 'Morning run before work');
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Output completion message
DO $$
BEGIN
    RAISE NOTICE 'LifeTracker database initialization completed successfully!';
END $$;
