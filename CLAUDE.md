# Claude Code Instructions

This file contains important instructions for Claude Code when working on this codebase.

## Before Asking for Permission

**IMPORTANT**: Before asking the user for permission to perform any action, first check:

📋 **[instructions/approved-permissions.md](./instructions/approved-permissions.md)**

This file contains:
- Pre-approved permissions that don't require asking
- A "Never Approve" list of actions that ALWAYS require human permission
- Session-added permissions granted during previous sessions

If your intended action is in the approved list, proceed without asking. If it's in the "Never Approve" list, you MUST ask for permission. If it's in neither, ask for permission and offer to add it to the approved list if the user agrees.

---

## Git Workflow (IMPORTANT - READ FIRST)

**This project uses a three-branch workflow with `develop` as the active development branch. All changes flow through staging before production.**

### Branch Strategy

| Branch | Purpose | Deployment |
|--------|---------|------------|
| `develop` | Active development | Auto-deploys to **staging** (when set up) |
| `staging` | Integration testing | Auto-deploys to **staging** environment |
| `main` | Production-ready code | **Manual** deploy to production |

### Branch Naming Convention

When creating branches for specific work, use the following prefixes:

| Prefix | Use Case | Example |
|--------|----------|---------|
| `feature/` | New functionality | `feature/user-authentication` |
| `fix/` | Bug fixes | `fix/login-timeout-error` |
| `test/` | Test additions/updates | `test/api-integration-tests` |
| `refactor/` | Code refactoring | `refactor/database-queries` |
| `docs/` | Documentation updates | `docs/api-endpoints` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |

**Naming rules:**
- Use lowercase letters, numbers, and hyphens only
- Keep names descriptive but concise
- Always branch from `develop`: `git checkout -b feature/my-feature develop`
- Merge back to `develop` when complete

```bash
# Example: Creating a feature branch
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# Example: Creating a fix branch
git checkout -b fix/login-timeout-error develop
```

### Required Workflow

1. **Always work on the `develop` branch**
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. **Develop and commit your changes**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin develop
   ```

3. **Changes auto-deploy to staging** when PRs are merged to `develop`
   - Staging deployment is automatic (when configured)
   - Test your changes thoroughly in staging

4. **To promote to production**, create a PR from `develop` to `main`
   - Human review required
   - All tests must pass

5. **Deploy to production (MANUAL ONLY)**
   - A human must manually trigger the "Deploy to Production" workflow in GitHub Actions
   - Type "PRODUCTION" to confirm deployment

### Rules

- **NEVER push directly to `main`** - always use PRs with human review
- **NEVER push directly to `staging`** - changes flow from `develop`
- **Production deployments are MANUAL ONLY** - triggered via GitHub Actions workflow
- Always verify you're on the `develop` branch before making changes: `git branch`
- If you find yourself on `main` or `staging`, switch to `develop` first: `git checkout develop`

### Handling Sensitive Files

Sensitive files (credentials, .env files, etc.) that are not committed must be preserved when switching branches:

```bash
# Before switching branches - stash sensitive files
git stash push -m "sensitive-files" --include-untracked <sensitive-file-paths>

# After switching branches - retrieve sensitive files
git stash pop
```

**Important**: Always stash sensitive files before branch operations to prevent data loss.

---

## Pre-Commit Requirements

Pre-commit hooks are enforced to prevent bad behavior. Run the setup script to install them:

```bash
./scripts/setup-hooks.sh
```

### Hooks Installed

1. **Branch Protection**: Agents cannot commit directly to `main` or `staging`
2. **Security Review**: A security review agent MUST review and pass all changes before commit
3. **Testing**: Testing agent MUST execute and pass all relevant tests before commit
4. **Lint & Type Check**: Code quality checks must pass
5. **Permissions Validation**: Ensures approved-permissions.md doesn't contain forbidden items

### Security Review Process

**MANDATORY: Before ANY commit, the security review agent must:**

1. Analyze all changed files for security vulnerabilities
2. Check for secrets, credentials, or sensitive data exposure
3. Review for OWASP Top 10 vulnerabilities
4. Validate input sanitization and output encoding
5. Verify authentication and authorization patterns
6. **The review MUST pass before proceeding with commit**

If the security review fails, address all identified issues before attempting to commit again.

---

## Testing Requirements (MANDATORY)

**Testing is NOT optional. Tests MUST be executed and pass before ANY commit.**

### Override Policy

- Testing can ONLY be skipped with **explicit human permission**
- A single override applies to **ONE commit only**
- Subsequent commits require testing OR another explicit human override
- Agents must NOT assume previous overrides carry forward

### Testing Agent Responsibilities

The appropriate testing agent MUST:

1. **Execute all existing relevant tests** before commit
2. **Create new tests** for any new features or changes if they don't exist
3. **Select appropriate test types** based on the domain:
   - **UI changes**: Playwright end-to-end tests
   - **Backend changes**: Unit tests, integration tests
   - **API changes**: API contract tests, integration tests
   - **Database changes**: Migration tests, data integrity tests
4. **Review test relevance** and remove tests that are no longer applicable to the app
5. **Ensure all tests pass** before approving the commit

### Mock-First Testing Strategy

**Tests MUST use mocks by default. Live service testing is the exception, not the rule.**

| Test Type | Approach |
|-----------|----------|
| Database operations | Use mock databases or in-memory alternatives |
| External API calls | Use mock responses and fixtures |
| Third-party services | Use stubs and test doubles |
| Authentication | Use mock auth providers |

**Live testing is ONLY permitted when:**
- The test specifically validates live integration behavior
- Mock testing cannot adequately verify the functionality
- Explicit approval is given for the test type

### Handling Rate Limits (429 Errors)

When tests interact with live services that may return 429 (Too Many Requests) errors:

1. **Prevention**:
   - Implement request throttling in test setup
   - Use test-specific API keys with higher limits where available
   - Batch and optimize API calls in tests

2. **Detection**:
   - Monitor for 429 responses during test execution
   - Log rate limit encounters for review

3. **Remediation Plan**:
   - If 429 errors occur, the testing agent MUST:
     1. Stop live API testing immediately
     2. Create mock versions of the failing tests
     3. Document which tests were converted to mocks
     4. Add a TODO to revisit live testing when limits reset
     5. Proceed with mock tests to unblock the commit

4. **Fallback**:
   - All live integration tests MUST have a mock fallback
   - Tests should gracefully degrade to mocks on rate limit errors

### Test Creation Guidelines

When creating new tests:

```
1. Identify the domain (UI, backend, API, etc.)
2. Check for existing test patterns in the codebase
3. Create tests that follow established conventions
4. Ensure tests are deterministic and repeatable
5. Use descriptive test names that explain the expected behavior
6. Include both positive and negative test cases
7. Mock external dependencies by default
```

---

## Feature Development Workflow

**For any new feature:**

1. **First**: Pass the feature request to the orchestration agent
2. **Orchestration agent will**:
   - Analyze the feature requirements
   - Break down into discrete jobs/tasks
   - Determine which specialized agents should implement each part
   - Create a coordinated implementation plan
3. **Then**: Execute the plan using the assigned agents
4. **Testing**: Testing agent creates and runs domain-appropriate tests
5. **Security**: Security review agent audits all changes
6. **Finally**: Commit (only after tests and security pass)

---

## Project Structure

### Instructions Directory

The `instructions/` directory contains permission and policy files:

```
instructions/
├── approved-permissions.md   # Pre-approved permissions for Claude sessions
└── plans/                    # Project plans and implementation proposals
```

### Plans Directory

The `instructions/plans/` directory contains project-specific implementation plans:

**Naming Convention:** `YYYY-MM-DD-<description>.md`

Examples:
- `2026-01-31-social-listener-initial-scaffolding.md`
- `2026-02-15-social-connections-oauth.md`
- `2026-03-01-ai-content-generation.md`

**Plan File Structure:**
- **Created**: Date the plan was created
- **Status**: `Pending Approval`, `Approved`, `In Progress`, `Completed`, `Superseded`
- **Summary**: Brief one-line description of what the plan covers

**Usage:**
- All new project plans should be created in this directory
- Review existing plans before starting related work to understand prior decisions
- Update plan status as implementation progresses
- When a plan is superseded by a newer approach, mark it as `Superseded` and reference the new plan

### Context Directory

The `context/` directory provides domain-specific instructions and context for specialized agents:

```
context/
├── ui/           # UI/Frontend agent context
├── frontend/     # Frontend development context
├── backend/      # Backend/API development context
├── testing/      # Testing and QA agent context
└── devops/       # DevOps and infrastructure context
```

**Usage**: Agents should load the appropriate context from this directory before beginning work.

### Tools Directory

The `tools/` directory contains resources agents need to perform their work:

```
tools/
└── mcp/          # MCP server configurations and tools
```

### Agents Directory

The `agents/` directory contains specifications for custom agents:

```
agents/
└── ...           # Agent specification files
```

---

## Agent Orchestration

### When to Use Orchestration

The orchestration agent MUST be invoked for:
- Any new feature implementation
- Multi-component changes
- Changes affecting multiple systems or services
- Complex refactoring tasks

### Orchestration Flow

```
User Request → Orchestration Agent → Job Breakdown → Agent Assignment → Implementation → Testing → Security Review → Commit
```

---

## Local Development

### Quick Start

```bash
# Install dependencies
npm install

# Set up pre-commit hooks
./scripts/setup-hooks.sh

# Start dev server
npm run dev

# Run quality checks
npm run lint
npm run type-check
npm run test

# Run all checks at once
npm run check-all
```

### Monitoring Deployments

```bash
# Watch staging deployment
gh run list --workflow=deploy-staging.yml --limit 3

# Watch production deployment
gh run list --workflow=deploy.yml --limit 3
```

### Deploying to Production

Production deployments must be triggered manually:

1. Go to GitHub Actions
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Type "PRODUCTION" in the confirmation field
5. Click "Run workflow"

---

## Pre-Commit Checklist

Before committing, ensure:

1. ✅ You are on the `develop` branch
2. ✅ Check `instructions/approved-permissions.md` for pre-approved actions
3. ✅ Testing agent has created/updated relevant tests
4. ✅ All tests pass: `npm run test`
5. ✅ Security review agent has approved changes
6. ✅ Linting passes: `npm run lint`
7. ✅ Type checking passes: `npm run type-check`
8. ✅ No secrets or credentials in code
9. ✅ Sensitive files are stashed if switching branches
