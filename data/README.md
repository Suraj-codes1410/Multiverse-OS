# Data Directory

This directory stores static configurations, mock datasets, system databases, and local analytics/caching files.

## Files Structure
* `portfolio.json`: The core metadata mapping the candidate's bio, location, links, and contact parameters.
* `projects.json` / `skills.json` / `timeline.json`: Lists of structured portfolio properties.
* `oracle-analytics.json`: Running telemetric database logs of query execution times.
* `github-sync-cache.json` / `github-readme-cache.json`: Cache lists used to sync repository properties from the live GitHub REST API.
