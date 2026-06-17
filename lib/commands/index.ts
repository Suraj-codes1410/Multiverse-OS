import { registry } from './registry';
import { helpCommand } from './help';
import { clearCommand } from './clear';
import { versionCommand } from './version';
import { aboutCommand } from './about';
import { skillsCommand } from './skills';
import { projectsCommand } from './projects';
import { experienceCommand } from './experience';
import { educationCommand } from './education';
import { achievementsCommand } from './achievements';
import { contactCommand } from './contact';
import { resumeCommand } from './resume';
import { homeCommand } from './home';
import { recruiterCommand } from './recruiter';
import { openCommand } from './open';
import { projectCommand } from './project';
import { reposCommand } from './repos';
import { repoCommand } from './repo';
import { findCommand } from './find';
import { relatedCommand } from './related';
import { showCommand } from './show';
import { whatCommand } from './what';
import { timelineCommand } from './timeline';
import { hackathonsCommand } from './hackathons';
import { milestonesCommand } from './milestones';

// Register core commands on module load
registry.register(helpCommand);
registry.register(clearCommand);
registry.register(versionCommand);
registry.register(aboutCommand);
registry.register(skillsCommand);
registry.register(projectsCommand);
registry.register(experienceCommand);
registry.register(educationCommand);
registry.register(achievementsCommand);
registry.register(contactCommand);
registry.register(resumeCommand);
registry.register(homeCommand);
registry.register(recruiterCommand);
registry.register(openCommand);
registry.register(projectCommand);
registry.register(reposCommand);
registry.register(repoCommand);
registry.register(findCommand);
registry.register(relatedCommand);
registry.register(showCommand);
registry.register(whatCommand);
registry.register(timelineCommand);
registry.register(hackathonsCommand);
registry.register(milestonesCommand);

export * from './types';
export * from './registry';
export * from './parser';
export * from './handler';
export { 
  helpCommand, 
  clearCommand, 
  versionCommand, 
  aboutCommand, 
  skillsCommand, 
  projectsCommand, 
  experienceCommand, 
  educationCommand, 
  achievementsCommand, 
  contactCommand, 
  resumeCommand,
  homeCommand,
  recruiterCommand,
  openCommand,
  projectCommand,
  reposCommand,
  repoCommand,
  findCommand,
  relatedCommand,
  showCommand,
  whatCommand,
  timelineCommand,
  hackathonsCommand,
  milestonesCommand
};
