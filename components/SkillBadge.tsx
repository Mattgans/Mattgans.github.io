import React from 'react';

export const SkillBadge = ({ skill }) => {
  return (
    <span className="flex items-center rounded-full bg-blue-400/10 px-3 py-1 text-xs font-medium leading-5 text-blue-300">
      {skill}
    </span>
  );
};