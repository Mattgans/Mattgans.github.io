import React, { useState, useEffect, useRef } from 'react';
import { ABOUT_ME, CONTACT_INFO, EDUCATION_INFO, EXPERIENCE_INFO, NAME, PROJECTS_INFO, SKILLS_INFO, TITLE } from './constants.js';
import { ProjectCard } from './components/ProjectCard.js';
import { SkillBadge } from './components/SkillBadge.js';
import { Icon } from './components/Icon.js';

const SECTIONS = [
  { id: 'about', title: 'About' },
  { id: 'experience', title: 'Experience' },
  { id: 'projects', title: 'Projects' },
  { id: 'skills', title: 'Skills' },
];

const App = () => {
  const [activeSection, setActiveSection] = useState('about');
  const observer = useRef(null);

  useEffect(() => {
    observer.current = new IntersectionObserver((entries) => {
      const visibleSection = entries.find((entry) => entry.isIntersecting)?.target.id;
      if (visibleSection) {
        setActiveSection(visibleSection);
      }
    }, { rootMargin: '-30% 0px -70% 0px' });

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => {
      observer.current?.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.current?.unobserve(section);
      });
    };
  }, []);

  const NavLink = ({ id, title }) => (
    <li>
      <a href={`#${id}`} className="group flex items-center py-3">
        <span className={`nav-indicator mr-4 h-px w-8 bg-slate-500 transition-all group-hover:w-16 group-hover:bg-slate-200 ${activeSection === id ? 'w-16 bg-slate-200' : ''}`}></span>
        <span className={`nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 ${activeSection === id ? 'text-slate-200' : ''}`}>{title}</span>
      </a>
    </li>
  );
  
  const ExperienceCard = ({ experience }) => (
    <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
      <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
      <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2" aria-label={experience.dates}>
        {experience.dates}
      </header>
      <div className="z-10 sm:col-span-6">
        <h3 className="font-medium leading-snug text-slate-200">
            <div className="font-bold font-serif text-lg text-slate-200 group-hover:text-blue-400">{experience.role}</div>
            <div className="text-slate-400">{experience.company}{experience.pi && <span className="text-slate-500">, {experience.pi}</span>}</div>
        </h3>
        <ul className="mt-2 list-disc list-inside text-slate-400 space-y-1 text-sm">
            {experience.description.map((desc, i) => <li key={i}>{desc}</li>)}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-900 leading-relaxed">
      <div className="mx-auto min-h-screen max-w-screen-xl px-6 py-12 font-sans md:px-12 md:py-20 lg:px-24 lg:py-0">
        <div className="lg:flex lg:justify-between lg:gap-16">
          
          <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-5/12 lg:flex-col lg:justify-between lg:py-24">
            <div>
              <h1 className="font-serif text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">{NAME}</h1>
              <h2 className="mt-3 text-lg font-medium tracking-tight text-slate-200 sm:text-xl">{TITLE}</h2>
              <p className="mt-4 max-w-xs leading-normal text-slate-400">{ABOUT_ME}</p>
              
              <nav className="nav hidden lg:block" aria-label="In-page navigation">
                <ul className="mt-16 w-max">
                  {SECTIONS.map(section => <NavLink key={section.id} {...section} />)}
                </ul>
              </nav>
            </div>
            
            <ul className="ml-1 mt-8 flex items-center" aria-label="Social media">
              <li className="mr-5 shrink-0">
                <a className="block hover:text-slate-200 transition-colors" href={CONTACT_INFO.github} target="_blank" rel="noreferrer noopener" aria-label="GitHub">
                    <span className="sr-only">GitHub</span>
                    <Icon name="github" className="h-6 w-6"/>
                </a>
              </li>
              <li className="mr-5 shrink-0">
                <a className="block hover:text-slate-200 transition-colors" href={CONTACT_INFO.linkedin} target="_blank" rel="noreferrer noopener" aria-label="LinkedIn">
                    <span className="sr-only">LinkedIn</span>
                    <Icon name="linkedin" className="h-6 w-6"/>
                </a>
              </li>
               <li className="mr-5 shrink-0">
                <a className="block hover:text-slate-200 transition-colors" href={`mailto:${CONTACT_INFO.email}`} aria-label="Email">
                    <span className="sr-only">Email</span>
                    <Icon name="email" className="h-6 w-6"/>
                </a>
              </li>
            </ul>
          </header>

          <main id="content" className="pt-24 lg:w-7/12 lg:py-24">
            <section id="about" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24" aria-label="About me">
               <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">About</h2>
              </div>
                <p className="mb-4">{EDUCATION_INFO.degree} at the <span className="font-semibold text-slate-200">{EDUCATION_INFO.institution}</span>.</p>
                <p className="mb-4">{EDUCATION_INFO.graduation}, {EDUCATION_INFO.gpa}</p>
                 <ul className="list-disc list-inside text-slate-400 space-y-1">
                    {EDUCATION_INFO.awards.map((award, index) => <li key={index}>{award}</li>)}
                    <li><span className="font-semibold text-slate-200">Relevant Courses:</span> {EDUCATION_INFO.courses.join(', ')}</li>
                </ul>
            </section>
              
            <section id="experience" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24" aria-label="Work experience">
              <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Experience</h2>
              </div>
              <ul className="group/list">
                {EXPERIENCE_INFO.map((exp, index) => <li key={index} className="mb-12"><ExperienceCard experience={exp} /></li>)}
              </ul>
            </section>
            
            <section id="projects" className="mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24" aria-label="Selected projects">
               <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Projects</h2>
              </div>
              <ul className="group/list">
                 {PROJECTS_INFO.map((proj, index) => (
                    <li key={index} className="mb-12"><ProjectCard project={proj} /></li>
                  ))}
              </ul>
            </section>
            
            <section id="skills" className="scroll-mt-16 md:scroll-mt-24" aria-label="Technical skills">
                <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">Skills</h2>
                </div>
                {SKILLS_INFO.map((category, index) => (
                    <div key={index} className="mb-6">
                    <h3 className="text-md font-semibold font-serif text-slate-300 mb-3">{category.title}</h3>
                    <div className="flex flex-wrap gap-2">
                        {category.skills.map((skill, i) => <SkillBadge key={i} skill={skill} />)}
                    </div>
                    </div>
                ))}
            </section>

            <footer className="max-w-md pt-20 pb-16 text-sm text-slate-500 sm:pb-0">
              <p>Coded in <a href="https://code.visualstudio.com/" className="font-medium text-slate-400 hover:text-blue-400 focus-visible:text-blue-400" target="_blank" rel="noreferrer noopener">Visual Studio Code</a>. 
              Built with <a href="https://react.dev/" className="font-medium text-slate-400 hover:text-blue-400 focus-visible:text-blue-400" target="_blank" rel="noreferrer noopener">React</a> &amp; 
              <a href="https://tailwindcss.com/" className="font-medium text-slate-400 hover:text-blue-400 focus-visible:text-blue-400" target="_blank" rel="noreferrer noopener">Tailwind CSS</a>, 
              and deployed with <a href="https://pages.github.com/" className="font-medium text-slate-400 hover:text-blue-400 focus-visible:text-blue-400" target="_blank" rel="noreferrer noopener">GitHub Pages</a>.
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;