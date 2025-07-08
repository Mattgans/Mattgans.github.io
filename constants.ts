export const NAME = "Matthew Shang";
export const TITLE = "Aspiring Software Engineer & Researcher";
export const ABOUT_ME = "A dedicated and results-oriented Computer Science and Statistics student at the University of Illinois. Passionate about leveraging machine learning and data science to solve complex problems, with hands-on experience in developing AI models and data processing pipelines. A collaborative team player with a strong foundation in software engineering principles and a drive for continuous learning and innovation.";


export const CONTACT_INFO = {
  phone: "217-530-7875",
  email: "Mshang4@illinois.edu",
  linkedin: "https://linkedin.com/in/shangmatthew",
  github: "https://github.com/shangmatthew"
};

export const EDUCATION_INFO = {
  institution: "University of Illinois, Urbana-Champaign",
  degree: "Bachelor of Liberal Arts and Sciences in Computer Science and Statistics",
  graduation: "Expected Graduation May 2026",
  gpa: "GPA: 4.0/4.0",
  awards: ["Dean's List Award Recipient"],
  courses: [
    "Data Structures", "Algorithms", "Software Design", "Computer Systems", 
    "Statistics & Probability", "Statistical Modeling I & II"
  ]
};

export const EXPERIENCE_INFO = [
  {
    role: "Machine Learning & Bio-statistics Research Intern",
    company: "University of Illinois, Urbana-Champaign",
    pi: "PI: Sihai Dave Zhao",
    location: "Urbana, IL",
    dates: "Aug 2024 - Present",
    description: [
      "Utilized novel Vision Transformer-based models for Hyperspectral Unmixing applications, improving accuracy and efficiency.",
      "Implemented convolutional neural networks for biomarker detection using PyTorch, collaborating with chemists and imaging experts."
    ]
  },
  {
    role: "Stat 400 (Stat and Probability) & 200 (Stat Analysis) Course Assistant",
    company: "University of Illinois, Urbana-Champaign",
    location: "Urbana, IL",
    dates: "Feb 2024 - Present",
    description: [
      "Lead weekly discussion sections, teaching key statistical concepts and mathematical proofs to over 30 students.",
      "Provide individualized guidance during office hours and develop course content including exams and homework assignments."
    ]
  },
  {
    role: "CS 128 (Introduction to Computer Science II) Course Assistant",
    company: "University of Illinois, Urbana-Champaign",
    location: "Urbana, IL",
    dates: "Dec 2023 - Aug 2024",
    description: [
      "Led office hours and discussion sections, simplifying complex topics like data structures (trees, hash maps, linked lists) for students.",
      "Guided students on coding projects, assisting with algorithm implementation and debugging in C++."
    ]
  },
  {
    role: "Data Science Research Intern",
    company: "University of British Columbia",
    pi: "PI: Daniel Pauly",
    location: "Vancouver, BC",
    dates: "Jul 2022 - Oct 2023",
    description: [
      "Located over 1,000,000 Metric tonnes of unreported freshwater fishery catches through extensive literature review.",
      "Generated databases and implemented time-series analysis statistical methods to model freshwater catches from 1950-present."
    ]
  }
];

export const PROJECTS_INFO = [
  {
    name: '"Algophony" AI Music Generation',
    technologies: ["Deep Learning", "Generative AI", "CVAE", "CNN", "PyTorch"],
    description: [
      "Trained deep learning models (CVAE, GAN) in PyTorch on a 500GB+ audio dataset to generate novel musical compositions.",
      "Engineered a parallelized data processing pipeline that reduced computation time by 85%, and led a team of 4 developers."
    ],
    link: CONTACT_INFO.github,
  },
  {
    name: '"The Daily Prophet" AI Stock Trading Bot',
    technologies: ["Python", "Google Gemini", "Generative AI", "Alpaca API", "NewsAPI"],
    description: [
      "Developed a full-stack application that automates stock trading by analyzing real-time news with Google's Gemini AI for sentiment analysis and investment recommendations.",
      "Engineered a pipeline to fetch articles via NewsAPI, process AI-driven insights, and automatically execute paper trades on the Alpaca platform, displaying results on a web interface."
    ],
    link: CONTACT_INFO.github,
  },
  {
    name: "Credit Utilization Prediction Model",
    technologies: ["Python", "Scipy", "Random Forest", "XGBoost", "Pandas", "R"],
    description: [
      "Developed a forecasting model using Random Forest and XGBoost to predict credit card utilization, achieving 90% accuracy for a 3-month forecast.",
      "Automated the end-to-end pipeline for data preprocessing, model training, and evaluation to optimize for MAE/RMSE."
    ],
    link: CONTACT_INFO.github,
  }
];

export const SKILLS_INFO = [
  {
    title: "Coding Languages",
    skills: ["Java", "Python", "C/C++", "SQL (Postgres)", "R", "MATLAB", "SAS"]
  },
  {
    title: "Developer Tools",
    skills: ["Git", "Docker", "Google Cloud Platform", "VS Code", "Visual Studio", "Eclipse", "Thonny"]
  },
  {
    title: "Spoken Languages",
    skills: ["English (Fluent)", "Mandarin Chinese (Fluent)", "Shanghainese (Intermediate)"]
  }
];