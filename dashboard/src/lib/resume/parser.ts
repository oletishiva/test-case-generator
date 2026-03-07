import type { ResumeData } from "@/types/resume";

export function cleanJson(raw: string): string {
  // Strip markdown code fences if Claude wraps in ```json
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

export function parseResumeJson(raw: string): ResumeData {
  const cleaned = cleanJson(raw);
  const parsed = JSON.parse(cleaned) as ResumeData;

  // Ensure required arrays exist
  if (!parsed.experience) parsed.experience = [];
  if (!parsed.education) parsed.education = [];
  if (!parsed.skills) parsed.skills = [];
  if (!parsed.certifications) parsed.certifications = [];
  if (!parsed.tools) parsed.tools = [];
  if (!parsed.achievements) parsed.achievements = [];
  if (!parsed.languages) parsed.languages = [];

  return parsed;
}

export const SAMPLE_RESUME: ResumeData = {
  personalInfo: {
    name: "Priya Sharma",
    title: "Senior QA Engineer",
    email: "priya.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Bangalore, India",
    linkedin: "linkedin.com/in/priya-sharma-qa",
    github: "github.com/priya-sharma",
    summary:
      "8+ years of experience in manual and automation testing across fintech and e-commerce domains. Expert in Selenium, Playwright, and API testing with a strong focus on shift-left quality practices.",
  },
  experience: [
    {
      role: "Senior QA Engineer",
      company: "FinPay Technologies",
      location: "Bangalore, India",
      startDate: "Jan 2021",
      endDate: "Present",
      bullets: [
        "Built automated regression suite covering 400+ test cases using Playwright + TypeScript",
        "Reduced regression cycle from 3 days to 4 hours by parallelising test execution across 8 workers",
        "Led shift-left initiative that caught 60% of critical bugs before sprint demos",
        "Mentored 3 junior QA engineers in BDD practices and Gherkin scenario writing",
      ],
    },
    {
      role: "QA Engineer",
      company: "ShopEasy India",
      location: "Hyderabad, India",
      startDate: "Jul 2018",
      endDate: "Dec 2020",
      bullets: [
        "Developed API test framework using RestAssured and Postman collections",
        "Maintained 95% automation coverage for checkout and payments flow",
        "Integrated smoke tests into CI/CD pipeline reducing production incidents by 40%",
      ],
    },
  ],
  education: [
    {
      degree: "B.Tech Computer Science",
      institution: "BITS Pilani",
      year: "2018",
      grade: "8.2 CGPA",
    },
  ],
  skills: [
    { name: "Playwright", level: 5 },
    { name: "Selenium WebDriver", level: 5 },
    { name: "API Testing", level: 4 },
    { name: "BDD / Gherkin", level: 4 },
    { name: "TypeScript", level: 4 },
    { name: "CI/CD (Jenkins, GitHub Actions)", level: 3 },
    { name: "Performance Testing", level: 3 },
    { name: "SQL", level: 3 },
  ],
  certifications: [
    { name: "ISTQB Advanced Level Test Automation Engineer", issuer: "ISTQB", year: "2022" },
    { name: "AWS Certified Cloud Practitioner", issuer: "Amazon", year: "2023" },
  ],
  tools: ["Playwright", "Selenium", "Postman", "JIRA", "Confluence", "Jenkins", "GitHub Actions", "Docker", "k6"],
  achievements: [
    { metric: "60%", label: "Bug detection improvement" },
    { metric: "4hrs", label: "Regression cycle (was 3 days)" },
    { metric: "95%", label: "Automation coverage" },
    { metric: "40%", label: "Fewer production incidents" },
  ],
  languages: ["English", "Hindi", "Telugu"],
};
