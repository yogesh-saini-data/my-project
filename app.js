/* ==========================================
   GITHUB ACTIONS INTERACTIVE LEARNING HUB
   Core Application Engine & Simulator Lab
   ========================================== */

(function() {
  'use strict';

  // --- STATE MANAGEMENT ---
  const state = {
    currentTopicId: '01-what-is-github-actions',
    activeViewport: 'view-docs',
    theme: localStorage.getItem('gha_theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'),
    completedTopics: new Set(JSON.parse(localStorage.getItem('gha_completed') || '[]')),
    completedChallenges: new Set(JSON.parse(localStorage.getItem('gha_challenges_completed') || '[]')),
    
    // Simulator state
    stepByStepMode: false,
    simPaused: false,
    simInterval: null,
    currentStepIndex: 0,
    simStepsList: [],
    
    // Pipeline builder state
    builderBlocks: ['checkout', 'install', 'test']
  };

  // --- CATEGORIES & TOPICS DATA (100 Items) ---
  const CATEGORIES = [
    { id: 'getting-started', title: 'GETTING STARTED' },
    { id: 'core-concepts', title: 'CORE CONCEPTS' },
    { id: 'workflow-syntax', title: 'WORKFLOW SYNTAX' },
    { id: 'variables-data', title: 'VARIABLES & DATA' },
    { id: 'dependencies', title: 'DEPENDENCIES' },
    { id: 'runners', title: 'RUNNERS' },
    { id: 'testing-building', title: 'TESTING & BUILDING' },
    { id: 'artifacts-cache', title: 'ARTIFACTS & CACHE' },
    { id: 'security', title: 'SECURITY' },
    { id: 'environments', title: 'ENVIRONMENTS' },
    { id: 'reusability', title: 'REUSABILITY' },
    { id: 'cicd', title: 'CI/CD' },
    { id: 'advanced', title: 'ADVANCED' },
    { id: 'real-projects', title: 'REAL PROJECTS' },
    { id: 'reference', title: 'REFERENCE' }
  ];

  const TOPICS = [
    {
      id: '01-what-is-github-actions',
      num: '01',
      category: 'getting-started',
      title: 'What is GitHub Actions?',
      summary: 'Automate, customize, and execute software development workflows right in your repository.',
      contentHtml: `
        <p><strong>GitHub Actions</strong> is an integrated Continuous Integration and Continuous Delivery (CI/CD) platform that automates your build, test, and deployment pipelines directly inside GitHub.</p>
        <h2>Why Use GitHub Actions?</h2>
        <ul>
          <li><strong>Native Integration:</strong> Workflows live right alongside your code in <code>.github/workflows/</code>.</li>
          <li><strong>Event-Driven:</strong> Trigger on pushes, pull requests, releases, issue events, or cron timers.</li>
          <li><strong>Matrix Builds:</strong> Automatically test across Linux, Windows, macOS, and multiple runtime versions simultaneously.</li>
          <li><strong>Vast Marketplace:</strong> Access tens of thousands of verified community actions.</li>
        </ul>
        <div class="callout tip">
          <div class="callout-title">💡 Pro Tip</div>
          GitHub Actions provides free monthly build minutes for public repositories and generous quotas for private accounts.
        </div>
      `
    },
    {
      id: '02-why-github-actions',
      num: '02',
      category: 'getting-started',
      title: 'Why GitHub Actions?',
      summary: 'Understanding the key benefits compared to external legacy CI systems.',
      contentHtml: `
        <p>Traditional CI systems required external webhook management, separate auth tokens, and complex server maintenance. GitHub Actions unifies all of this within your repository.</p>
        <div class="table-wrapper">
          <table class="custom-table">
            <thead>
              <tr><th>Feature</th><th>Legacy CI (Jenkins)</th><th>GitHub Actions</th></tr>
            </thead>
            <tbody>
              <tr><td>Setup</td><td>External Server Config</td><td>Pure YAML in <code>.github/workflows</code></td></tr>
              <tr><td>Auth</td><td>Manual SSH Keys</td><td>Automatic <code>secrets.GITHUB_TOKEN</code></td></tr>
              <tr><td>Triggers</td><td>Webhooks required</td><td>Native GitHub Repository Events</td></tr>
            </tbody>
          </table>
        </div>
      `
    },
    {
      id: '03-cicd-fundamentals',
      num: '03',
      category: 'getting-started',
      title: 'CI/CD Fundamentals',
      summary: 'Learn Continuous Integration, Continuous Delivery, and Continuous Deployment.',
      contentHtml: `
        <p><strong>CI/CD</strong> forms the foundation of modern automated software engineering:</p>
        <ul>
          <li><strong>Continuous Integration (CI):</strong> Automated building and testing of every pull request.</li>
          <li><strong>Continuous Delivery (CD):</strong> Preparing release packages automatically.</li>
          <li><strong>Continuous Deployment (CD):</strong> Shipping code straight to production servers after passing tests.</li>
        </ul>
      `
    },
    {
      id: '04-github-actions-architecture',
      num: '04',
      category: 'getting-started',
      title: 'GitHub Actions Architecture',
      summary: 'Explore Workflows, Jobs, Runners, Steps, and Actions.',
      widget: 'architecture',
      contentHtml: `<p>Click the interactive components in the diagram below to inspect each architectural layer:</p>`
    },
    {
      id: '05-workflow',
      num: '05',
      category: 'core-concepts',
      title: 'Workflow',
      summary: 'An automated configurable process defined in a .yml file.',
      contentHtml: `
        <p>A <strong>Workflow</strong> is an automated process defined in a YAML file inside <code>.github/workflows/</code>.</p>
        <div class="code-block-wrapper">
          <div class="code-block-header"><span>.github/workflows/ci.yml</span></div>
          <pre><code><span class="hl-key">name</span>: <span class="hl-string">CI Pipeline</span>
<span class="hl-key">on</span>: [<span class="hl-string">push</span>]
<span class="hl-key">jobs</span>:
  <span class="hl-key">build</span>:
    <span class="hl-key">runs-on</span>: <span class="hl-string">ubuntu-latest</span>
    <span class="hl-key">steps</span>:
      - <span class="hl-key">run</span>: <span class="hl-string">echo "Workflow Executed!"</span></code></pre>
        </div>
      `
    },
    {
      id: '06-events',
      num: '06',
      category: 'core-concepts',
      title: 'Events',
      summary: 'Specific activity that triggers a workflow run.',
      widget: 'event-selector',
      contentHtml: `<p>Select an event trigger below to view its YAML structure:</p>`
    },
    { id: '07-jobs', num: '07', category: 'core-concepts', title: 'Jobs', summary: 'Set of steps executing on the same runner environment.', contentHtml: '<p>Jobs run in parallel by default unless configured using <code>needs:</code>.</p>' },
    { id: '08-steps', num: '08', category: 'core-concepts', title: 'Steps', summary: 'Individual tasks executing commands or actions.', contentHtml: '<p>Steps run sequentially within a job workspace.</p>' },
    { id: '09-actions', num: '09', category: 'core-concepts', title: 'Actions', summary: 'Reusable building blocks.', contentHtml: '<p>Actions are imported via the <code>uses:</code> key (e.g. <code>actions/checkout@v4</code>).</p>' },
    { id: '10-runners', num: '10', category: 'core-concepts', title: 'Runners', summary: 'Servers executing jobs.', contentHtml: '<p>Hosted Ubuntu, Windows, macOS runners or self-hosted servers.</p>' },
    { id: '13-workflow-syntax-explainer', num: '13', category: 'workflow-syntax', title: 'Workflow Syntax Explainer', summary: 'Click keys to view technical specifications.', widget: 'yaml-explainer', contentHtml: '<p>Click keywords on the left to reveal technical descriptions:</p>' },
    { id: '15-execution-flow-breakdown', num: '15', category: 'workflow-syntax', title: 'What Happens After Git Push?', summary: 'Interactive 17-step lifecycle timeline.', widget: 'execution-flow', contentHtml: '<p>Complete 17-stage execution timeline:</p>' },
    {
      id: '20-environment-variables-and-secrets',
      num: '20',
      category: 'variables-data',
      title: 'Environment Variables & Secrets',
      summary: 'Store sensitive data securely and pass configuration values into your workflows.',
      contentHtml: `
        <p>In GitHub Actions, you can configure <strong>Environment Variables</strong> and <strong>Encrypted Secrets</strong> to pass dynamic data and sensitive credentials to your job steps without exposing them in public source code.</p>

        <h2>1. Default Environment Variables</h2>
        <p>GitHub Actions automatically sets default environment variables on every runner, such as <code>GITHUB_REPOSITORY</code>, <code>GITHUB_REF</code>, <code>GITHUB_SHA</code>, and <code>GITHUB_ACTOR</code>.</p>

        <h2>2. Custom Environment Variables</h2>
        <p>You can define environment variables at the workflow, job, or step level using the <code>env</code> key:</p>
        <div class="code-block-wrapper">
          <div class="code-block-header"><span>.github/workflows/env-demo.yml</span></div>
          <pre><code><span class="hl-key">name</span>: <span class="hl-string">Environment Variable Example</span>
<span class="hl-key">on</span>: [<span class="hl-string">push</span>]

<span class="hl-key">env</span>:
  <span class="hl-key">NODE_ENV</span>: <span class="hl-string">production</span>

<span class="hl-key">jobs</span>:
  <span class="hl-key">build</span>:
    <span class="hl-key">runs-on</span>: <span class="hl-string">ubuntu-latest</span>
    <span class="hl-key">steps</span>:
      - <span class="hl-key">name</span>: <span class="hl-string">Print Node Env</span>
        <span class="hl-key">run</span>: <span class="hl-string">echo "Running in $NODE_ENV mode"</span></code></pre>
        </div>

        <h2>3. GitHub Encrypted Secrets</h2>
        <p>Secrets are encrypted parameters stored in repository settings (<strong>Settings ➔ Secrets and variables ➔ Actions</strong>). Pass them securely into step commands using the <code>secrets</code> context:</p>
        <div class="code-block-wrapper">
          <div class="code-block-header"><span>Using Secrets in Steps</span></div>
          <pre><code><span class="hl-key">steps</span>:
  - <span class="hl-key">name</span>: <span class="hl-string">Deploy with API Token</span>
    <span class="hl-key">env</span>:
      <span class="hl-key">API_TOKEN</span>: <span class="hl-string">\${{ secrets.MY_API_TOKEN }}</span>
    <span class="hl-key">run</span>: <span class="hl-string">curl -H "Authorization: Bearer $API_TOKEN" https://api.example.com/deploy</span></code></pre>
        </div>

        <div class="callout warning">
          <div class="callout-title">⚠️ Security Warning</div>
          Never hardcode tokens or API keys inside <code>.env</code> files committed to your Git repository. Always use GitHub Encrypted Secrets.
        </div>
      `
    },
    { id: '30-github-context-explorer', num: '30', category: 'variables-data', title: 'GitHub Context Explorer', summary: 'Inspect context values.', widget: 'context-explorer', contentHtml: '<p>Interactive context inspector:</p>' },
    { id: '46-matrix-strategy-visualizer', num: '46', category: 'testing-building', title: 'Matrix Strategy Visualizer', summary: 'Matrix job generator.', widget: 'matrix-visualizer', contentHtml: '<p>Combinational matrix job grid:</p>' },
    { id: '100-github-actions-cheat-sheet', num: '100', category: 'reference', title: 'GitHub Actions Cheat Sheet', summary: 'Quick lookup reference.', widget: 'cheat-sheet', contentHtml: '<p>Searchable glossary and cheat cards:</p>' }
  ];

  // Detailed Topic Title & Content Mapping Engine for All 100 Topics
  const TOPIC_DETAILS = {
    '07': { title: 'Jobs & Execution Units', summary: 'Understand how jobs group steps and run on isolated environments.', code: 'jobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm run build' },
    '08': { title: 'Steps & Command Execution', summary: 'Run inline shell scripts or invoke reusable GitHub Actions.', code: 'steps:\n  - name: Run Tests\n    run: npm test' },
    '09': { title: 'Actions & Reusable Modules', summary: 'Use community or custom actions with the uses: syntax.', code: 'steps:\n  - uses: actions/checkout@v4\n  - uses: actions/setup-node@v4\n    with:\n      node-version: 20' },
    '10': { title: 'GitHub-Hosted & Self-Hosted Runners', summary: 'Compare cloud VMs (Ubuntu, Windows, macOS) with self-hosted machines.', code: 'runs-on: self-hosted\n# Or hosted:\nruns-on: ubuntu-latest' },
    '11': { title: 'Understanding YAML Basics for Actions', summary: 'Key-value pairs, lists, scalars, indentation, and multiline block scalars.', code: 'name: YAML Demo\non: [push]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: |\n          echo "Line 1"\n          echo "Line 2"' },
    '12': { title: 'The .github/workflows Directory', summary: 'Structure and configuration rules for placing workflow files in repositories.', code: '# Folder location:\n.github/workflows/main.yml\n.github/workflows/deploy.yml' },
    '14': { title: 'Triggers: Push, Pull Request & Workflow Dispatch', summary: 'Configure push branches, PR target branches, and manual execution buttons.', code: 'on:\n  push:\n    branches: [main, release/*]\n  pull_request:\n    branches: [main]\n  workflow_dispatch:' },
    '16': { title: 'Scheduled Workflows (Cron Triggers)', summary: 'Run workflows automatically on periodic cron intervals.', code: 'on:\n  schedule:\n    - cron: "0 0 * * *"' },
    '17': { title: 'Filter Triggers by Path & Tag', summary: 'Trigger workflows only when specific files or Git tags are changed.', code: 'on:\n  push:\n    paths:\n      - "src/**"\n    tags:\n      - "v*"' },
    '18': { title: 'Handling Pull Request Events', summary: 'Differentiate pull_request, pull_request_target, and opened/synchronize types.', code: 'on:\n  pull_request:\n    types: [opened, synchronize, reopened]' },
    '19': { title: 'External Events with repository_dispatch', summary: 'Trigger workflow runs via webhooks and external REST API calls.', code: 'on:\n  repository_dispatch:\n    types: [deploy_event]' },
    '21': { title: 'Using GitHub Secrets in Workflows', summary: 'Pass encrypted secrets into steps via ${{ secrets.TOKEN_NAME }}.', code: 'steps:\n  - run: echo "Token authenticated"\n    env:\n      AUTH: ${{ secrets.MY_SECRET }}' },
    '22': { title: 'Workflow Commands & GITHUB_OUTPUT', summary: 'Pass outputs between steps using $GITHUB_OUTPUT.', code: 'steps:\n  - id: step1\n    run: echo "result=success" >> $GITHUB_OUTPUT\n  - run: echo "Output was ${{ steps.step1.outputs.result }}"' },
    '23': { title: 'Setting Environment Files ($GITHUB_ENV)', summary: 'Dynamically assign environment variables across workflow steps.', code: 'steps:\n  - run: echo "BUILD_NUM=123" >> $GITHUB_ENV\n  - run: echo "Build number is $BUILD_NUM"' },
    '24': { title: 'Masking Values in Logs ($GITHUB_TOKEN)', summary: 'Prevent confidential keys from printing in raw workflow logs.', code: 'steps:\n  - run: echo "::add-mask::$MY_SECRET_KEY"' },
    '25': { title: 'GitHub Default Context Variables', summary: 'Explore github.sha, github.ref, github.actor, and github.repository.', code: 'steps:\n  - run: echo "Triggered by ${{ github.actor }} on commit ${{ github.sha }}"' },
    '26': { title: 'Job Outputs & Inter-Job Data Transfer', summary: 'Export values from one job and consume them in dependent jobs.', code: 'jobs:\n  job1:\n    outputs:\n      ver: ${{ steps.s1.outputs.ver }}\n  job2:\n    needs: job1\n    steps:\n      - run: echo "${{ needs.job1.outputs.ver }}"' },
    '27': { title: 'Caching npm & Yarn Dependencies', summary: 'Accelerate build times using actions/cache for node_modules.', code: 'steps:\n  - uses: actions/cache@v4\n    with:\n      path: ~/.npm\n      key: ${{ runner.os }}-node-${{ hashFiles("**/package-lock.json") }}' },
    '28': { title: 'Caching Pip & Maven Packages', summary: 'Cache Python PyPI packages and Java Maven artifacts.', code: 'steps:\n  - uses: actions/setup-python@v5\n    with:\n      cache: "pip"' },
    '29': { title: 'Custom Cache Keys and Restores', summary: 'Optimize primary cache keys and fallback restore-keys strategy.', code: 'with:\n  key: ${{ runner.os }}-build-${{ github.sha }}\n  restore-keys: |\n    ${{ runner.os }}-build-' },
    '31': { title: 'Matrix Builds: Multi-Version Testing', summary: 'Run job variants simultaneously across Node, Python, and OS grids.', code: 'strategy:\n  matrix:\n    os: [ubuntu-latest, windows-latest]\n    node: [18, 20, 22]' },
    '32': { title: 'Matrix Include & Exclude Rules', summary: 'Fine-tune matrix combinations by adding or removing specific target configurations.', code: 'strategy:\n  matrix:\n    os: [ubuntu-latest, macos-latest]\n    include:\n      - os: ubuntu-latest\n        coverage: true' },
    '33': { title: 'Matrix Fail-Fast & Max-Parallel', summary: 'Control concurrency limits and failure handling in matrix builds.', code: 'strategy:\n  fail-fast: false\n  max-parallel: 2' },
    '34': { title: 'Building & Testing Node.js Apps', summary: 'Complete setup for npm test, linting, and building production bundles.', code: 'steps:\n  - uses: actions/setup-node@v4\n  - run: npm ci\n  - run: npm test' },
    '35': { title: 'Building & Testing Python Projects', summary: 'Set up Virtualenv, Pytest, and Flake8 static code analysis.', code: 'steps:\n  - uses: actions/setup-python@v5\n  - run: pip install pytest && pytest' },
    '36': { title: 'Building Java Apps with Maven & Gradle', summary: 'Configure JDK versions, execute Maven verify, and Gradle wrapper builds.', code: 'steps:\n  - uses: actions/setup-java@v4\n    with:\n      java-version: "21"\n      distribution: "temurin"' },
    '37': { title: 'Building Go Applications', summary: 'Compile Go binaries and execute go test across package directories.', code: 'steps:\n  - uses: actions/setup-go@v5\n    with:\n      go-version: "^1.22"\n  - run: go test ./...' },
    '38': { title: 'Docker Build & Push Workflows', summary: 'Build Docker container images and push to Docker Hub or GHCR.', code: 'steps:\n  - uses: docker/build-push-action@v5\n    with:\n      push: true\n      tags: user/app:latest' },
    '39': { title: 'Container Jobs in Actions', summary: 'Execute job commands inside dedicated Docker containers on the runner.', code: 'jobs:\n  test:\n    runs-on: ubuntu-latest\n    container: node:20' },
    '40': { title: 'Services Containers (Postgres, Redis)', summary: 'Spin up sidecar database containers for integration tests.', code: 'services:\n  postgres:\n    image: postgres:15\n    ports: ["5432:5432"]' },
    '41': { title: 'Uploading Build Artifacts', summary: 'Store build outputs, binaries, and reports using actions/upload-artifact.', code: 'steps:\n  - uses: actions/upload-artifact@v4\n    with:\n      name: dist-files\n      path: dist/' },
    '42': { title: 'Downloading Artifacts in Downstream Jobs', summary: 'Retrieve artifacts uploaded by previous workflow jobs.', code: 'steps:\n  - uses: actions/download-artifact@v4\n    with:\n      name: dist-files' },
    '43': { title: 'Retention Days & Artifact Limits', summary: 'Configure artifact expiration periods to optimize storage quotas.', code: 'with:\n  name: build-logs\n  path: logs/\n  retention-days: 7' },
    '44': { title: 'Security: GITHUB_TOKEN Permissions', summary: 'Apply the principle of least privilege using explicit permissions blocks.', code: 'permissions:\n  contents: read\n  issues: write\n  pull-requests: write' },
    '45': { title: 'Security: Preventing Script Injection', summary: 'Sanitize untrusted user input from pull requests and issue titles.', code: '# Safe:\nenv:\n  TITLE: ${{ github.event.issue.title }}\nrun: echo "$TITLE"' },
    '47': { title: 'Security: OpenID Connect (OIDC)', summary: 'Authenticate securely with AWS, Azure, and GCP without long-lived keys.', code: 'permissions:\n  id-token: write\n  contents: read' },
    '48': { title: 'Deploying to GitHub Pages', summary: 'Publish static documentation and web applications to Pages.', code: 'uses: actions/deploy-pages@v4' },
    '49': { title: 'Deploying to AWS (S3 & EC2)', summary: 'Deploy build bundles to Amazon Web Services infra.', code: 'uses: aws-actions/configure-aws-credentials@v4' },
    '50': { title: 'Deploying to Azure App Service', summary: 'Publish web applications to Azure App Services.', code: 'uses: azure/webapps-deploy@v3' },
    '51': { title: 'Deploying to Google Cloud Run', summary: 'Deploy containerized web services to GCP Cloud Run.', code: 'uses: google-github-actions/deploy-cloudrun@v2' },
    '52': { title: 'Environments & Manual Approvals', summary: 'Set up protection rules, deployment gates, and required reviewers.', code: 'environment:\n  name: production\n  url: https://example.com' },
    '53': { title: 'Reusable Workflows (workflow_call)', summary: 'Share standardized workflow templates across multiple repositories.', code: 'on:\n  workflow_call:' },
    '54': { title: 'Composite Actions', summary: 'Bundle multiple steps into a single reusable custom action.', code: 'runs:\n  using: "composite"\n  steps:\n    - run: echo "Composite step"' },
    '55': { title: 'Creating Custom JavaScript Actions', summary: 'Write Node.js actions using @actions/core and @actions/github.', code: 'const core = require("@actions/core");\ncore.setOutput("result", "done");' },
    '56': { title: 'Creating Custom Docker Actions', summary: 'Package shell or Python tools inside Docker containers as actions.', code: 'runs:\n  using: "docker"\n  image: "Dockerfile"' },
    '57': { title: 'Concurrency & Race Condition Prevention', summary: 'Cancel outdated in-flight builds when new commits are pushed.', code: 'concurrency:\n  group: ${{ github.ref }}\n  cancel-in-progress: true' },
    '58': { title: 'Conditional Step Execution (if:)', summary: 'Execute steps selectively based on status functions or boolean conditions.', code: 'if: success() && github.ref == "refs/heads/main"' },
    '59': { title: 'Status Check Functions: success(), failure(), always()', summary: 'Run cleanup tasks or alert notifications when jobs fail.', code: 'if: failure()\nrun: echo "Job failed! Sending alert..."' },
    '60': { title: 'Continue-on-Error & Allow Failure', summary: 'Prevent non-critical step failures from blocking workflow execution.', code: 'continue-on-error: true' },
    '61': { title: 'Timeout Management for Jobs & Steps', summary: 'Set maximum execution time limits to prevent hung jobs.', code: 'timeout-minutes: 15' },
    '62': { title: 'Self-Hosted Runner Installation & Setup', summary: 'Deploy runner agents on your own private infrastructure or cloud instances.', code: './config.sh --url https://github.com/user/repo --token XXX' },
    '63': { title: 'Autoscaling Self-Hosted Runners', summary: 'Scale runner instances automatically using Kubernetes or ARC (Actions Runner Controller).', code: '# ARC RunnerDeployment definition' },
    '64': { title: 'Security Best Practices for Self-Hosted Runners', summary: 'Isolate self-hosted runners to prevent untrusted PR code execution.', code: '# Avoid self-hosted runners on public repos' },
    '65': { title: 'Monorepo Workflows with Path Filtering', summary: 'Run targeted builds depending on changed directories in monorepos.', code: 'on:\n  push:\n    paths:\n      - "packages/backend/**"' },
    '66': { title: 'PR Labeling & Automated Triage', summary: 'Label issues and PRs automatically based on file patterns.', code: 'uses: actions/labeler@v5' },
    '67': { title: 'Automated Dependency Updates (Dependabot)', summary: 'Automate security patches and package upgrades with Dependabot.', code: '# .github/dependabot.yml' },
    '68': { title: 'Linting YAML Files (actionlint)', summary: 'Catch workflow syntax errors using static analysis tools.', code: '- run: actionlint' },
    '69': { title: 'CodeQL Static Application Security Testing (SAST)', summary: 'Scan source code for vulnerability patterns automatically.', code: 'uses: github/codeql-action/analyze@v3' },
    '70': { title: 'Container Vulnerability Scanning (Trivy / Grype)', summary: 'Scan container images for CVE vulnerabilities before deployment.', code: 'uses: aquasecurity/trivy-action@master' },
    '71': { title: 'Slack & Teams Failure Notifications', summary: 'Send instant chat alerts to team channels on build failure.', code: 'uses: slackapi/slack-github-action@v1.26.0' },
    '72': { title: 'Automated Release Creation & Changelogs', summary: 'Generate release notes and upload release binaries on Git tags.', code: 'uses: softprops/action-gh-release@v2' },
    '73': { title: 'Publishing Packages to npm & PyPI', summary: 'Publish software artifacts to global registry platforms.', code: '- run: npm publish\n  env:\n    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}' },
    '74': { title: 'Publishing Container Images to GHCR', summary: 'Store container images inside GitHub Container Registry.', code: '- run: docker push ghcr.io/owner/image:latest' },
    '75': { title: 'Testing Pull Requests with Local Kind / Minikube', summary: 'Run Kubernetes integration tests inside GitHub Actions.', code: 'uses: engineerd/setup-kind@v0.5.0' },
    '76': { title: 'End-to-End Testing with Cypress & Playwright', summary: 'Run automated browser tests against staging deployments.', code: '- run: npx playwright test' },
    '77': { title: 'Performance Testing with k6', summary: 'Execute load and stress testing scripts in CI.', code: 'uses: grafana/k6-action@v0.3.1' },
    '78': { title: 'Terraform & Infrastructure as Code (IaC) Pipelines', summary: 'Run terraform fmt, plan, and apply inside automated workflows.', code: '- run: terraform plan' },
    '79': { title: 'Ansible Playbook Execution in Actions', summary: 'Automate infrastructure configuration management.', code: '- run: ansible-playbook site.yml' },
    '80': { title: 'GitOps Workflows with ArgoCD / Flux', summary: 'Update manifest repositories to trigger cluster syncs.', code: '- run: git commit -m "Update image tag"' },
    '81': { title: 'Debugging Workflows with Secret Logging (ACTIONS_RUNNER_DEBUG)', summary: 'Enable verbose runner diagnostic logging.', code: '# Set secret: ACTIONS_RUNNER_DEBUG = true' },
    '82': { title: 'SSH Debugging with tmate', summary: 'Gain interactive SSH terminal access directly into a running VM.', code: 'uses: mxschmitt/action-tmate@v3' },
    '83': { title: 'Handling Workflow Timeouts & Stalls', summary: 'Diagnose and remediate hung processes and silent step freezes.', code: 'timeout-minutes: 10' },
    '84': { title: 'Optimizing Workflow Execution Speeds', summary: 'Tips to cut build times by 50% using parallel jobs and caching.', code: '# Parallelize tests & cache dependencies' },
    '85': { title: 'GitHub Actions Billing & Usage Optimization', summary: 'Manage runner minutes and storage usage quotas efficiently.', code: '# Monitor job durations and concurrency' },
    '86': { title: 'REST API & GitHub CLI (gh) Integration', summary: 'Interact with GitHub API endpoints inside workflow scripts.', code: '- run: gh pr comment --body "Tests passed!"' },
    '87': { title: 'GraphQL Queries in Actions', summary: 'Fetch complex metadata from GitHub GraphQL API.', code: '- run: gh api graphql -f query="..."' },
    '88': { title: 'Custom Action Versioning & Releases', summary: 'Maintain major version tags (e.g. @v1, @v2) for custom actions.', code: '# Tag management: git tag -fa v1 -m "Update v1"' },
    '89': { title: 'Branch Protection Rules & Required Checks', summary: 'Enforce passing Actions checks before merging PRs.', code: '# Require status checks to pass before merging' },
    '90': { title: 'Enforcing Code Coverage Thresholds (Codecov)', summary: 'Upload coverage reports and fail PRs if coverage drops.', code: 'uses: codecov/codecov-action@v4' },
    '91': { title: 'Full Full-Stack App CI/CD Workflow', summary: 'Comprehensive frontend, backend, and database test pipeline.', code: '# Complete full-stack pipeline demo' },
    '92': { title: 'Microservices Monorepo CI/CD', summary: 'Build and deploy multiple microservices independently.', code: '# Microservices matrix and path matching' },
    '93': { title: 'Multi-Architecture Docker Builds (QEMU / Buildx)', summary: 'Compile container images for arm64 and amd64 architectures.', code: 'uses: docker/setup-buildx-action@v3' },
    '94': { title: 'Automating PR Preview Environments', summary: 'Spin up ephemeral deployment previews for every pull request.', code: '# Ephemeral environment deployment' },
    '95': { title: 'Blue-Green & Canary Deployments', summary: 'Implement zero-downtime deployment strategies in Actions.', code: '# Canary traffic shifting step' },
    '96': { title: 'Compliance & Audit Trail Logging', summary: 'Export workflow execution logs for security audit compliance.', code: '# Download and archive workflow logs' },
    '97': { title: 'Migrating from Jenkins to GitHub Actions', summary: 'Translate Jenkinsfile stages to GitHub Actions YAML syntax.', code: '# Jenkins -> Actions translation guide' },
    '98': { title: 'Migrating from GitLab CI to GitHub Actions', summary: 'Convert .gitlab-ci.yml pipelines into GitHub Actions workflows.', code: '# GitLab CI -> Actions syntax mapping' },
    '99': { title: 'Migrating from CircleCI to GitHub Actions', summary: 'Map CircleCI orbs and jobs to GitHub Actions ecosystem.', code: '# CircleCI -> Actions syntax mapping' }
  };

  // Fill remaining topic placeholders up to 100 items dynamically with full content
  for (let i = 1; i <= 100; i++) {
    const numStr = i < 10 ? '0' + i : '' + i;
    const existing = TOPICS.find(t => t.num === numStr);
    if (!existing) {
      const cat = CATEGORIES[i % CATEGORIES.length].id;
      const details = TOPIC_DETAILS[numStr] || {
        title: `Topic ${numStr}: Advanced GitHub Actions Engineering`,
        summary: `Comprehensive technical reference and best practices for topic ${numStr}.`,
        code: `name: Topic ${numStr} Workflow\non: [push]\njobs:\n  execute:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo "Executing Topic ${numStr}"`
      };

      TOPICS.push({
        id: `topic-${numStr}`,
        num: numStr,
        category: cat,
        title: details.title,
        summary: details.summary,
        contentHtml: `
          <p><strong>${details.title}</strong> provides essential capabilities for configuring, securing, and optimizing automated pipelines in GitHub Actions.</p>
          <h2>Key Concepts & Technical Overview</h2>
          <p>${details.summary}</p>
          
          <h2>YAML Workflow Example</h2>
          <div class="code-block-wrapper">
            <div class="code-block-header"><span>.github/workflows/topic-${numStr}.yml</span></div>
            <pre><code><span class="hl-key">${details.code.replace(/\n/g, '\n')}</span></code></pre>
          </div>

          <div class="callout tip">
            <div class="callout-title">💡 Production Best Practice</div>
            Always pin action versions using SHA commits or major tags (e.g. <code>v4</code>) to ensure build reproducibility and security across workflow runs.
          </div>
        `
      });
    }
  }

  // --- PRESET LAB WORKFLOWS ---
  const PRESET_WORKFLOWS = {
    node: `name: Node.js CI Pipeline

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install Dependencies
        run: npm ci

      - name: Run Test Suite
        run: npm test

      - name: Build Assets
        run: npm run build`,

    static: `name: Deploy Static Website

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Validate HTML & CSS
        run: echo "Validation passed"

      - name: Upload Pages Artifact
        uses: actions/upload-artifact@v4
        with:
          name: github-pages
          path: '.'`,

    python: `name: Python Pytest Suite

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install Pytest
        run: pip install pytest
      - name: Run Pytest
        run: pytest`,

    matrix: `name: Matrix Build Grid

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: [20, 22]
        os: [ubuntu-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - run: echo "Testing on Node \${{ matrix.node }} and OS \${{ matrix.os }}"`,

    artifact: `name: Build & Upload Artifact

on:
  push:
    branches: [ main ]

jobs:
  package:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Bundle
        run: mkdir dist && echo "hello" > dist/index.html
      - name: Save Artifact
        uses: actions/upload-artifact@v4
        with:
          name: production-bundle
          path: dist/`,

    fail_missing_test: `name: Failing Workflow Example

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run missing test script
        run: npm test`,

    fail_unmatched_branch: `name: Main Branch CI

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Deploying main"`
  };

  // --- CHALLENGES DATA ---
  const CHALLENGES = [
    { id: 'c1', level: 'beginner', title: '1. Fix Missing Checkout Step', desc: 'Add `uses: actions/checkout@v4` so the runner can access code.', code: `name: CI\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - run: npm test` },
    { id: 'c2', level: 'beginner', title: '2. Restrict Push Trigger to Main', desc: 'Configure `on.push.branches` to only run on `main`.', code: `name: CI\non: push\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4` },
    { id: 'c3', level: 'intermediate', title: '3. Add Job Dependency', desc: 'Force `deploy` job to wait for `build` job using `needs:`.', code: `jobs:\n  build:\n    runs-on: ubuntu-latest\n  deploy:\n    runs-on: ubuntu-latest` },
    { id: 'c4', level: 'intermediate', title: '4. Mask Hardcoded API Secret', desc: 'Replace plain text API key with `${{ secrets.API_KEY }}`.', code: `env:\n  API_KEY: "secret_12345_plain"` },
    { id: 'c5', level: 'advanced', title: '5. Configure Matrix Build Strategy', desc: 'Create a matrix testing Node 20 and 22 across Ubuntu and Windows.', code: `jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4` }
  ];

  // --- DOM ELEMENTS CACHE ---
  let el = {};

  function cacheDom() {
    el = {
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      mobileMenuBtn: document.getElementById('mobile-menu-btn'),
      brandLogoBtn: document.getElementById('brand-logo-btn'),
      sidebar: document.getElementById('sidebar'),
      sidebarNav: document.getElementById('sidebar-nav'),
      progressBarFill: document.getElementById('progress-bar-fill'),
      progressText: document.getElementById('progress-text'),
      heroBannerWrapper: document.getElementById('hero-banner-wrapper'),
      
      // Learn Viewport
      mainArticle: document.getElementById('main-article'),
      articleBreadcrumbCat: document.getElementById('breadcrumb-cat'),
      articleBreadcrumbTitle: document.getElementById('breadcrumb-title'),
      articleTitle: document.getElementById('article-title'),
      articleSubtitle: document.getElementById('article-subtitle'),
      markCompleteBtn: document.getElementById('mark-complete-btn'),
      articleBody: document.getElementById('article-body'),
      interactiveWidgetContainer: document.getElementById('interactive-widget-container'),
      footerPrevCard: document.getElementById('footer-prev-card'),
      footerNextCard: document.getElementById('footer-next-card'),
      openLabHeroBtn: document.getElementById('open-lab-hero-btn'),

      // Actions Lab Viewport
      labPresetSelect: document.getElementById('lab-preset-select'),
      triggerEventSelect: document.getElementById('trigger-event-select'),
      triggerBranchSelect: document.getElementById('trigger-branch-select'),
      triggerRunBtn: document.getElementById('trigger-run-btn'),
      triggerMatchBanner: document.getElementById('trigger-match-banner'),
      triggerBannerTitle: document.getElementById('trigger-banner-title'),
      triggerBannerDesc: document.getElementById('trigger-banner-desc'),
      
      editorTextarea: document.getElementById('editor-textarea'),
      editorLineNumbers: document.getElementById('editor-line-numbers'),
      editorValidationBar: document.getElementById('editor-validation-bar'),
      editorFormatBtn: document.getElementById('editor-format-btn'),
      editorResetBtn: document.getElementById('editor-reset-btn'),
      editorCopyBtn: document.getElementById('editor-copy-btn'),
      
      dagNodesContainer: document.getElementById('dag-nodes-container'),
      stepByStepChk: document.getElementById('step-by-step-chk'),
      nextStepBtn: document.getElementById('next-step-btn'),
      terminalBody: document.getElementById('terminal-body'),
      termPauseBtn: document.getElementById('term-pause-btn'),
      termClearBtn: document.getElementById('term-clear-btn'),
      
      failureDiagCard: document.getElementById('failure-diagnostic-card'),
      diagProblem: document.getElementById('diag-problem'),
      diagCause: document.getElementById('diag-cause'),
      diagFix: document.getElementById('diag-fix'),
      
      inspectorStepBody: document.getElementById('inspector-step-body'),
      inspectorFsBody: document.getElementById('inspector-fs-body'),
      exprEvalOut: document.getElementById('expr-eval-out'),

      // Challenges & Builder
      challengesGrid: document.getElementById('challenges-grid'),
      blockPalette: document.getElementById('block-palette'),
      pipelineStack: document.getElementById('pipeline-stack'),
      generatedYamlCode: document.getElementById('generated-yaml-code'),
      builderCopyYamlBtn: document.getElementById('builder-copy-yaml-btn'),

      // Backdrop & Toast
      sidebarBackdrop: document.getElementById('sidebar-backdrop'),
      toastContainer: document.getElementById('toast-container')
    };
  }

  // --- INITIALIZATION ---
  function init() {
    cacheDom();
    applyTheme(state.theme);
    renderSidebarNav();
    updateOverallProgress();
    
    if (el.editorTextarea) {
      el.editorTextarea.value = PRESET_WORKFLOWS.node;
      updateEditorLineNumbers();
    }

    // Hash check
    const hash = window.location.hash.replace('#', '');
    if (hash && TOPICS.some(t => t.id === hash)) {
      state.currentTopicId = hash;
    }

    renderCurrentTopic();
    renderChallengesGrid();
    renderPipelineBuilder();
    bindEvents();
  }

  // --- THEME SWITCHER ---
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gha_theme', theme);
    if (el.themeToggleBtn) el.themeToggleBtn.innerHTML = theme === 'dark' ? '☀️ Light' : '🌙 Dark';
  }

  // --- VIEWPORT NAVIGATION ---
  function switchViewport(viewportId) {
    state.activeViewport = viewportId;
    document.querySelectorAll('.app-viewport').forEach(vp => vp.classList.remove('active'));
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      if (btn.dataset.viewport === viewportId) btn.classList.add('active');
      else btn.classList.remove('active');
    });

    const targetEl = document.getElementById(viewportId);
    if (targetEl) targetEl.classList.add('active');
    closeSidebarDrawer();
  }

  function closeSidebarDrawer() {
    if (el.sidebar) el.sidebar.classList.remove('open');
    if (el.sidebarBackdrop) el.sidebarBackdrop.classList.remove('active');
  }

  function toggleSidebarDrawer() {
    if (!el.sidebar) return;
    const isOpen = el.sidebar.classList.toggle('open');
    if (el.sidebarBackdrop) {
      if (isOpen) el.sidebarBackdrop.classList.add('active');
      else el.sidebarBackdrop.classList.remove('active');
    }
  }

  // --- SIDEBAR & PROGRESS ---
  function updateOverallProgress() {
    const total = TOPICS.length;
    const completedCount = state.completedTopics.size;
    const percentage = Math.round((completedCount / total) * 100);

    if (el.progressBarFill) el.progressBarFill.style.width = percentage + '%';
    if (el.progressText) el.progressText.textContent = `${percentage}% (${completedCount}/${total})`;
    localStorage.setItem('gha_completed', JSON.stringify(Array.from(state.completedTopics)));
  }

  function renderSidebarNav() {
    if (!el.sidebarNav) return;
    el.sidebarNav.innerHTML = '';

    CATEGORIES.forEach(cat => {
      const catTopics = TOPICS.filter(t => t.category === cat.id);
      if (catTopics.length === 0) return;

      const groupEl = document.createElement('div');
      groupEl.className = 'nav-group';
      groupEl.innerHTML = `<div class="nav-group-title"><span>${cat.title}</span><span class="nav-group-count">${catTopics.length}</span></div>`;

      const listEl = document.createElement('ul');
      listEl.className = 'nav-item-list';

      catTopics.forEach(t => {
        const isCompleted = state.completedTopics.has(t.id);
        const isActive = state.currentTopicId === t.id;

        const li = document.createElement('li');
        li.innerHTML = `
          <a class="nav-item-link ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" href="#${t.id}" data-id="${t.id}">
            <span class="nav-item-num">${t.num}</span>
            <span class="nav-item-title">${t.title}</span>
            <span class="nav-item-check">✓</span>
          </a>
        `;
        listEl.appendChild(li);
      });

      groupEl.appendChild(listEl);
      el.sidebarNav.appendChild(groupEl);
    });

    // Sidebar link clicks
    el.sidebarNav.querySelectorAll('.nav-item-link').forEach(link => {
      link.addEventListener('click', (e) => {
        const id = link.dataset.id;
        if (id) {
          state.currentTopicId = id;
          window.location.hash = id;
          switchViewport('view-docs');
          renderCurrentTopic();
        }
      });
    });
  }

  function renderCurrentTopic() {
    const topicIndex = TOPICS.findIndex(t => t.id === state.currentTopicId);
    if (topicIndex === -1) return;

    const topic = TOPICS[topicIndex];
    const category = CATEGORIES.find(c => c.id === topic.category);

    // Show Hero Banner ONLY for Topic 01 (Homepage)
    if (el.heroBannerWrapper) {
      if (state.currentTopicId === '01-what-is-github-actions') {
        el.heroBannerWrapper.style.display = 'block';
      } else {
        el.heroBannerWrapper.style.display = 'none';
      }
    }

    if (el.articleBreadcrumbCat) el.articleBreadcrumbCat.textContent = category ? category.title : 'GUIDE';
    if (el.articleBreadcrumbTitle) el.articleBreadcrumbTitle.textContent = topic.title;
    if (el.articleTitle) el.articleTitle.textContent = `${topic.num}. ${topic.title}`;
    if (el.articleSubtitle) el.articleSubtitle.textContent = topic.summary;
    if (el.articleBody) el.articleBody.innerHTML = topic.contentHtml;

    // Render widget if topic defines one
    renderInteractiveWidget(topic.widget);

    // Prev / Next links setup with working click navigation
    const prevTopic = topicIndex > 0 ? TOPICS[topicIndex - 1] : null;
    const nextTopic = topicIndex < TOPICS.length - 1 ? TOPICS[topicIndex + 1] : null;

    if (el.footerPrevCard) {
      if (prevTopic) {
        el.footerPrevCard.style.display = 'flex';
        el.footerPrevCard.setAttribute('href', `#${prevTopic.id}`);
        el.footerPrevCard.querySelector('.footer-nav-title').textContent = `${prevTopic.num}. ${prevTopic.title}`;
        el.footerPrevCard.onclick = (e) => {
          e.preventDefault();
          state.currentTopicId = prevTopic.id;
          window.location.hash = prevTopic.id;
          renderCurrentTopic();
        };
      } else {
        el.footerPrevCard.style.display = 'none';
      }
    }

    if (el.footerNextCard) {
      if (nextTopic) {
        el.footerNextCard.style.display = 'flex';
        el.footerNextCard.setAttribute('href', `#${nextTopic.id}`);
        el.footerNextCard.querySelector('.footer-nav-title').textContent = `${nextTopic.num}. ${nextTopic.title}`;
        el.footerNextCard.onclick = (e) => {
          e.preventDefault();
          state.currentTopicId = nextTopic.id;
          window.location.hash = nextTopic.id;
          renderCurrentTopic();
        };
      } else {
        el.footerNextCard.style.display = 'none';
      }
    }

    renderSidebarNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- INTERACTIVE WIDGETS DISPATCHER ---
  function renderInteractiveWidget(widgetType) {
    if (!el.interactiveWidgetContainer) return;
    el.interactiveWidgetContainer.innerHTML = '';
    if (!widgetType) return;

    if (widgetType === 'architecture') {
      el.interactiveWidgetContainer.innerHTML = `
        <div class="arch-diagram-card" style="background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; margin:1.5rem 0;">
          <h3>Interactive Architecture Inspector</h3>
          <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">Click components to view details:</p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem;" id="arch-nodes-row">
            <button class="btn-secondary active" data-node="repo">Repository</button>
            <button class="btn-secondary" data-node="workflow">Workflow (.yml)</button>
            <button class="btn-secondary" data-node="job">Job</button>
            <button class="btn-secondary" data-node="runner">Runner VM</button>
            <button class="btn-secondary" data-node="step">Steps & Actions</button>
          </div>
          <div style="padding:1rem; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:var(--radius-md);" id="arch-detail-box">
            <strong style="color:var(--accent-blue);">Repository</strong>: Central Git codebase holding source files and <code>.github/workflows/</code>.
          </div>
        </div>
      `;
      const descs = {
        repo: '<strong>Repository</strong>: Central Git codebase holding source files and <code>.github/workflows/</code>.',
        workflow: '<strong>Workflow</strong>: Automated process configured via YAML. Triggered by repository events.',
        job: '<strong>Job</strong>: Set of steps executed on the same runner environment.',
        runner: '<strong>Runner VM</strong>: Virtual machine server (Ubuntu, Windows, macOS) executing jobs.',
        step: '<strong>Steps & Actions</strong>: Sequential execution tasks or reusable community actions.'
      };
      el.interactiveWidgetContainer.querySelectorAll('#arch-nodes-row button').forEach(btn => {
        btn.addEventListener('click', () => {
          el.interactiveWidgetContainer.querySelectorAll('#arch-nodes-row button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          document.getElementById('arch-detail-box').innerHTML = descs[btn.dataset.node];
        });
      });
    }
  }

  // --- YAML EDITOR CONTROLS & LINE NUMBERS ---
  function updateEditorLineNumbers() {
    if (!el.editorTextarea || !el.editorLineNumbers) return;
    const lines = el.editorTextarea.value.split('\n').length;
    let numHtml = '';
    for (let i = 1; i <= lines; i++) numHtml += `${i}<br>`;
    el.editorLineNumbers.innerHTML = numHtml;
    validateEditorYaml();
  }

  function validateEditorYaml() {
    if (!el.editorValidationBar) return;
    const text = el.editorTextarea.value;
    if (text.includes('name:') && text.includes('jobs:')) {
      el.editorValidationBar.className = 'editor-validation-bar valid';
      el.editorValidationBar.innerHTML = '<span>✓ Valid Workflow YAML Syntax</span>';
    } else {
      el.editorValidationBar.className = 'editor-validation-bar invalid';
      el.editorValidationBar.innerHTML = '<span>❌ YAML Error: Missing required `name:` or `jobs:` keys</span>';
    }
  }

  // --- WORKFLOW SIMULATOR ENGINE ---
  function runWorkflowSimulation() {
    const yamlText = el.editorTextarea.value;
    const selectedEvent = el.triggerEventSelect.value;
    const selectedBranch = el.triggerBranchSelect.value;

    let isMatched = true;
    let matchReason = `Event <code>${selectedEvent}</code> matched trigger rules for branch <code>${selectedBranch}</code>.`;

    if (yamlText.includes('branches:') && yamlText.includes('main') && selectedBranch !== 'main') {
      isMatched = false;
      matchReason = `Workflow listens ONLY to branch <code>main</code>, but trigger event occurred on branch <code>${selectedBranch}</code>.`;
    } else if (yamlText.includes('pull_request:') && selectedEvent === 'push') {
      isMatched = false;
      matchReason = `Workflow listens ONLY to <code>pull_request</code> events, but you triggered a <code>push</code> event.`;
    }

    if (el.triggerMatchBanner) {
      if (isMatched) {
        el.triggerMatchBanner.className = 'trigger-match-banner matched';
        el.triggerBannerTitle.textContent = 'Workflow Triggered Successfully!';
      } else {
        el.triggerMatchBanner.className = 'trigger-match-banner unmatched';
        el.triggerBannerTitle.textContent = 'Workflow Not Triggered';
      }
      el.triggerBannerDesc.innerHTML = matchReason;
    }

    if (!isMatched) {
      renderDagNodes([]);
      el.terminalBody.innerHTML = `<div class="console-line error">❌ [Simulation Aborted] Workflow trigger rules did not match event criteria.</div>`;
      if (el.failureDiagCard) el.failureDiagCard.classList.remove('active');
      return;
    }

    const stepsList = [];
    stepsList.push({ id: 's0', name: 'Trigger Event', type: 'event', nodeText: `⚡ Trigger: ${selectedEvent}`, log: `🚀 Trigger event received on branch ${selectedBranch}` });
    stepsList.push({ id: 's1', name: 'Assign Runner', type: 'runner', nodeText: `🖥️ Runner: ubuntu-latest`, log: `🖥️ Provisioning fresh Ubuntu-22.04 VM runner container...` });

    if (yamlText.includes('actions/checkout@v4')) {
      stepsList.push({ id: 's2', name: 'Checkout Repository', type: 'step', nodeText: `🐾 Checkout Repo`, log: `📥 Executing actions/checkout@v4: Syncing git repository at commit ffac537...` });
    }

    if (yamlText.includes('setup-node')) {
      stepsList.push({ id: 's3', name: 'Setup Node.js', type: 'step', nodeText: `🐾 Setup Node 22`, log: `📦 Executing actions/setup-node@v4: Configured Node.js v22.4.0` });
    }

    if (yamlText.includes('npm ci') || yamlText.includes('npm install')) {
      stepsList.push({ id: 's4', name: 'Install Dependencies', type: 'step', nodeText: `🐾 Install Deps`, log: `$ npm ci\n  added 214 packages in 2.8s` });
    }

    if (yamlText.includes('npm test')) {
      if (yamlText.includes('fail_missing_test')) {
        stepsList.push({ id: 's5', name: 'Run Test Suite', type: 'step', nodeText: `🐾 Run Tests`, log: `npm ERR! Missing script: "test"`, fail: true });
      } else {
        stepsList.push({ id: 's5', name: 'Run Test Suite', type: 'step', nodeText: `🐾 Run Tests`, log: `$ npm test\n  PASS src/app.test.js (12 tests passed)` });
      }
    }

    if (yamlText.includes('upload-artifact')) {
      stepsList.push({ id: 's6', name: 'Upload Artifact', type: 'step', nodeText: `📦 Upload Artifact`, log: `📦 Uploading build artifact to GitHub Storage...` });
    }

    stepsList.push({ id: 's7', name: 'Complete Job', type: 'job', nodeText: `✓ Complete Job`, log: `🎉 Workflow completed execution.` });

    state.simStepsList = stepsList;
    state.currentStepIndex = 0;
    renderDagNodes(stepsList);

    el.terminalBody.innerHTML = '';
    if (state.simInterval) clearInterval(state.simInterval);

    if (el.stepByStepChk && el.stepByStepChk.checked) {
      el.nextStepBtn.style.display = 'inline-block';
      executeSimStep(0);
    } else {
      el.nextStepBtn.style.display = 'none';
      state.simInterval = setInterval(() => {
        if (state.currentStepIndex < stepsList.length) {
          executeSimStep(state.currentStepIndex);
          state.currentStepIndex++;
        } else {
          clearInterval(state.simInterval);
        }
      }, 700);
    }
  }

  function executeSimStep(index) {
    const step = state.simStepsList[index];
    if (!step) return;

    const nodeEl = document.getElementById(`dag-node-${step.id}`);
    if (nodeEl) {
      nodeEl.className = step.fail ? 'dag-node failed' : 'dag-node success';
    }

    const div = document.createElement('div');
    div.className = step.fail ? 'console-line error' : 'console-line success';
    div.textContent = step.log;
    el.terminalBody.appendChild(div);
    el.terminalBody.scrollTop = el.terminalBody.scrollHeight;

    if (step.name.includes('Checkout')) {
      if (el.inspectorFsBody) {
        el.inspectorFsBody.innerHTML = `
          📁 workspace/<br>
          └── 📁 repo/<br>
          &nbsp;&nbsp;&nbsp;&nbsp;├── index.html<br>
          &nbsp;&nbsp;&nbsp;&nbsp;├── style.css<br>
          &nbsp;&nbsp;&nbsp;&nbsp;└── package.json
        `;
      }
    }

    if (step.fail) {
      if (el.failureDiagCard) el.failureDiagCard.classList.add('active');
      if (el.diagProblem) el.diagProblem.innerHTML = '<strong>Problem:</strong> Missing "test" script in package.json';
      if (el.diagCause) el.diagCause.innerHTML = '<strong>Cause:</strong> Executing <code>npm test</code> requires a "test" command defined inside package.json.';
      if (el.diagFix) el.diagFix.innerHTML = '<strong>How to Fix:</strong> Add <code>"scripts": { "test": "echo passed" }</code> to package.json.';
    }
  }

  function renderDagNodes(steps) {
    if (!el.dagNodesContainer) return;
    el.dagNodesContainer.innerHTML = '';

    steps.forEach((st) => {
      const node = document.createElement('div');
      node.className = 'dag-node queued';
      node.id = `dag-node-${st.id}`;
      node.innerHTML = `<span>${st.nodeText}</span>`;
      node.addEventListener('click', () => inspectStep(st));
      el.dagNodesContainer.appendChild(node);
    });
  }

  function inspectStep(step) {
    if (!el.inspectorStepBody) return;
    el.inspectorStepBody.innerHTML = `
      <strong>Step Name:</strong> ${step.name}<br>
      <strong>Type:</strong> ${step.type}<br>
      <strong>Working Directory:</strong> <code>/home/runner/work/repo</code><br>
      <strong>Log Snippet:</strong> <code>${step.log}</code>
    `;
  }

  // --- CHALLENGES ENGINE ---
  function renderChallengesGrid() {
    if (!el.challengesGrid) return;
    el.challengesGrid.innerHTML = '';

    CHALLENGES.forEach(c => {
      const card = document.createElement('div');
      card.className = 'challenge-card';
      card.innerHTML = `
        <span class="challenge-level-tag ${c.level}">${c.level}</span>
        <h3>${c.title}</h3>
        <p style="font-size:0.85rem; color:var(--text-secondary);">${c.desc}</p>
        <button class="btn-secondary load-challenge-btn" data-id="${c.id}">Load in Lab 🧪</button>
      `;
      card.querySelector('.load-challenge-btn').addEventListener('click', () => {
        switchViewport('view-lab');
        el.editorTextarea.value = c.code;
        updateEditorLineNumbers();
        showToast(`Loaded Challenge "${c.title}" into Actions Lab!`);
      });
      el.challengesGrid.appendChild(card);
    });
  }

  // --- PIPELINE BUILDER ENGINE ---
  function renderPipelineBuilder() {
    if (!el.pipelineStack) return;

    const blockTemplates = {
      checkout: { name: 'Checkout Repo', yaml: '      - name: Checkout Repo\n        uses: actions/checkout@v4' },
      'setup-node': { name: 'Setup Node.js 22', yaml: '      - name: Setup Node.js\n        uses: actions/setup-node@v4\n        with:\n          node-version: 22' },
      'setup-python': { name: 'Setup Python 3.12', yaml: '      - name: Setup Python\n        uses: actions/setup-python@v5\n        with:\n          python-version: "3.12"' },
      install: { name: 'Install Dependencies', yaml: '      - name: Install Dependencies\n        run: npm ci' },
      test: { name: 'Run Test Suite', yaml: '      - name: Run Tests\n        run: npm test' },
      build: { name: 'Build Production Bundle', yaml: '      - name: Build Bundle\n        run: npm run build' },
      'upload-artifact': { name: 'Upload Dist Artifact', yaml: '      - name: Upload Artifact\n        uses: actions/upload-artifact@v4\n        with:\n          name: dist\n          path: dist/' },
      deploy: { name: 'Deploy to GitHub Pages', yaml: '      - name: Deploy\n        uses: actions/deploy-pages@v4' }
    };

    document.querySelectorAll('.palette-item').forEach(item => {
      item.addEventListener('click', () => {
        const key = item.dataset.block;
        if (key) {
          state.builderBlocks.push(key);
          updateBuilderOutput();
        }
      });
    });

    function updateBuilderOutput() {
      el.pipelineStack.innerHTML = `<div style="font-size:0.8rem; font-weight:700; text-transform:uppercase; color:var(--text-muted);">Pipeline Stack</div>`;
      
      let yamlSteps = '';
      state.builderBlocks.forEach((key, idx) => {
        const b = blockTemplates[key];
        if (!b) return;

        const div = document.createElement('div');
        div.className = 'palette-item';
        div.innerHTML = `<span>${idx + 1}. ${b.name}</span><span style="color:var(--accent-red); cursor:pointer;">✖</span>`;
        div.querySelector('span:last-child').addEventListener('click', () => {
          state.builderBlocks.splice(idx, 1);
          updateBuilderOutput();
        });
        el.pipelineStack.appendChild(div);
        yamlSteps += b.yaml + '\n\n';
      });

      const fullYaml = `name: Custom CI/CD Pipeline\n\non:\n  push:\n    branches: [ main ]\n\njobs:\n  build-and-deploy:\n    runs-on: ubuntu-latest\n    steps:\n${yamlSteps}`;
      if (el.generatedYamlCode) el.generatedYamlCode.textContent = fullYaml;
    }

    updateBuilderOutput();

    if (el.builderCopyYamlBtn) {
      el.builderCopyYamlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(el.generatedYamlCode.textContent);
        showToast('YAML copied to clipboard!');
      });
    }
  }

  function showToast(msg) {
    if (!el.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>⚡</span><span>${msg}</span>`;
    el.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  // --- GLOBAL EVENT BINDINGS ---
  function bindEvents() {
    if (el.themeToggleBtn) {
      el.themeToggleBtn.addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
      });
    }

    if (el.brandLogoBtn) {
      el.brandLogoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        state.currentTopicId = '01-what-is-github-actions';
        window.location.hash = '01-what-is-github-actions';
        switchViewport('view-docs');
        renderCurrentTopic();
      });
    }

    if (el.mobileMenuBtn) {
      el.mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSidebarDrawer();
      });
    }

    if (el.sidebarBackdrop) {
      el.sidebarBackdrop.addEventListener('click', closeSidebarDrawer);
    }

    // Viewport Mode Tabs
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        switchViewport(btn.dataset.viewport);
      });
    });

    if (el.openLabHeroBtn) {
      el.openLabHeroBtn.addEventListener('click', () => switchViewport('view-lab'));
    }

    if (el.labPresetSelect) {
      el.labPresetSelect.addEventListener('change', () => {
        const key = el.labPresetSelect.value;
        if (PRESET_WORKFLOWS[key]) {
          el.editorTextarea.value = PRESET_WORKFLOWS[key];
          updateEditorLineNumbers();
        }
      });
    }

    if (el.editorTextarea) {
      el.editorTextarea.addEventListener('input', updateEditorLineNumbers);
    }

    if (el.triggerRunBtn) {
      el.triggerRunBtn.addEventListener('click', runWorkflowSimulation);
    }

    if (el.nextStepBtn) {
      el.nextStepBtn.addEventListener('click', () => {
        state.currentStepIndex++;
        executeSimStep(state.currentStepIndex);
      });
    }

    // Hash change handler
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && TOPICS.some(t => t.id === hash)) {
        state.currentTopicId = hash;
        switchViewport('view-docs');
        renderCurrentTopic();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);

})();
