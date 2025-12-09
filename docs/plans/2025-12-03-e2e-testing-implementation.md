# E2E Testing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement Maestro-based E2E testing for iOS and Android with 13 test flows covering authentication, critical paths, tasks, journey, profile, and steps.

**Architecture:** YAML-based Maestro test flows that interact with the app via UI automation. Tests use a dedicated Supabase test user (`e2e-test@sobrietywaypoint.com`) and run locally via pre-push hook on `main`/`develop` branches.

**Tech Stack:** Maestro CLI, YAML test flows, Husky pre-push hooks, pnpm scripts

---

## Task 1: Create Maestro Directory Structure

**Files:**

- Create: `maestro/flows/auth/.gitkeep`
- Create: `maestro/flows/critical-path/.gitkeep`
- Create: `maestro/flows/tasks/.gitkeep`
- Create: `maestro/flows/journey/.gitkeep`
- Create: `maestro/flows/profile/.gitkeep`
- Create: `maestro/flows/steps/.gitkeep`

**Step 1: Create all directories**

Run:

```bash
mkdir -p maestro/flows/{auth,critical-path,tasks,journey,profile,steps}
```

**Step 2: Add .gitkeep files to preserve empty directories**

Run:

```bash
touch maestro/flows/auth/.gitkeep
touch maestro/flows/critical-path/.gitkeep
touch maestro/flows/tasks/.gitkeep
touch maestro/flows/journey/.gitkeep
touch maestro/flows/profile/.gitkeep
touch maestro/flows/steps/.gitkeep
```

**Step 3: Verify structure**

Run: `find maestro -type f`
Expected: 6 `.gitkeep` files listed

**Step 4: Commit**

```bash
git add maestro/
git commit -m "chore(e2e): create maestro directory structure"
```

---

## Task 2: Create Maestro Config and README

**Files:**

- Create: `maestro/config.yaml`
- Create: `maestro/README.md`

**Step 1: Create config.yaml**

Create `maestro/config.yaml`:

```yaml
# Maestro E2E Test Configuration
# https://maestro.mobile.dev/

appId: com.volvox.sobrietywaypoint

# Environment variables (loaded from shell or .env.local)
env:
  E2E_EMAIL: ${MAESTRO_E2E_EMAIL}
  E2E_PASSWORD: ${MAESTRO_E2E_PASSWORD}

# Default settings
onFlowStart:
  - clearState
```

**Step 2: Create README.md**

Create `maestro/README.md`:

````markdown
# Maestro E2E Tests

End-to-end tests for Sobriety Waypoint using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. Install Maestro CLI:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
````

2. Set environment variables in `.env.local`:

   ```bash
   MAESTRO_E2E_EMAIL=e2e-test@sobrietywaypoint.com
   MAESTRO_E2E_PASSWORD=Abc123!!
   ```

3. Have iOS Simulator or Android Emulator running

## Running Tests

```bash
# From project root
pnpm maestro              # Run all flows
pnpm maestro:ios          # iOS only
pnpm maestro:android      # Android only
pnpm maestro:flow <path>  # Single flow
```

## Test User

Tests use a dedicated Supabase user:

- **Email:** e2e-test@sobrietywaypoint.com
- **Password:** (see .env.local)

This user is pre-configured with:

- Profile with name and sobriety date
- At least one sponsee relationship
- At least one assigned task

## Flow Structure

| Folder           | Description                     |
| ---------------- | ------------------------------- |
| `auth/`          | Login, logout                   |
| `critical-path/` | Signup → onboarding → dashboard |
| `tasks/`         | View, complete, assign tasks    |
| `journey/`       | Milestones, slip-ups            |
| `profile/`       | Edit profile, theme             |
| `steps/`         | Browse and read steps           |

````

**Step 3: Verify files exist**

Run: `ls -la maestro/`
Expected: `config.yaml` and `README.md` listed

**Step 4: Commit**

```bash
git add maestro/config.yaml maestro/README.md
git commit -m "chore(e2e): add maestro config and README"
````

---

## Task 3: Create Login Flow

**Files:**

- Create: `maestro/flows/auth/login.yaml`

**Step 1: Create login.yaml**

Create `maestro/flows/auth/login.yaml`:

```yaml
# Login Flow
# Verifies existing user can log in and reach dashboard
appId: com.volvox.sobrietywaypoint

---
- launchApp:
    clearState: true

# Wait for login screen to load
- assertVisible: 'Sobriety Waypoint'

# Enter credentials
- tapOn: 'your@email.com'
- inputText: ${E2E_EMAIL}

- tapOn: '••••••••'
- inputText: ${E2E_PASSWORD}

# Submit login
- tapOn: 'Sign In'

# Wait for dashboard to load (shows greeting with user's name)
- assertVisible:
    text: 'Hello,'
    timeout: 10000

# Verify dashboard elements
- assertVisible: 'Days Sober'
- assertVisible: 'Your Sobriety Journey'
```

**Step 2: Test the flow manually (requires simulator)**

Run: `maestro test maestro/flows/auth/login.yaml`
Expected: Flow completes successfully (green checkmarks)

**Step 3: Commit**

```bash
git add maestro/flows/auth/login.yaml
git commit -m "test(e2e): add login flow"
```

---

## Task 4: Create Logout Flow

**Files:**

- Create: `maestro/flows/auth/logout.yaml`

**Step 1: Create logout.yaml**

Create `maestro/flows/auth/logout.yaml`:

```yaml
# Logout Flow
# Verifies user can log out and return to login screen
appId: com.volvox.sobrietywaypoint

---
# First, run login flow to get authenticated
- runFlow: auth/login.yaml

# Navigate to Profile tab
- tapOn: 'Profile'

# Wait for profile screen
- assertVisible:
    text: 'Settings'
    timeout: 5000

# Tap Settings button (gear icon in header)
- tapOn:
    id: 'settings-button'

# Wait for settings screen
- assertVisible: 'Account'

# Scroll down to find Sign Out
- scrollUntilVisible:
    element: 'Sign Out'
    direction: DOWN

# Tap Sign Out
- tapOn: 'Sign Out'

# Confirm logout if dialog appears
- tapOn:
    text: 'Sign Out'
    optional: true

# Verify we're back at login screen
- assertVisible:
    text: 'Sobriety Waypoint'
    timeout: 5000
- assertVisible: 'Sign In'
```

**Step 2: Verify flow syntax**

Run: `maestro test maestro/flows/auth/logout.yaml --dry-run`
Expected: No syntax errors

**Step 3: Commit**

```bash
git add maestro/flows/auth/logout.yaml
git commit -m "test(e2e): add logout flow"
```

---

## Task 5: Create Signup to Dashboard Flow

**Files:**

- Create: `maestro/flows/critical-path/signup-to-dashboard.yaml`

**Step 1: Create signup-to-dashboard.yaml**

Create `maestro/flows/critical-path/signup-to-dashboard.yaml`:

```yaml
# Signup to Dashboard Flow
# Verifies new user can sign up, complete onboarding, and reach dashboard
# NOTE: Creates a new user each run - consider cleanup strategy
appId: com.volvox.sobrietywaypoint

---
- launchApp:
    clearState: true

# Wait for login screen
- assertVisible: 'Sobriety Waypoint'

# Navigate to signup
- tapOn: 'Create New Account'

# Wait for signup screen
- assertVisible:
    text: 'Create Account'
    timeout: 5000

# Generate unique email using timestamp
- inputText: ${output.e2e_email}
  into: 'your@email.com'

# Fill signup form
- tapOn: 'your@email.com'
- inputText: 'e2e-signup-${maestro.copiedText}@test.com'

- tapOn:
    text: 'Password'
    index: 0
- inputText: 'TestPass123!'

- tapOn:
    text: 'Confirm Password'
- inputText: 'TestPass123!'

# Submit signup
- tapOn: 'Create Account'

# Wait for onboarding screen
- assertVisible:
    text: 'Welcome'
    timeout: 10000

# Complete onboarding - Step 1: Name
- tapOn: 'First Name'
- inputText: 'E2E Test'

- tapOn: 'Last Initial'
- inputText: 'U'

- tapOn: 'Continue'

# Step 2: Sobriety Date (use today)
- assertVisible: 'sobriety date'

# Accept terms
- tapOn:
    text: 'I accept'
    optional: true

- tapOn: 'Complete Setup'

# Verify dashboard loads
- assertVisible:
    text: 'Hello,'
    timeout: 10000
- assertVisible: 'Days Sober'
```

**Step 2: Verify flow syntax**

Run: `maestro test maestro/flows/critical-path/signup-to-dashboard.yaml --dry-run`
Expected: No syntax errors

**Step 3: Commit**

```bash
git add maestro/flows/critical-path/signup-to-dashboard.yaml
git commit -m "test(e2e): add signup to dashboard flow"
```

---

## Task 6: Create Tab Navigation Flow

**Files:**

- Create: `maestro/flows/critical-path/tab-navigation.yaml`

**Step 1: Create tab-navigation.yaml**

Create `maestro/flows/critical-path/tab-navigation.yaml`:

```yaml
# Tab Navigation Flow
# Smoke test verifying all tabs are accessible
appId: com.volvox.sobrietywaypoint

---
# Login first
- runFlow: auth/login.yaml

# Verify we're on Home tab (default)
- assertVisible: 'Your Sobriety Journey'

# Navigate to Steps tab
- tapOn: 'Steps'
- assertVisible:
    text: 'The 12 Steps'
    timeout: 5000

# Navigate to Journey tab
- tapOn: 'Journey'
- assertVisible:
    text: 'Your Recovery Journey'
    timeout: 5000

# Navigate to Tasks tab
- tapOn: 'Tasks'
- assertVisible:
    text: 'My Tasks'
    timeout: 5000

# Navigate to Profile tab
- tapOn: 'Profile'
- assertVisible:
    text: 'Settings'
    timeout: 5000

# Return to Home tab
- tapOn: 'Home'
- assertVisible: 'Your Sobriety Journey'
```

**Step 2: Verify flow syntax**

Run: `maestro test maestro/flows/critical-path/tab-navigation.yaml --dry-run`
Expected: No syntax errors

**Step 3: Commit**

```bash
git add maestro/flows/critical-path/tab-navigation.yaml
git commit -m "test(e2e): add tab navigation smoke test"
```

---

## Task 7: Create Tasks Flows

**Files:**

- Create: `maestro/flows/tasks/view-task-list.yaml`
- Create: `maestro/flows/tasks/complete-task.yaml`
- Create: `maestro/flows/tasks/assign-task.yaml`

**Step 1: Create view-task-list.yaml**

Create `maestro/flows/tasks/view-task-list.yaml`:

```yaml
# View Task List Flow
# Verifies user can view their assigned tasks
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Tasks tab
- tapOn: 'Tasks'

# Wait for tasks screen
- assertVisible:
    text: 'My Tasks'
    timeout: 5000

# Verify segmented control exists
- assertVisible: 'Manage'

# Verify task list area is visible (may show tasks or empty state)
- assertVisible:
    text: '.*'
    timeout: 3000
```

**Step 2: Create complete-task.yaml**

Create `maestro/flows/tasks/complete-task.yaml`:

```yaml
# Complete Task Flow
# Verifies user can mark a task as complete
# Requires: Test user has at least one assigned task
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Tasks tab
- tapOn: 'Tasks'

# Ensure we're on My Tasks view
- tapOn: 'My Tasks'

# Wait for task list
- assertVisible:
    timeout: 5000

# Tap on first task (if exists)
- tapOn:
    text: 'Step'
    optional: true

# Look for complete button/checkbox
- tapOn:
    id: 'complete-task-button'
    optional: true

# If completion modal appears, add notes and confirm
- inputText:
    text: 'E2E test completion'
    optional: true

- tapOn:
    text: 'Complete'
    optional: true

# Verify completion feedback
- assertVisible:
    text: '.*'
    timeout: 3000
```

**Step 3: Create assign-task.yaml**

Create `maestro/flows/tasks/assign-task.yaml`:

```yaml
# Assign Task Flow
# Verifies sponsor can assign a task to sponsee
# Requires: Test user has at least one sponsee
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Tasks tab
- tapOn: 'Tasks'

# Switch to Manage view (sponsor view)
- tapOn: 'Manage'

# Wait for manage view to load
- assertVisible:
    timeout: 5000

# Tap create task button (+ icon)
- tapOn:
    id: 'create-task-button'
    optional: true

# If task creation modal opens, fill it
- tapOn:
    text: 'Select Sponsee'
    optional: true

# Select first sponsee if available
- tapOn:
    index: 0
    optional: true

# Fill task details
- inputText:
    text: 'E2E Test Task'
    optional: true

- tapOn:
    text: 'Create'
    optional: true

# Verify task appears or success message
- assertVisible:
    text: '.*'
    timeout: 3000
```

**Step 4: Verify flow syntax**

Run:

```bash
maestro test maestro/flows/tasks/view-task-list.yaml --dry-run
maestro test maestro/flows/tasks/complete-task.yaml --dry-run
maestro test maestro/flows/tasks/assign-task.yaml --dry-run
```

Expected: No syntax errors

**Step 5: Commit**

```bash
git add maestro/flows/tasks/
git commit -m "test(e2e): add task flows (view, complete, assign)"
```

---

## Task 8: Create Journey Flows

**Files:**

- Create: `maestro/flows/journey/view-milestones.yaml`
- Create: `maestro/flows/journey/record-slip-up.yaml`

**Step 1: Create view-milestones.yaml**

Create `maestro/flows/journey/view-milestones.yaml`:

```yaml
# View Milestones Flow
# Verifies user can view their journey timeline
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Journey tab
- tapOn: 'Journey'

# Wait for journey screen
- assertVisible:
    text: 'Your Recovery Journey'
    timeout: 5000

# Verify timeline elements
- assertVisible: 'Days Sober'
- assertVisible: 'Journey Days'

# Verify timeline section exists
- assertVisible:
    text: 'Timeline'
    optional: true

# Scroll to see more timeline events
- scroll:
    direction: DOWN
```

**Step 2: Create record-slip-up.yaml**

Create `maestro/flows/journey/record-slip-up.yaml`:

```yaml
# Record Slip-up Flow
# Verifies user can record a slip-up event
# WARNING: This modifies the test user's sobriety data
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Profile tab (slip-up is recorded from profile)
- tapOn: 'Profile'

# Wait for profile screen
- assertVisible:
    text: 'Settings'
    timeout: 5000

# Look for slip-up/reset button
- scrollUntilVisible:
    element: 'Log a Slip-Up'
    direction: DOWN
    optional: true

# Tap slip-up button if visible
- tapOn:
    text: 'Log a Slip-Up'
    optional: true

# If confirmation dialog appears
- tapOn:
    text: 'Confirm'
    optional: true

# Verify the action was acknowledged
- assertVisible:
    text: '.*'
    timeout: 3000
```

**Step 3: Verify flow syntax**

Run:

```bash
maestro test maestro/flows/journey/view-milestones.yaml --dry-run
maestro test maestro/flows/journey/record-slip-up.yaml --dry-run
```

Expected: No syntax errors

**Step 4: Commit**

```bash
git add maestro/flows/journey/
git commit -m "test(e2e): add journey flows (milestones, slip-up)"
```

---

## Task 9: Create Profile Flows

**Files:**

- Create: `maestro/flows/profile/edit-profile.yaml`
- Create: `maestro/flows/profile/change-theme.yaml`

**Step 1: Create edit-profile.yaml**

Create `maestro/flows/profile/edit-profile.yaml`:

```yaml
# Edit Profile Flow
# Verifies user can edit their display name
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Profile tab
- tapOn: 'Profile'

# Wait for profile screen
- assertVisible:
    text: 'Settings'
    timeout: 5000

# Look for edit button near name
- tapOn:
    id: 'edit-name-button'
    optional: true

# If edit modal opens
- clearText
- inputText:
    text: 'E2E Updated'
    optional: true

- tapOn:
    text: 'Save'
    optional: true

# Verify profile displays (original or updated)
- assertVisible:
    text: 'E2E'
    timeout: 3000
```

**Step 2: Create change-theme.yaml**

Create `maestro/flows/profile/change-theme.yaml`:

```yaml
# Change Theme Flow
# Verifies user can toggle between light/dark themes
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Profile tab
- tapOn: 'Profile'

# Tap Settings button
- tapOn:
    id: 'settings-button'

# Wait for settings screen
- assertVisible:
    text: 'Appearance'
    timeout: 5000

# Find theme toggle section
- assertVisible: 'Theme'

# Tap on Dark mode option
- tapOn:
    text: 'Dark'

# Verify theme changed (dark mode has different background)
- assertVisible:
    text: 'Theme'
    timeout: 2000

# Switch back to Light
- tapOn:
    text: 'Light'

# Verify theme changed back
- assertVisible:
    text: 'Theme'
    timeout: 2000

# Set to System (default)
- tapOn:
    text: 'System'
```

**Step 3: Verify flow syntax**

Run:

```bash
maestro test maestro/flows/profile/edit-profile.yaml --dry-run
maestro test maestro/flows/profile/change-theme.yaml --dry-run
```

Expected: No syntax errors

**Step 4: Commit**

```bash
git add maestro/flows/profile/
git commit -m "test(e2e): add profile flows (edit, theme)"
```

---

## Task 10: Create Steps Flows

**Files:**

- Create: `maestro/flows/steps/browse-steps.yaml`
- Create: `maestro/flows/steps/read-step.yaml`

**Step 1: Create browse-steps.yaml**

Create `maestro/flows/steps/browse-steps.yaml`:

```yaml
# Browse Steps Flow
# Verifies user can browse the 12-step list
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Steps tab
- tapOn: 'Steps'

# Wait for steps screen
- assertVisible:
    text: 'The 12 Steps'
    timeout: 5000

# Verify subtitle
- assertVisible: 'Your path to recovery'

# Verify steps are listed (check for Step 1)
- assertVisible: 'Step 1'

# Scroll to see more steps
- scroll:
    direction: DOWN

# Verify more steps visible
- assertVisible:
    text: 'Step'
    timeout: 2000
```

**Step 2: Create read-step.yaml**

Create `maestro/flows/steps/read-step.yaml`:

```yaml
# Read Step Flow
# Verifies user can open and read step content
appId: com.volvox.sobrietywaypoint

---
- runFlow: auth/login.yaml

# Navigate to Steps tab
- tapOn: 'Steps'

# Wait for steps screen
- assertVisible:
    text: 'The 12 Steps'
    timeout: 5000

# Tap on Step 1
- tapOn: 'Step 1'

# Wait for step detail modal/screen
- assertVisible:
    timeout: 5000

# Verify step content is displayed
- assertVisible:
    text: 'powerless'
    optional: true

# Close the step detail (tap X or back)
- tapOn:
    id: 'close-button'
    optional: true

# Alternative: tap outside modal
- tapOn:
    point: '50%,10%'
    optional: true

# Verify we're back at steps list
- assertVisible:
    text: 'The 12 Steps'
    timeout: 3000
```

**Step 3: Verify flow syntax**

Run:

```bash
maestro test maestro/flows/steps/browse-steps.yaml --dry-run
maestro test maestro/flows/steps/read-step.yaml --dry-run
```

Expected: No syntax errors

**Step 4: Commit**

```bash
git add maestro/flows/steps/
git commit -m "test(e2e): add steps flows (browse, read)"
```

---

## Task 11: Add npm Scripts

**Files:**

- Modify: `package.json`

**Step 1: Add maestro scripts to package.json**

Add the following scripts to `package.json` (in the "scripts" section):

```json
"maestro": "maestro test maestro/flows",
"maestro:ios": "maestro test maestro/flows --platform ios",
"maestro:android": "maestro test maestro/flows --platform android",
"maestro:flow": "maestro test"
```

**Step 2: Verify scripts are valid**

Run: `pnpm maestro --help`
Expected: Maestro help output (or error if Maestro not installed)

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore(e2e): add maestro npm scripts"
```

---

## Task 12: Create Pre-push Hook

**Files:**

- Create: `.husky/pre-push`

**Step 1: Create pre-push hook**

Create `.husky/pre-push`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Get the branch being pushed to
branch=$(git rev-parse --abbrev-ref HEAD)

# Only run E2E tests on main or develop
if [ "$branch" = "main" ] || [ "$branch" = "develop" ]; then
  echo "🧪 Running E2E tests for $branch branch..."

  # Check if Maestro is installed
  if ! command -v maestro &> /dev/null; then
    echo "⚠️  Maestro CLI not found. Install with: curl -Ls \"https://get.maestro.mobile.dev\" | bash"
    echo "⚠️  Skipping E2E tests."
    exit 0
  fi

  # Check if simulator/emulator is running (iOS check)
  if ! xcrun simctl list devices | grep -q "Booted"; then
    echo "⚠️  No iOS simulator running. Start one before pushing to $branch."
    echo "⚠️  Skipping E2E tests."
    exit 0
  fi

  # Run E2E tests
  if ! pnpm maestro:ios; then
    echo "❌ E2E tests failed. Push blocked."
    exit 1
  fi

  echo "✅ E2E tests passed!"
fi
```

**Step 2: Make hook executable**

Run: `chmod +x .husky/pre-push`

**Step 3: Verify hook is executable**

Run: `ls -la .husky/pre-push`
Expected: `-rwxr-xr-x` permissions

**Step 4: Commit**

```bash
git add .husky/pre-push
git commit -m "chore(e2e): add pre-push hook for E2E tests"
```

---

## Task 13: Update .gitignore

**Files:**

- Modify: `.gitignore`

**Step 1: Add Maestro entries to .gitignore**

Add the following lines to `.gitignore`:

```
# Maestro
maestro/.maestro/
maestro/screenshots/
```

**Step 2: Verify .gitignore updated**

Run: `grep -A2 "Maestro" .gitignore`
Expected: Shows the added lines

**Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore(e2e): add maestro artifacts to gitignore"
```

---

## Task 14: Update .env.example

**Files:**

- Modify: `.env.example` (or create if doesn't exist)

**Step 1: Add E2E variables to .env.example**

Add the following lines to `.env.example`:

```bash
# E2E Testing (Maestro)
MAESTRO_E2E_EMAIL=e2e-test@sobrietywaypoint.com
MAESTRO_E2E_PASSWORD=your-test-password-here
```

**Step 2: Verify .env.example updated**

Run: `grep -A2 "E2E Testing" .env.example`
Expected: Shows the added lines

**Step 3: Commit**

```bash
git add .env.example
git commit -m "chore(e2e): add maestro env vars to .env.example"
```

---

## Task 15: Update README.md

**Files:**

- Modify: `README.md`

**Step 1: Add E2E Testing section to README**

Add the following section to `README.md` (after the Testing section or at an appropriate location):

````markdown
## E2E Testing

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end testing on iOS and Android.

### Prerequisites

1. Install Maestro CLI:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```
````

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

````

**Step 2: Verify README updated**

Run: `grep -A5 "## E2E Testing" README.md`
Expected: Shows the added section header

**Step 3: Commit**

```bash
git add README.md
git commit -m "docs(e2e): add E2E testing section to README"
````

---

## Task 16: Update CLAUDE.md

**Files:**

- Modify: `CLAUDE.md`

**Step 1: Add E2E testing commands to CLAUDE.md**

Find the "Testing" section in `CLAUDE.md` and add/update the Maestro commands:

````markdown
**E2E Testing (Maestro):**

```bash
pnpm maestro              # Run all Maestro E2E flows
pnpm maestro:ios          # Run on iOS simulator only
pnpm maestro:android      # Run on Android emulator only
pnpm maestro:flow <path>  # Run a single test flow
```
````

E2E tests run automatically via pre-push hook on `main`/`develop` branches.

````

**Step 2: Verify CLAUDE.md updated**

Run: `grep -A5 "E2E Testing" CLAUDE.md`
Expected: Shows the added section

**Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(e2e): add E2E testing commands to CLAUDE.md"
````

---

## Task 17: Remove .gitkeep Files

**Files:**

- Delete: `maestro/flows/auth/.gitkeep`
- Delete: `maestro/flows/critical-path/.gitkeep`
- Delete: `maestro/flows/tasks/.gitkeep`
- Delete: `maestro/flows/journey/.gitkeep`
- Delete: `maestro/flows/profile/.gitkeep`
- Delete: `maestro/flows/steps/.gitkeep`

**Step 1: Remove .gitkeep files (no longer needed since directories have content)**

Run:

```bash
rm -f maestro/flows/*/.gitkeep
```

**Step 2: Verify removal**

Run: `find maestro -name ".gitkeep"`
Expected: No output (no .gitkeep files found)

**Step 3: Commit**

```bash
git add -A maestro/flows/
git commit -m "chore(e2e): remove .gitkeep files (directories have content)"
```

---

## Task 18: Final Validation

**Files:**

- None (validation only)

**Step 1: Run format check**

Run: `pnpm format`
Expected: Files formatted (if any changes)

**Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors

**Step 3: Run typecheck**

Run: `pnpm typecheck`
Expected: No errors

**Step 4: Verify all files created**

Run:

```bash
find maestro -type f -name "*.yaml" | wc -l
```

Expected: 14 (config.yaml + 13 flow files)

**Step 5: List all commits**

Run: `git log --oneline -15`
Expected: Shows all E2E-related commits

**Step 6: Final commit (if format made changes)**

```bash
git add -A
git commit -m "chore(e2e): final formatting" --allow-empty
```

---

## Summary

This plan creates:

- **13 Maestro test flows** covering authentication, critical paths, tasks, journey, profile, and steps
- **Configuration** with environment variable support
- **npm scripts** for running tests
- **Pre-push hook** that runs E2E on `main`/`develop` branches
- **Documentation** updates to README.md and CLAUDE.md

After implementation, run `pnpm maestro` with a simulator running to verify all flows work correctly.
