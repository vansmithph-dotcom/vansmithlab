export type DisplaySource = {
  id?: string;
  title?: string;
  url?: string;
  publisher?: string;
  accessed_at?: string;
};

export function sourceDisplayTitle(source: DisplaySource): string;
export function sourceDisplayMeta(source: DisplaySource): string;
export function uniqueSourcesByUrl<T extends DisplaySource>(sources: T[]): T[];
