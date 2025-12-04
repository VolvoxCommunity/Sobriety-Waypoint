# Maestro E2E Tests

End-to-end tests for Sobriety Waypoint using [Maestro](https://maestro.mobile.dev/).

## Prerequisites

1. Install Maestro CLI:

   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

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
