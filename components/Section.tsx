
import React from 'react';

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <section>
      <h2 className="text-3xl font-bold font-serif text-slate-800 border-b-2 border-slate-300 pb-2 mb-6">
        {title}
      </h2>
      {children}
    </section>
  );
};
