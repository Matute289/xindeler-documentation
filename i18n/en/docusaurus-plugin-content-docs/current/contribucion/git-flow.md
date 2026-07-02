---
sidebar_position: 2
---

# Git Flow

Branching and commit conventions in Xindeler.

## Branches

| Branch | Description |
|--------|-------------|
| `main` | Always stable and deployable. Protected — merges only via approved PR. |
| `feat/*` | New functionality. Created from `main`, merged into `main`. |
| `fix/*` | Bug fix. |
| `chore/*` | Refactor, cleanup, dependency updates. |
| `docs/*` | Documentation-only changes. |

There are no `develop`, `staging`, or `release` branches — the model is simplified trunk-based development.

---

## Standard workflow

```
main ──────────────────────────────────────────► main
         │                              ▲
         └─── feat/new-ability ─────┘
              (incremental commits)
```

1. Create a branch from an up-to-date `main`
2. Commit frequently on the branch
3. Open a PR against `main`
4. Pass review and CI
5. Merge into `main` (squash or merge commit, at the reviewer's preference)

---

## Commit format

```
type: short description in lowercase (max. 72 characters)

Optional body explaining why, not what.
The what is explained by the code.
```

### Valid types

| Type | When |
|------|--------|
| `feat` | New functionality visible to a player or contributor |
| `fix` | Bug fix |
| `refactor` | Internal change with no behavior change |
| `chore` | Dependencies, CI, configuration |
| `docs` | Documentation only |
| `test` | Add or fix tests |
| `perf` | Performance improvement |

### Examples

```bash
feat: add parry window to sword combo
fix: correct backstab damage multiplier for rogue
refactor: split CombatSystem into attack and defense phases
docs: document RON format for ability definitions
chore: update quinn to 0.11
```

---

## Rules for the `main` branch

- **No direct pushes** — everything goes through a PR
- **Requires 1 approval** from the maintainer (@Matute289)
- **CI must pass** (`cargo build`, `cargo clippy`, `cargo test`)
- The maintainer can merge without a PR (bypass) for urgent hotfixes

---

## Conflict resolution

If your branch has diverged from `main`, rebase instead of merging:

```bash
git fetch upstream
git rebase upstream/main
```

Resolve conflicts file by file, then:

```bash
git add <resolved-file>
git rebase --continue
git push origin feat/your-branch --force-with-lease
```

Use `--force-with-lease` instead of `--force` — it fails if someone else has pushed to your branch in the meantime.
