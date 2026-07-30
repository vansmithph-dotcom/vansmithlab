import { ReactNode } from "react";

interface GridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export default function Grid({
  children,
  columns = 3,
  className = "",
}: GridProps) {
  return (
    <div className={`grid grid-${columns} ${className}`}>
      {children}
    </div>
  );
}