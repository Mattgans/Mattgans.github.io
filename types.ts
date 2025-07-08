export interface ContactInfo {
  phone: string;
  email: string;
  linkedin: string;
  github: string;
}

export interface Education {
  institution: string;
  degree: string;
  graduation: string;
  gpa: string;
  awards: string[];
  courses: string[];
}

export interface Experience {
  role: string;
  company: string;
  pi?: string;
  location: string;
  dates: string;
  description: string[];
}

export interface Project {
  name: string;
  technologies: string[];
  description: string[];
  link?: string;
}

export interface SkillCategory {
  title: string;
  skills: string[];
}