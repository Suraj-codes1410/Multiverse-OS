# Multiverse OS CI/CD Infrastructure Documentation

This document describes the design, structure, and maintenance guidelines for the production-grade CI/CD automation pipeline configured for Multiverse OS.

---

## 🛠 Workflow Architecture

The pipeline is split into three independent, parallelized validation streams orchestrating static checks, compilation, and functional test passes to ensure swift feedback and optimal pipeline usage:

```
                  ┌─────────────── GitHub Push / PR / Manual Dispatch ───────────────┐
                  │                                                                  │
                  ▼                                                                  ▼
        ┌──────────────────┐               ┌──────────────────┐             ┌──────────────────┐
        │  Validate Job    │               │  Typecheck Job   │             │ Build & Test Job │
        ├──────────────────┤               ├──────────────────┤             ├──────────────────┤
        │ • Checkout code  │               │ • Checkout code  │             │ • Checkout code  │
        │ • Install deps   │               │ • Install deps   │             │ • Install deps   │
        │ • Lockfile check │               │ • tsc --noEmit   │             │ • next build     │
        │ • Prettier check │               └──────────────────┘             │ • Regression tests│
        │ • ESLint check   │                                                │ • Upload bundle  │
        └──────────────────┘                                                └──────────────────┘
```

---

## 📋 Jobs Registry

### 1. `validate` (Code Quality & Security Validation)
* **Goal**: Validate formatting consistency, file system safety, and strict lint compliance before running heavier compilation workloads.
* **Steps**:
  * Check out target branch workspace.
  * Initialize **Node.js (v22)** and load cached packages.
  * Verify `package-lock.json` matches project contents to prevent out-of-sync dependencies.
  * Confirm Prettier style check (`npm run format:check`) has zero warnings.
  * Confirm ESLint analysis (`npm run lint`) returns zero runtime violations.

### 2. `typecheck` (TypeScript Compilation Check)
* **Goal**: Ensure absolute type safety across components, utilities, and API routes.
* **Command**: Runs `npx tsc --noEmit` to validate compiler rules without generating build assets.

### 3. `build-test` (Build & Integration Testing)
* **Goal**: Confirm bundle generation succeeds and verify API route integration.
* **Steps**:
  * Build the Next.js static and dynamic assets bundle (`npm run build`).
  * Run the **Oracle Integration & Regression Suite** (`npm run test`) validating smart router parameters, narrative engines, and caching strategies.
  * **Build Artifacts**:
    * **Success**: Uploads the production-ready `.next/` bundle for 7 days retention.
    * **Failure**: Automatically grabs compilation and command logs (`npm-debug.log`, `.next/**/*.log`) and uploads them to simplify debugging.

---

## ⚡ Concurrency & Caching Strategy

To minimize cost and pipeline execution time:
* **Workflow Concurrency**: Configured `concurrency.cancel-in-progress: true`. If a new commit is pushed to an active Pull Request, the previous pipeline run is aborted instantly to save compute minutes.
* **Dependency Caching**: Utilizes `actions/setup-node@v4` with cache option set to `npm`. The package registry cache is preserved across runs to speed up the `npm ci` phase.

---

## 🔑 Required Secrets

The pipeline integrates the following parameters via GitHub Repository Secrets:

| Secret Name | Purpose | Failure Mode |
| :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Connects the integration test suite to the OpenRouter/Gemini model engines during testing. | If missing, the test suite falls back to local cache/mock databases, allowing pull requests from external forks to pass safely. |

*To add secrets: Navigate to your repository on GitHub -> Settings -> Secrets and Variables -> Actions -> New Repository Secret.*

---

## 💻 Manual Executions

The workflow is configured with `workflow_dispatch`, enabling manual triggers from the GitHub UI:
1. Navigate to the **Actions** tab on your GitHub repository.
2. Select **Multiverse OS CI/CD Pipeline** on the left menu.
3. Click the **Run workflow** dropdown, choose your target branch, and click **Run workflow**.

---

## 🔍 Debugging Failures

When a step fails, take these steps to diagnose the issue:
1. **Dependency Sync Failures**: If the `Verify Lockfile Integrity` step fails, check if you updated `package.json` without updating `package-lock.json`. Run `npm install` locally to sync them, then commit the change.
2. **Formatting Failures**: Prettier flags unformatted files. Fix this locally by running:
   ```bash
   npm run format:check   # To check
   npx prettier --write . # To automatically format files before committing
   ```
3. **Lint Failures**: If ESLint returns errors (e.g. Hooks violations), review the printed terminal logs showing file paths and line numbers. Run `npm run lint` locally to fix.
4. **Build Logs**: If Next.js compilation fails, download the `build-failure-logs` zip artifact from the finished workflow run page to review the compile trace.

---

## ➕ Extending the Pipeline

To add future automated check jobs:
1. Open `.github/workflows/ci.yml`.
2. Append a new job definition under the `jobs:` section:
   ```yaml
   security-scan:
     name: CodeQL Security Scan
     runs-on: ubuntu-latest
     steps:
       - name: Checkout Code
         uses: actions/checkout@v4
       # Add scanning actions here
   ```
3. Commit and push the updated workflow.

---

## 💡 Optional Enhancements

Consider introducing the following integrations as the project scales:

1. **Dependabot Version Alerts**:
   * *Description*: Automatically checks package dependencies for vulnerability reports and creates PRs to update them.
   * *Activation*: Add a `.github/dependabot.yml` config file.
2. **CodeQL Static Analysis**:
   * *Description*: Scans the repository for common software vulnerabilities and security risks.
   * *Activation*: Set up GitHub Advanced Security CodeQL workflow.
3. **Lighthouse CI (LHCI)**:
   * *Description*: Analyzes mobile and desktop SEO, accessibility, performance, and best practices scores directly inside the PR lifecycle.
4. **Next.js Bundle Analyzer**:
   * *Description*: Generates visual graphs of component dependencies to identify heavy dependencies bloat.
