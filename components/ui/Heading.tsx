import { ReactNode } from "react";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingProps {
  level?: HeadingLevel;
  children: ReactNode;
  className?: string;
}

export default function Heading({
  level = 1,
  children,
  className = "",
}: HeadingProps) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return <Tag className={`heading heading-${level} ${className}`}>{children}</Tag>;
}