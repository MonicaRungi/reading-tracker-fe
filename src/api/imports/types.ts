export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  errors: { title: string; reason: string }[];
}
