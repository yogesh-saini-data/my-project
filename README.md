# ⚡ GitHub Actions Guide & Interactive Laboratory ("Actions Lab")

A modern, professional, fully responsive, zero-dependency static web platform featuring 100 documentation topics and a full **Interactive GitHub Actions Workflow Simulator & Learning Laboratory**.

---

## 🌟 Key Upgraded Features

### 1. 📚 Learn (Documentation Hub)
- **100 Topic Modules**: Organized into 15 logical categories (Getting Started, Core Concepts, Workflow Syntax, Variables & Secrets, Dependencies, Runners, Testing & Building, Artifacts & Cache, Security, Environments, Reusability, CI/CD, Advanced, Real Projects, Reference).
- **Dynamic TOC & Progress Bar**: Table of Contents generated automatically from headings with `localStorage` section completion tracking.

### 2. 🧪 Actions Lab (Workflow Simulator Engine)
- **Enhanced YAML Editor**: Line numbers, live syntax validator, reset, format, copy.
- **Event Trigger Matcher**: Educational simulation that tests whether your event (`push`, `pull_request`, `schedule`, `workflow_dispatch`) and target branch (`main`, `feature/login`) match the workflow `on:` rules.
- **Visual Workflow DAG Graph**: Live animated execution nodes (`○ Queued`, `● Running`, `✓ Success`, `✕ Failed`). Supports **Step-by-step execution mode** (`[Next Step →]`).
- **Streaming Terminal Console Logs**: Realistic runner console log outputs with pause, resume, and clear controls.
- **Diagnostic Failure Panel ("Why Did This Fail?")**: Educational failure simulation showing the Problem, Cause, How to Fix, and Code Snippets.
- **Step, Action & Runner Inspectors**: Click any node to break down `actions/checkout@v4` parameters, runner CPU/Memory usage, and workspace `/home/runner/work` directory tree states before/after checkout and build.
- **Secrets & Context Evaluator**: Live `${{ github.ref }}` expression evaluation and secret masking (`🔐 API_KEY=********`).

### 3. 🎯 Interactive Challenges & Bug Fixes
- **10+ Hands-On Exercises**: Categorized by Beginner, Intermediate, and Advanced levels. Load challenges directly into the Actions Lab with 1 click.

### 4. 🛠️ Visual CI/CD Pipeline Builder
- **Clickable Block Palette**: Stack blocks (`Checkout`, `Setup Node`, `Install`, `Test`, `Build`, `Artifact`, `Deploy`) and automatically generate clean GitHub Actions YAML.

---

## 🚀 How to Run

### Option 1: Direct File Opening
Simply open `index.html` directly in any modern web browser (Chrome, Firefox, Edge, Safari). No installation, build steps, or backend required!

### Option 2: Local Web Server (Optional)
```bash
# Using Python
python -m http.server 8000

# Using Node npx
npx serve .
```

---

## 🌐 Production Deployment
Deploy effortlessly as a static web app to **GitHub Pages**, **Netlify**, or **Vercel**.