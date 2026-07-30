import { ReactNode } from "react";

interface StackProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Stack({
  children,
  gap = "md",
  className = "",
}: StackProps) {
  return (
    <div className={`stack stack-${gap} ${className}`}>
      {children}
    </div>
  );
}