-- ============================================================
-- AITestCraft — E2E Test Seed Data
--
-- BEFORE RUNNING:
--   1. Sign up two accounts at http://localhost:3002
--      - Account A: go through onboarding as "Recruiter" (company: TechCorp)
--      - Account B: go through onboarding as "Candidate"
--   2. Get their Clerk user IDs from Supabase → profiles table
--      OR from Clerk Dashboard → Users
--   3. Replace the two placeholders below:
--
--   RECRUITER_CLERK_ID  → clerk_user_id of the recruiter account
--   CANDIDATE_CLERK_ID  → clerk_user_id of the candidate account
-- ============================================================

-- Paste your IDs here:
\set recruiter_id 'RECRUITER_CLERK_ID'
\set candidate_id 'CANDIDATE_CLERK_ID'

-- ── 1. Verify profiles exist (created by onboarding) ────────
-- These should already exist after onboarding. If not, insert manually:
-- INSERT INTO profiles (clerk_user_id, role, full_name, email)
-- VALUES (:'recruiter_id', 'recruiter', 'Alice Recruiter', 'recruiter@test.com')
-- ON CONFLICT (clerk_user_id) DO NOTHING;

-- INSERT INTO profiles (clerk_user_id, role, full_name, email)
-- VALUES (:'candidate_id', 'candidate', 'Bob Candidate', 'candidate@test.com')
-- ON CONFLICT (clerk_user_id) DO NOTHING;

-- ── 2. Add skills to candidate profile ──────────────────────
UPDATE candidate_profiles
SET
  skills = ARRAY['Playwright', 'TypeScript', 'Selenium', 'API Testing', 'Pytest'],
  experience_years = 3,
  bio = 'QA engineer with 3 years of automation experience specialising in Playwright and API testing.',
  linkedin_url = 'https://linkedin.com/in/bobcandidate',
  github_url = 'https://github.com/bobcandidate'
WHERE clerk_user_id = :'candidate_id';

-- ── 3. Add a job posting ─────────────────────────────────────
INSERT INTO job_postings (company_id, title, description, required_skills, experience_level, remote, status)
SELECT
  c.id,
  'Senior QA Automation Engineer',
  'We are looking for a Senior QA Automation Engineer to lead our test automation efforts using Playwright and TypeScript.',
  ARRAY['Playwright', 'TypeScript', 'API Testing', 'CI/CD'],
  'senior',
  true,
  'active'
FROM companies c
WHERE c.clerk_user_id = :'recruiter_id'
ON CONFLICT DO NOTHING;

-- ── 4. Add a sample assessment with pre-built questions ──────
WITH company AS (
  SELECT id FROM companies WHERE clerk_user_id = :'recruiter_id'
),
job AS (
  SELECT id FROM job_postings
  WHERE company_id = (SELECT id FROM company)
  LIMIT 1
)
INSERT INTO assessments (company_id, job_posting_id, title, description, questions, time_limit_minutes, passing_score, is_active)
SELECT
  company.id,
  job.id,
  'Playwright Automation Skills Test',
  'A 5-question technical assessment covering Playwright, TypeScript, and test automation best practices.',
  '[
    {
      "id": "q1",
      "question": "Which Playwright method is preferred over driver.findElement(By.id) from Selenium?",
      "type": "mcq",
      "options": ["page.locator(\"#id\")", "page.getByRole()", "page.getByLabel()", "page.getByTestId()"],
      "correct_answer": "page.getByRole()",
      "points": 10
    },
    {
      "id": "q2",
      "question": "What is the correct way to assert that a button with text \"Submit\" is visible in Playwright?",
      "type": "mcq",
      "options": [
        "expect(page.getByRole(\"button\", { name: \"Submit\" })).toBeTruthy()",
        "await expect(page.getByRole(\"button\", { name: \"Submit\" })).toBeVisible()",
        "assert page.locator(\"button\").isVisible()",
        "page.waitForSelector(\"button\").isVisible()"
      ],
      "correct_answer": "await expect(page.getByRole(\"button\", { name: \"Submit\" })).toBeVisible()",
      "points": 10
    },
    {
      "id": "q3",
      "question": "Explain the Page Object Model pattern and why it is beneficial in test automation.",
      "type": "text",
      "points": 20
    },
    {
      "id": "q4",
      "question": "Write a Playwright TypeScript test that navigates to https://example.com, clicks a button with text \"Sign In\", fills an email field with \"test@example.com\", and asserts the page title contains \"Dashboard\".",
      "type": "code",
      "points": 30
    },
    {
      "id": "q5",
      "question": "What does Playwright auto-wait for, and how does this differ from Selenium''s explicit waits?",
      "type": "text",
      "points": 30
    }
  ]'::jsonb,
  45,
  70,
  true
FROM company, job
ON CONFLICT DO NOTHING;

-- ── 5. Invite the candidate to the assessment ────────────────
INSERT INTO candidate_assessments (assessment_id, candidate_clerk_id, status)
SELECT
  a.id,
  :'candidate_id',
  'invited'
FROM assessments a
JOIN companies c ON c.id = a.company_id
WHERE c.clerk_user_id = :'recruiter_id'
  AND a.title = 'Playwright Automation Skills Test'
ON CONFLICT (assessment_id, candidate_clerk_id) DO NOTHING;

-- ── 6. Add two completed mock interview sessions ─────────────
INSERT INTO mock_interviews (
  candidate_clerk_id, topic, difficulty, questions, answers, score, feedback, completed, completed_at
)
VALUES (
  :'candidate_id',
  'playwright',
  'medium',
  '[
    {"id":"q1","question":"What is the difference between page.click() and locator.click()?","expected_points":["locator is more stable","locator auto-waits","page.click is legacy"]},
    {"id":"q2","question":"How do you handle multiple tabs in Playwright?","expected_points":["context.pages()","page event","waitForEvent"]},
    {"id":"q3","question":"What is the purpose of fixtures in Playwright?","expected_points":["reusable setup","test isolation","TypeScript type safety"]}
  ]'::jsonb,
  '{
    "q1": {"answer": "locator.click() is preferred as it auto-waits for the element to be actionable, while page.click() is a legacy API.", "score": 85, "feedback": "Good answer, mentioned auto-wait correctly."},
    "q2": {"answer": "You can use context.pages() to get all open pages, or listen to the page event on BrowserContext.", "score": 90, "feedback": "Excellent - covered both approaches."},
    "q3": {"answer": "Fixtures provide reusable setup and teardown code, and improve test isolation.", "score": 75, "feedback": "Solid answer, could mention TypeScript types."}
  }'::jsonb,
  83.3,
  '{"overall_score": 83, "strengths": ["Strong understanding of locators", "Good async/await knowledge"], "improvements": ["Expand on fixture typing", "Mention test.extend"], "next_steps": ["Study Playwright fixtures docs", "Practice writing POM classes"]}'::jsonb,
  true,
  now() - interval '2 days'
),
(
  :'candidate_id',
  'api-testing',
  'easy',
  '[
    {"id":"q1","question":"What HTTP status code means a resource was successfully created?","expected_points":["201","Created","POST response"]},
    {"id":"q2","question":"How do you test an API with authentication in Playwright?","expected_points":["storageState","extraHTTPHeaders","APIRequestContext"]}
  ]'::jsonb,
  '{
    "q1": {"answer": "201 Created", "score": 100, "feedback": "Correct!"},
    "q2": {"answer": "Use page.context().setExtraHTTPHeaders() or the APIRequestContext with the Authorization header.", "score": 80, "feedback": "Good, could also mention storageState."}
  }'::jsonb,
  90,
  '{"overall_score": 90, "strengths": ["Clear API knowledge", "Knows Playwright API testing"], "improvements": ["Learn storageState for auth"], "next_steps": ["Practice APIRequestContext", "Try Playwright API testing guide"]}'::jsonb,
  true,
  now() - interval '1 day'
)
ON CONFLICT DO NOTHING;

-- ── Done ─────────────────────────────────────────────────────
-- After running, you should see:
-- profiles:              2 rows (recruiter + candidate)
-- companies:             1 row (TechCorp)
-- candidate_profiles:    1 row (with skills)
-- job_postings:          1 row (Senior QA Engineer)
-- assessments:           1 row (Playwright Skills Test)
-- candidate_assessments: 1 row (status = invited)
-- mock_interviews:       2 rows (both completed)
