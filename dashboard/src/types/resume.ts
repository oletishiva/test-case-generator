export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  summary: string;
}

export interface Experience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
  grade?: string;
}

export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5;
}

export interface Certification {
  name: string;
  issuer: string;
  year: string;
}

export interface Achievement {
  metric: string;
  label: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  certifications: Certification[];
  tools: string[];
  achievements: Achievement[];
  languages?: string[];
}

export interface AtsBreakdownItem {
  criterion: string;
  passed: boolean;
  suggestion?: string;
}

export interface AtsScore {
  total: number;
  keywordMatch: number;
  criteriaScore: number;
  impactScore: "A+" | "A" | "B" | "C";
  breakdown: AtsBreakdownItem[];
  missingKeywords: string[];
  suggestions: string[];
}

export type TemplateTheme = "dark" | "light" | "colorful";

export interface ResumeTemplate {
  id: string;
  name: string;
  theme: TemplateTheme;
  accentColor: string;
  targetRole: string;
  preview: string;
}

export interface ResumeSession {
  id: string;
  user_id: string;
  resume_data: ResumeData;
  ats_score?: AtsScore;
  selected_template: string;
  is_enhanced: boolean;
  share_token?: string;
  created_at: string;
  updated_at: string;
}

export const RESUME_TEMPLATES: ResumeTemplate[] = [
  {
    id: "obsidian-gold",
    name: "Obsidian Gold",
    theme: "dark",
    accentColor: "#C9A84C",
    targetRole: "QA Architect / Senior Lead",
    preview: "/templates/obsidian-gold.png",
  },
  {
    id: "neon-circuit",
    name: "Neon Circuit",
    theme: "dark",
    accentColor: "#00F5FF",
    targetRole: "SDET / DevOps QA",
    preview: "/templates/neon-circuit.png",
  },
  {
    id: "editorial-bloom",
    name: "Editorial Bloom",
    theme: "light",
    accentColor: "#FF4D6D",
    targetRole: "QA Lead / Manager",
    preview: "/templates/editorial-bloom.png",
  },
  {
    id: "mint-fresh",
    name: "Mint Fresh",
    theme: "light",
    accentColor: "#4CAF7D",
    targetRole: "API Testing Specialist",
    preview: "/templates/mint-fresh.png",
  },
  {
    id: "steel-pro",
    name: "Steel Pro",
    theme: "dark",
    accentColor: "#8B9BB4",
    targetRole: "Performance Engineer",
    preview: "/templates/steel-pro.png",
  },
  {
    id: "sunset-gradient",
    name: "Sunset Gradient",
    theme: "colorful",
    accentColor: "#FF6B6B",
    targetRole: "Mobile QA Engineer",
    preview: "/templates/sunset-gradient.png",
  },
  {
    id: "blueprint-tech",
    name: "Blueprint Tech",
    theme: "dark",
    accentColor: "#4A90D9",
    targetRole: "DevOps QA / CI-CD Specialist",
    preview: "/templates/blueprint-tech.png",
  },
  {
    id: "aurora-soft",
    name: "Aurora Soft",
    theme: "light",
    accentColor: "#A78BFA",
    targetRole: "Fresher / Entry Level QA",
    preview: "/templates/aurora-soft.png",
  },
  {
    id: "executive-black",
    name: "Executive Black",
    theme: "dark",
    accentColor: "#FFFFFF",
    targetRole: "QA Consultant / Freelancer",
    preview: "/templates/executive-black.png",
  },
  {
    id: "desi-bold",
    name: "Desi Bold",
    theme: "colorful",
    accentColor: "#FF9933",
    targetRole: "India-market QA Professional",
    preview: "/templates/desi-bold.png",
  },
];
