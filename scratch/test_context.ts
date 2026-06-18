import { contextService } from '../lib/oracle/service';

async function testOracleContextBuilder() {
  console.log("\n=== Testing Oracle Context Builder ===");
  try {
    console.log("Loading and compiling structured Oracle context...");
    const context = await contextService.getContext();

    console.log("\n✔ Context Compiled Successfully!");
    console.log(`Generated At: ${context.generatedAt}`);

    console.log("\n1. Candidate Profile:");
    console.log(`  Name: ${context.profile.name}`);
    console.log(`  Title: ${context.profile.title}`);
    console.log(`  Location: ${context.profile.location}`);
    console.log(`  Degree: ${context.profile.education.degree} at ${context.profile.education.institution}`);

    console.log(`\n2. Technical Skills Context (Total: ${context.skills.length}):`);
    context.skills.slice(0, 5).forEach(skill => {
      console.log(`  - ${skill.name} (${skill.category}): level=${skill.level}`);
      console.log(`    Projects: ${skill.associatedProjects.join(', ') || 'None'}`);
      console.log(`    Repositories: ${skill.associatedRepositories.join(', ') || 'None'}`);
    });

    console.log(`\n3. Projects Context (Total: ${context.projects.length}):`);
    context.projects.slice(0, 5).forEach(project => {
      console.log(`  - ${project.title} (${project.year})`);
      console.log(`    Source: ${project.source}, Repository: ${project.associatedRepositoryName || 'None'}`);
    });

    console.log(`\n4. Repositories Context (Total: ${context.repositories.length}):`);
    context.repositories.slice(0, 5).forEach(repo => {
      console.log(`  - ${repo.name} [stars: ${repo.starsCount}, forks: ${repo.forksCount}]`);
      console.log(`    Language: ${repo.language}, Topics: ${repo.topics.join(', ') || 'None'}`);
      console.log(`    Complexity Rating: ${repo.intelligence?.complexityRating || 'None'}`);
      console.log(`    Architecture Pattern: ${repo.intelligence?.architecturePattern || 'None'}`);
    });

    console.log(`\n5. Achievements Context (Total: ${context.achievements.length}):`);
    context.achievements.slice(0, 5).forEach(ach => {
      console.log(`  - ${ach.title} (${ach.year})`);
      console.log(`    Related Projects: ${ach.associatedProjects.join(', ') || 'None'}`);
    });

    console.log(`\n6. Timeline Context (Total Years: ${context.timeline.length}):`);
    context.timeline.slice(0, 3).forEach(yearGroup => {
      console.log(`  Year ${yearGroup.year}:`);
      yearGroup.milestones.forEach(m => {
        console.log(`    * [${m.type}] ${m.title} - ${m.description}`);
      });
    });

    console.log(`\n7. Technology Relationships Context (Total: ${context.technologyRelationships.length}):`);
    context.technologyRelationships.slice(0, 5).forEach(tr => {
      console.log(`  - Technology: ${tr.technology}`);
      console.log(`    Related Techs: ${tr.relatedTechnologies.slice(0, 5).join(', ') || 'None'}`);
      console.log(`    Used in Projects: ${tr.usedInProjects.slice(0, 5).join(', ') || 'None'}`);
    });

    console.log(`\n8. Repository Relationships Context (Total: ${context.repositoryRelationships.length}):`);
    context.repositoryRelationships.slice(0, 5).forEach(rr => {
      console.log(`  - Repository: ${rr.repositoryName}`);
      console.log(`    Associated Project: ${rr.associatedProject || 'None'}`);
      console.log(`    Skills Required: ${rr.skillsRequired.join(', ') || 'None'}`);
      console.log(`    Complexity Rating: ${rr.complexity}`);
    });

    console.log("\n=== Oracle Context Builder Verification Complete ===");
  } catch (error) {
    console.error('❌ Error during Context Builder verification:', error);
  }
}

testOracleContextBuilder();
