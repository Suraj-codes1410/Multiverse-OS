# Contributing to Multiverse-OS

First off, thank you for showing interest in contributing to **Multiverse-OS**! This document provides guidelines and instructions for contributing to this developer portfolio and AI engine ecosystem.

---

## 🛠️ Development Setup

### Prerequisites

* **Node.js**: `v18` or higher
* **npm**: `v9` or higher

### Step-by-Step Installation

1. **Fork and Clone** the repository:
   ```bash
   git clone https://github.com/Suraj-codes1410/multiverse-os.git
   cd multiverse-os
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and configure your API keys (e.g. OpenRouter, Google Gemini, GitHub Token, Resend).

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Repository Structure

* `app/`: Next.js App Router pages, styles, layout, and API routes.
* `components/`: Reusable React components.
* `data/`: Local static JSON files and configuration schema.
* `lib/`: Core systems, including the Oracle AI Engine, providers, commands, and utility helpers.
* `scratch/`: Regression tests, helper diagnostic scripts, and testing utilities.
* `public/`: Public assets including images, models, and resume PDFs.

---

## 📜 Code Style & Quality Standards

To maintain a clean and reliable codebase, please adhere to the following rules:

### TypeScript & Linting
* Ensure all code is strongly typed. Avoid using `any` unless absolutely necessary.
* Run ESLint and TypeScript checks before submitting any changes:
  ```bash
  npm run lint
  npx tsc --noEmit
  ```

### Telemetry & Logging
* The Oracle AI Engine uses custom structured console logs (`GEMINI_REQUEST`, `SMART_ROUTE`, etc.) for regression testing and terminal output rendering. Do not remove or modify these tracing logs unless updating the corresponding test framework assertions.

### Formatting
* Run Prettier formatting verification before creating a Pull Request to prevent pipeline style errors:
  ```bash
  npm run format:check
  ```
* If files fail style checks, run Prettier locally to format the files:
  ```bash
  npx prettier --write .
  ```

---

## 🧪 Testing

We run integration and unit regression tests on the Oracle engine to verify classification, routing, failover resiliency, caching, and narrative generation accuracy.

Before submitting any Pull Request, make sure all regression tests pass successfully:
```bash
npx tsx scratch/oracle-regression-tests.ts
```

---

## 🚀 Branching & Commits

### Branch Naming Conventions
* Features: `feature/short-description`
* Bug fixes: `bugfix/short-description`
* Hotfixes: `hotfix/short-description`
* Releases: `release/vX.Y.Z`

### Commit Message Guidelines
Use clear, imperative descriptions for your commits. For example:
* `feat: Add Gemini fallback provider to Oracle Engine`
* `fix: Resolve layout shift on Contact Card mobile responsive view`
* `docs: Update release notes for v1.0.0`

---

## 📬 Submitting a Pull Request

1. Create a new feature/bugfix branch from `main`.
2. Commit your changes with descriptive commit messages.
3. Push to your branch and open a Pull Request against the main repository.
4. Ensure your PR description contains clear information about:
   * What problem was solved / what feature was added.
   * Steps you took to verify the changes.
   * Evidence of all tests passing.
