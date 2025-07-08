import React from 'react';
import { SkillBadge } from './SkillBadge.js';
import { Icon } from './Icon.js';

export const ProjectCard = ({ project }) => {
  return (
    <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
      <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
      <div className="z-10 sm:col-span-8">
        <h3 className="font-medium leading-snug text-slate-200">
          {project.link ? (
            <a href={project.link} target="_blank" rel="noreferrer noopener" className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-blue-400 focus-visible:text-blue-400 group/link text-base font-serif font-bold" aria-label={project.name}>
              <span className="absolute -inset-x-4 -inset-y-2.5 hidden rounded md:block"></span>
              <span>
                {project.name}{" "}
                <Icon name="arrow-up-right" className="inline-block h-4 w-4 shrink-0 transition-transform group-hover/link:-translate-y-1 group-hover/link:translate-x-1 group-focus-visible/link:-translate-y-1 group-focus-visible/link:translate-x-1 motion-reduce:transition-none ml-1 translate-y-px" />
              </span>
            </a>
          ) : (
            <span className="font-serif font-bold">{project.name}</span>
          )}
        </h3>
        <ul className="mt-2 list-disc list-inside text-slate-400 space-y-1 text-sm">
          {project.description.map((desc, index) => (
            <li key={index}>{desc}</li>
          ))}
        </ul>
        <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
            {project.technologies.map((tech, i) => (
                <li key={i} className="mr-1.5 mt-2">
                    <SkillBadge skill={tech} />
                </li>
            ))}
        </ul>
      </div>
    </div>
  );
};