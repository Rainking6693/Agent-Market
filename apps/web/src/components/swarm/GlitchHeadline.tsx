import type { ReactNode } from 'react';

type Props = {
  text?: string;
  label?: string;
  children?: ReactNode;
  className?: string;
};

export default function GlitchHeadline({ text, label, children, className = "" }: Props) {
  const displayText = text || (typeof children === 'string' ? children : undefined);
  const content = children ?? text;
  const headlineClass = ['glitch-headline', className].filter(Boolean).join(' ');

  return (
    <div>
      {label && <p className="text-xs tracking-widest text-slate-500 uppercase mb-4">{label}</p>}
      <h1 className={headlineClass} data-text={displayText}>
        <span className="glitch-headline__text">{content}</span>
      </h1>
    </div>
  );
}
