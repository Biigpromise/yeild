-- Update bird levels with new referral requirements
UPDATE bird_levels SET min_referrals = 0 WHERE name = 'Dove'; -- Starting level
UPDATE bird_levels SET min_referrals = 5 WHERE name = 'Sparrow'; -- First bird - 5 referrals  
UPDATE bird_levels SET min_referrals = 20 WHERE name = 'Hawk'; -- Second bird - 20 referrals
UPDATE bird_levels SET min_referrals = 50 WHERE name = 'Eagle'; -- Third bird - 50 referrals
UPDATE bird_levels SET min_referrals = 100 WHERE name = 'Falcon'; -- Fourth bird - 100 referrals
UPDATE bird_levels SET min_referrals = 500 WHERE name = 'Phoenix'; -- Fifth bird - 500 referrals

-- Also update the points requirements to make them more balanced
UPDATE bird_levels SET min_points = 0 WHERE name = 'Dove';
UPDATE bird_levels SET min_points = 100 WHERE name = 'Sparrow';
UPDATE bird_levels SET min_points = 500 WHERE name = 'Hawk';
UPDATE bird_levels SET min_points = 1000 WHERE name = 'Eagle';
UPDATE bird_levels SET min_points = 2500 WHERE name = 'Falcon';
UPDATE bird_levels SET min_points = 10000 WHERE name = 'Phoenix';

-- Update benefits to match the new progression
UPDATE bird_levels SET 
  benefits = '{"Basic profile features", "Starting your journey"}',
  description = 'Welcome to YIELD! Start your referral journey here.'
WHERE name = 'Dove';

UPDATE bird_levels SET 
  benefits = '{"Access to basic tasks", "Welcome bonus points", "Community access"}',
  description = 'Your first milestone! 5 active referrals unlocked.'
WHERE name = 'Sparrow';

UPDATE bird_levels SET 
  benefits = '{"Priority support", "Enhanced visibility", "10% point bonus"}',
  description = 'Rising through the ranks with 20 referrals!'
WHERE name = 'Hawk';

UPDATE bird_levels SET 
  benefits = '{"Access to all task types", "15% point bonus", "Priority support", "Leaderboard visibility"}',
  description = 'Soaring high with 50 referrals - elite territory!'
WHERE name = 'Eagle';

UPDATE bird_levels SET 
  benefits = '{"VIP status", "20% point bonus", "Early access", "Custom profile badge"}',
  description = 'Master level achieved with 100 referrals!'
WHERE name = 'Falcon';

UPDATE bird_levels SET 
  benefits = '{"VIP task access", "25% referral bonus", "Direct admin contact", "Custom badge", "Exclusive rewards"}',
  description = 'Legendary Phoenix status - 500 referrals achieved!'
WHERE name = 'Phoenix';