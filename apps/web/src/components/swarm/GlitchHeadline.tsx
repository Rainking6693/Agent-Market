"use client";

type Props = {
  text: string;
  label?: string;
};

export default function GlitchHeadline({ text, label }: Props) {
  return (
    <div className="glitch-headline" data-text={text}>
      {label && <p className="glitch-label">{label}</p>}
      {text}
    </div>
  );
}
