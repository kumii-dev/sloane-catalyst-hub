-- Fix typo in mentor title
UPDATE mentors 
SET title = 'Financial Analyst' 
WHERE title LIKE '%Anal;%';