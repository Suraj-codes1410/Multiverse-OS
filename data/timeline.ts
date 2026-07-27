export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'work' | 'education' | 'project' | 'milestone';
  skillsUsed?: string[];
}

export const timeline: TimelineEvent[] = [
  {
    id: 'multiverse-os-launch',
    date: '2024',
    title: 'Multiverse-OS Release',
    subtitle: 'Production launch',
    description: 'Published the first release of the visual portfolio shell and Oracle API sync client.',
    category: 'milestone',
  }
];
