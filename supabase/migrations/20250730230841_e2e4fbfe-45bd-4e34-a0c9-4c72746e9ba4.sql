-- Update bird levels with proper emojis and fix Phoenix points requirement
UPDATE bird_levels SET emoji = '🕊️' WHERE name = 'Dove';
UPDATE bird_levels SET emoji = '🐦' WHERE name = 'Sparrow';
UPDATE bird_levels SET emoji = '🦅' WHERE name = 'Hawk';
UPDATE bird_levels SET emoji = '🦅' WHERE name = 'Eagle';
UPDATE bird_levels SET emoji = '🦅' WHERE name = 'Falcon';
UPDATE bird_levels SET emoji = '🐦‍🔥', min_points = 10000 WHERE name = 'Phoenix';