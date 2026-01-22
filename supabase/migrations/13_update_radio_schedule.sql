-- 13_update_radio_schedule.sql
-- Truncate and update the radio schedule with the official daily programming

BEGIN;

-- Remove existing schedule
TRUNCATE TABLE schedule;

-- Insert Daily Schedule
INSERT INTO schedule (show_title, hosts, start_time, end_time, day_of_week)
VALUES 
('Unlimited Worship & Praise', NULL, '06:00:00', '15:00:00', 'Daily'),
('Connect 4 to Heaven', 'Mezil', '15:00:00', '17:00:00', 'Daily'),
('Sheffield Family Life Center', 'Pastor George Weslake', '17:00:00', '18:00:00', 'Daily'),
('Bragging on my kids', NULL, '18:00:00', '19:00:00', 'Daily'),
('Youth corner', NULL, '19:00:00', '20:00:00', 'Daily'),
('Let’s talk marriage', NULL, '20:00:00', '21:00:00', 'Daily'),
('Meditation', NULL, '21:00:00', '22:00:00', 'Daily'),
('Praise & Worship', NULL, '22:00:00', '06:00:00', 'Daily');

COMMIT;
