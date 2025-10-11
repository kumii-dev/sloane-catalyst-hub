-- Fix typo in title for Mafika's mentor profile
UPDATE mentors 
SET title = 'Financial Analyst' 
WHERE title = 'Financial Analyst' 
  AND id IN (
    SELECT m.id 
    FROM mentors m 
    JOIN profiles p ON m.user_id = p.user_id 
    WHERE p.first_name = 'Mafika'
  );
