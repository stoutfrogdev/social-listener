# Approved Permissions

This file contains permissions that have been pre-approved for Claude Code sessions. Claude should reference this file before asking for permission to perform an action.

**IMPORTANT**: This file is validated by a pre-commit hook. Items in the "Never Approve" section below MUST NOT appear in the approved lists.

---

## Never Approve (Require Human Permission Every Time)

The following actions ALWAYS require explicit human permission and must NEVER be added to the approved lists:

| Action | Reason |
|--------|--------|
| `git push origin main` | Branch protection - main is production |
| `git push origin staging` | Branch protection - staging requires PR flow |
| `git push --force` (any branch) | Destructive operation |
| `git reset --hard` | Destructive operation |
| `rm -rf` (recursive delete) | Destructive operation |
| Skip tests before commit | One-time override only, must ask each time |
| Production deployment trigger | Manual confirmation required |
| Modify credentials/secrets/.env | Security sensitive |
| Disable pre-commit hooks | Security bypass |
| Modify this "Never Approve" section | Meta-protection |

---

## Pre-Approved Permissions

### File Operations

- `ls`, `ls -la`, `ls -lah` - List directory contents
- Read any file in the repository
- `pwd` - Print working directory
- `find` - Search for files
- `head`, `tail` - View file portions
- `cat` - View file contents
- `wc` - Word/line count
- `diff` - Compare files

### Git Read Operations

- `git status` - Check repository status
- `git log` - View commit history
- `git diff` - View changes
- `git branch` - List/view branches
- `git show` - Show commit details
- `git stash list` - List stashes
- `git remote -v` - View remotes

### Git Write Operations (develop branch only)

- `git add` - Stage files
- `git commit` - Commit changes (after tests/security pass)
- `git push origin develop` - Push to develop branch
- `git checkout develop` - Switch to develop branch
- `git stash` - Stash changes
- `git stash pop` - Retrieve stashed changes
- `git pull origin develop` - Pull latest develop

### Branch Creation (from develop)

- `git checkout -b feature/<name>` - Create feature branch for new functionality
- `git checkout -b fix/<name>` - Create fix branch for bug fixes
- `git checkout -b test/<name>` - Create test branch for test additions/updates
- `git checkout -b refactor/<name>` - Create refactor branch for code refactoring
- `git checkout -b docs/<name>` - Create docs branch for documentation updates
- `git checkout -b chore/<name>` - Create chore branch for maintenance tasks
- `git push origin <branch-name>` - Push work branches (feature/, fix/, test/, refactor/, docs/, chore/)

### Package Management

- `npm install` - Install dependencies
- `npm ci` - Clean install
- `npm run *` - Run any npm script
- `npm list` - List installed packages
- `npm outdated` - Check for updates

### Quality & Testing

- `npm run lint` - Run linter
- `npm run test` - Run tests
- `npm run type-check` - Run type checking
- `npm run build` - Build project
- `npm run check-all` - Run all checks
- `npm run dev` - Start development server

### Platform Scripts (platform/scripts/)

- `./scripts/dev.sh` - Start local dev environment with Docker
- `./scripts/build.sh` - Build Docker images
- `./scripts/test.sh` - Run tests
- `./scripts/emulator.sh` - Start Firebase emulator standalone

### Docker Operations

- `docker compose up` - Start containers
- `docker compose down` - Stop containers
- `docker compose build` - Build images
- `docker compose logs` - View container logs
- `docker build` - Build Docker image
- `docker ps` - List running containers

### Firebase CLI (Read/Dev Operations)

- `firebase emulators:start` - Start local emulators
- `firebase emulators:export` - Export emulator data
- `firebase projects:list` - List Firebase projects
- `firebase use` - Switch Firebase project alias

### Directory & Search

- `cd` - Change directory (within project)
- `grep` - Search file contents
- `mkdir` - Create directories
- `touch` - Create empty files

### GitHub CLI (Read Operations)

- `gh pr list` - List pull requests
- `gh pr view` - View PR details
- `gh issue list` - List issues
- `gh issue view` - View issue details
- `gh run list` - List workflow runs
- `gh run view` - View workflow run details

---

## Session-Added Permissions

*Permissions granted during sessions will be added here. Each entry should include the date and context.*

### File Write Permissions (Added: 2026-01-31)

- Write/create files in `platform/` directory - Platform application code (Context: Initial scaffolding of social listener app)
- Write/create files in `instructions/plans/` directory - Project implementation plans (Context: Plan documentation)
- Edit `CLAUDE.md` - Update project instructions (Context: Added plans directory documentation)
- Edit `.github/workflows/*.yml` - Update CI/CD workflows (Context: Updated for platform/ directory structure)

<!--
Format for adding new permissions:
- `command` - Description (Added: YYYY-MM-DD, Context: why it was needed)
-->

---

## How to Update This File

1. When Claude asks for permission and you respond "yes, don't ask again", Claude will add it to the "Session-Added Permissions" section
2. Periodically review and move stable permissions to the appropriate category above
3. The pre-commit hook will reject any changes that add "Never Approve" items to approved sections
4. Only humans should modify the "Never Approve" section
