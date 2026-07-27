export interface WindowMetadata {
  id: string;
  title: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const windowRegistry: Record<string, WindowMetadata> = {
  terminal: { id: 'terminal', title: 'CLI Terminal', defaultWidth: 800, defaultHeight: 500 },
  oracle: { id: 'oracle', title: 'Oracle Assistant', defaultWidth: 400, defaultHeight: 600 },
  dashboard: { id: 'dashboard', title: 'Recruiter Dashboard', defaultWidth: 1024, defaultHeight: 768 },
  'sample-1': { id: 'sample-1', title: 'Sample Node Monitor', defaultWidth: 450, defaultHeight: 300 },
  'sample-2': { id: 'sample-2', title: 'Sample System Telemetry', defaultWidth: 500, defaultHeight: 400 },
};
