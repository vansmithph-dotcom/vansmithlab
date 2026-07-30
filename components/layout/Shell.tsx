import { ReactNode } from "react";

type ShellProps = {
  children: ReactNode;
};

export default function Shell({ children }: ShellProps) {
  return <>{children}</>;
}