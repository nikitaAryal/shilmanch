-- ============================================
-- Shilmanch Theatre Database Migrations
-- Run these commands in your MySQL database
-- ============================================

-- ============================================
-- REQUIRED NOW (for current implementation)
-- ============================================

-- 1. Add payment_method column to orders table (for COD payment)
--    If you get "Duplicate column" error, the column already exists - skip this
ALTER TABLE orders
ADD COLUMN payment_method ENUM('cod', 'online', 'esewa', 'paypal') DEFAULT 'cod';

-- 2. Ensure is_admin column exists in users table
--    If you get "Duplicate column" error, the column already exists - skip this
ALTER TABLE users ADD COLUMN is_admin TINYINT(1) DEFAULT 0;

-- 3. Make a user an admin (REPLACE with your actual email!)
UPDATE users SET is_admin = 1 WHERE email = 'your-email@example.com';


-- ============================================
-- FOR LATER (Phase 2 - Reviews System)
-- ============================================

-- Create reviews table (run this when implementing reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  play_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (play_id) REFERENCES plays(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_play (user_id, play_id)
);
