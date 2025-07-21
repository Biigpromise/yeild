-- Clear all community chat messages
DELETE FROM messages;

-- Reset all user points to zero and clear related data for fresh start
UPDATE profiles SET 
  points = 0,
  tasks_completed = 0,
  level = 1,
  total_referrals_count = 0,
  active_referrals_count = 0;

-- Clear all point transactions for fresh start
DELETE FROM point_transactions;

-- Clear all task submissions for fresh start  
DELETE FROM task_submissions;

-- Clear all user tasks for fresh start
DELETE FROM user_tasks;

-- Clear all user achievements for fresh start
DELETE FROM user_achievements;

-- Clear all reward redemptions for fresh start
DELETE FROM reward_redemptions;

-- Clear all withdrawal requests for fresh start
DELETE FROM withdrawal_requests;