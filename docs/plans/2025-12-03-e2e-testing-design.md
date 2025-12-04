# E2E Testing Design

**Date:** 2025-12-03
**Status:** Approved

## Overview

End-to-end testing for iOS and Android using Maestro. Tests run locally with a pre-push hook on `main`/`develop` branches.

## Architecture

- **Tool:** Maestro (YAML-based, mobile-native)
- **Platforms:** iOS + Android (same test files for both)
- **Test Data:** Dedicated test user in Supabase
- **Execution:** Local only (no CI)
- **Trigger:** Pre-push hook on `main`/`develop` branches

## Test User

```
Email: e2e-test@sobrietywaypoint.com
Password: Abc123!! (stored in .env.local)
```

Pre-configured in Supabase with:

- Profile with name and sobriety date
- At least one sponsee relationship (for assign-task flow)
- At least one assigned task (for complete-task flow)

## Test Flows (13 total)

### Authentication

| Flow | File | Description |
|------|------|-------------|
| Login | `auth/login.yaml` | Login → Dashboard |
| Logout | `auth/logout.yaml` | Logout → Return to login screen |

### Critical Path

| Flow | File | Description |
|------|------|-------------|
| Signup | `critical-path/signup-to-dashboard.yaml` | Sign up → Onboarding → Dashboard |
| Tab Navigation | `critical-path/tab-navigation.yaml` | Navigate all tabs (smoke test) |

### Tasks

| Flow | File | Description |
|------|------|-------------|
| View Tasks | `tasks/view-task-list.yaml` | View assigned tasks |
| Complete Task | `tasks/complete-task.yaml` | Mark a task as complete |
| Assign Task | `tasks/assign-task.yaml` | Sponsor assigns task to sponsee |

### Journey

| Flow | File | Description |
|------|------|-------------|
| View Milestones | `journey/view-milestones.yaml` | View timeline/milestones |
| Record Slip-up | `journey/record-slip-up.yaml` | Record a slip-up event |

### Profile

| Flow | File | Description |
|------|------|-------------|
| Edit Profile | `profile/edit-profile.yaml` | Change display name |
| Change Theme | `profile/change-theme.yaml` | Toggle light/dark theme |

### Steps

| Flow | File | Description |
|------|------|-------------|
| Browse Steps | `steps/browse-steps.yaml` | Browse 12-step list |
| Read Step | `steps/read-step.yaml` | Expand and read a step's content |

## Directory Structure

```
maestro/
├── flows/
│   ├── auth/
│   │   ├── login.yaml
│   │   └── logout.yaml
│   ├── critical-path/
│   │   ├── signup-to-dashboard.yaml
│   │   └── tab-navigation.yaml
│   ├── tasks/
│   │   ├── view-task-list.yaml
│   │   ├── complete-task.yaml
│   │   └── assign-task.yaml
│   ├── journey/
│   │   ├── view-milestones.yaml
│   │   └── record-slip-up.yaml
│   ├── profile/
│   │   ├── edit-profile.yaml
│   │   └── change-theme.yaml
│   └── steps/
│       ├── browse-steps.yaml
│       └── read-step.yaml
├── config.yaml
└── README.md
```

## Environment Variables

Add to `.env.local`:

```bash
MAESTRO_E2E_EMAIL=e2e-test@sobrietywaypoint.com
MAESTRO_E2E_PASSWORD=Abc123!!
```

Add to `.env.example`:

```bash
# E2E Testing (Maestro)
MAESTRO_E2E_EMAIL=e2e-test@sobrietywaypoint.com
MAESTRO_E2E_PASSWORD=your-test-password-here
```

## Maestro Config

`maestro/config.yaml`:

```yaml
appId: com.volvox.sobrietywaypoint
env:
  E2E_EMAIL: ${MAESTRO_E2E_EMAIL}
  E2E_PASSWORD: ${MAESTRO_E2E_PASSWORD}
```

## npm Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "maestro": "maestro test maestro/flows",
    "maestro:ios": "maestro test maestro/flows --platform ios",
    "maestro:android": "maestro test maestro/flows --platform android",
    "maestro:flow": "maestro test"
  }
}
```

## Pre-push Hook

Create `.husky/pre-push`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Get the branch being pushed to
branch=$(git rev-parse --abbrev-ref HEAD)

# Only run E2E tests on main or develop
if [ "$branch" = "main" ] || [ "$branch" = "develop" ]; then
  echo "🧪 Running E2E tests for $branch branch..."

  # Check if simulator/emulator is running
  if ! pnpm maestro test maestro/flows --platform ios 2>/dev/null; then
    echo "⚠️  E2E tests failed or no simulator running. Push blocked."
    exit 1
  fi
fi
```

## .gitignore Additions

```
# Maestro
maestro/.maestro/
maestro/screenshots/
```

## README Updates

Add new section:

```markdown
## E2E Testing

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end testing on iOS and Android.

### Prerequisites

1. Install Maestro CLI:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

2. Ensure iOS Simulator or Android Emulator is installed and running

### Setup

1. Copy the test credentials to your local environment:
   ```bash
   cp .env.example .env.local
   ```

2. Build the development client:
   ```bash
   pnpm ios    # for iOS
   pnpm android # for Android
   ```

### Running Tests

```bash
pnpm maestro              # Run all E2E tests
pnpm maestro:ios          # Run on iOS simulator only
pnpm maestro:android      # Run on Android emulator only
pnpm maestro:flow <path>  # Run a single test flow
```

### Pre-push Hook

E2E tests run automatically when pushing to `main` or `develop` branches. Ensure your simulator is running before pushing to these branches.
```

## Implementation Steps

1. Install Maestro CLI locally
2. Create `maestro/` directory structure
3. Add `maestro/config.yaml`
4. Write test flows (13 YAML files)
5. Add npm scripts to `package.json`
6. Create pre-push hook
7. Update `.gitignore`
8. Update `.env.example`
9. Update `README.md`
10. Update `CLAUDE.md` with E2E testing section
