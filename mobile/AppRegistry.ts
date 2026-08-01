export interface MobileAppMetadata {
  id: string;
  label: string;
  icon?: string;
}

export const appRegistry: Record<string, MobileAppMetadata> = {
  terminal: { id: 'terminal', label: 'CLI Terminal' },
  oracle: { id: 'oracle', label: 'Oracle Chat' },
  skills: { id: 'skills', label: 'Skills Map' },
  recruiter: { id: 'recruiter', label: 'Match Tool' },
};
