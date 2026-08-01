export interface WindowMetadata {
  id: string;
  title: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export const windowRegistry: Record<string, WindowMetadata> = {
  home: {
    id: 'home',
    title: 'Workstation Home',
    defaultWidth: 900,
    defaultHeight: 620,
  },
  projects: {
    id: 'projects',
    title: 'Projects Explorer',
    defaultWidth: 850,
    defaultHeight: 580,
  },
  about: {
    id: 'about',
    title: 'About Suraj',
    defaultWidth: 650,
    defaultHeight: 520,
  },
  oracle: {
    id: 'oracle',
    title: 'Oracle Assistant',
    defaultWidth: 400,
    defaultHeight: 600,
  },
  terminal: {
    id: 'terminal',
    title: 'CLI Terminal',
    defaultWidth: 800,
    defaultHeight: 500,
  },
  timeline: {
    id: 'timeline',
    title: 'Career Timeline',
    defaultWidth: 800,
    defaultHeight: 550,
  },
  resume: {
    id: 'resume',
    title: 'Resume PDF Viewer',
    defaultWidth: 800,
    defaultHeight: 600,
  },
  contact: {
    id: 'contact',
    title: 'Contact Direct',
    defaultWidth: 500,
    defaultHeight: 420,
  },
  explorer: {
    id: 'explorer',
    title: 'File System Explorer',
    defaultWidth: 750,
    defaultHeight: 500,
  },
  settings: {
    id: 'settings',
    title: 'Control Panel Settings',
    defaultWidth: 600,
    defaultHeight: 450,
  },
  dashboard: {
    id: 'dashboard',
    title: 'Recruiter Dashboard',
    defaultWidth: 1024,
    defaultHeight: 768,
  },
  snake: {
    id: 'snake',
    title: 'Retro Snake Game',
    defaultWidth: 500,
    defaultHeight: 520,
  },
  'sample-1': {
    id: 'sample-1',
    title: 'Sample Node Monitor',
    defaultWidth: 450,
    defaultHeight: 300,
  },
  'sample-2': {
    id: 'sample-2',
    title: 'Sample System Telemetry',
    defaultWidth: 500,
    defaultHeight: 400,
  },
};
