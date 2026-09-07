# Contributing Guide

Thank you for considering contributing to **4BrainCells**! This guide will help you get up‑and‑running quickly and ensure contributions follow the project's standards.

## Getting Started
1. **Fork the repo** on GitHub and clone your fork:
   ```bash
   git clone https://github.com/your-username/4BrainCells.git
   cd 4BrainCells/institutional-memory
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Create a `.env.local`** with an OpenAI or Gemini API key (if you plan to test the Why Chat). See the README for details.
4. **Run the dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app.

## Development Workflow
- **Branching**: Create a descriptive branch for each feature or bug fix, e.g. `feature/add-node-modal` or `bugfix/graph‑type‑error`.
- **Commit messages**: Use the conventional format `type: description` (e.g. `feat: add new node type`).
- **Testing**: Run the linter and TypeScript checks before pushing:
  ```bash
  npm run lint && npx tsc --noEmit
  ```
- **Pull Request**: Push your branch to your fork and open a PR targeting `main`. The repository has branch‑protection rules, so your PR will need at least one approval before merging.

## Code Style & Guidelines
- Use **TypeScript** types everywhere; avoid `any` unless absolutely necessary.
- Follow the existing code‑base's formatting (Prettier + ESLint). Run `npm run lint` to auto‑fix.
- Keep UI components small and reusable. Follow the existing naming conventions (`PascalCase` for components, `camelCase` for variables).
- Write clear and concise comments for complex logic, especially around the graph traversal and AI integration.

## Documentation
- Add or update markdown files under the `/docs` folder for any new features.
- Keep the **README** up‑to‑date with installation, usage, and contribution instructions.

## Issues & Support
- Use GitHub Issues to report bugs or propose features.
- Tag issues with appropriate labels (`bug`, `enhancement`, `question`).

We appreciate your help in making institutional memory more accessible for everyone!
