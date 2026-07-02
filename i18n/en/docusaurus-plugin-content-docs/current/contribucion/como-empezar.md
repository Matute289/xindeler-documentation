---
sidebar_position: 1
---

# Getting started

Guide for making your first contribution to Xindeler.

## Prerequisites

- Rust nightly installed (see [Local installation](/proyecto/instalacion-local))
- GitHub account
- Git configured locally

---

## 1. Fork and clone

Fork the repo on GitHub and clone it:

```bash
git clone https://github.com/TU_USUARIO/xindeler
cd xindeler
git remote add upstream https://github.com/Matute289/xindeler
```

The `upstream` remote lets you pull changes from the official repo.

---

## 2. Sync with upstream

Before starting any task, always sync your fork:

```bash
git checkout main
git fetch upstream
git merge upstream/main
git push origin main
```

---

## 3. Create a branch

Never work directly on `main`. Create a branch from `main`:

```bash
git checkout -b feat/nombre-descriptivo
```

Prefix conventions:

| Prefix | When to use it |
|---------|---------------|
| `feat/` | New functionality |
| `fix/` | Bug fix |
| `chore/` | Refactor, cleanup, dependencies |
| `docs/` | Documentation only |

---

## 4. Make changes and commit

Work on your branch with frequent commits. Every commit should compile:

```bash
cargo build        # verify it compiles
cargo clippy       # verify it passes the linter
cargo test         # run the tests

git add src/...    # add only the relevant files
git commit -m "feat: descripción concisa del cambio"
```

The commit message format is `type: description in lowercase`. See [Git Flow](./git-flow) for details.

---

## 5. Open the PR

```bash
git push origin feat/nombre-descriptivo
```

Then open the PR on GitHub against `main` of the upstream repo (`Matute289/xindeler`). In the description, include:

- What changes and why
- How to test it
- Screenshots if there are visual changes

---

## 6. Review and merge

- A maintainer will review the PR and may request changes
- Respond to comments with new commits on the same branch — don't open a new PR
- Once approved, the maintainer merges it

---

## Best practices

- **One PR per feature** — small, focused PRs get reviewed faster
- **Tests for bugs** — if you fix a bug, add a test that reproduces it
- **Don't break the build** — `cargo build` and `cargo clippy` must pass before pushing
- **Atomic commits** — each commit should leave the repo in a working state
