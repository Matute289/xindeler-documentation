# 002 — GitHub Actions CI/CD

**Estado:** `[x]` Completo  
**Prioridad:** Alta  
**Sprint:** 1

## Qué se hizo
- `.github/workflows/pr-check.yml` — build on PR (job: `validate`)
- `.github/workflows/deploy.yml` — build + rsync to VPS on push to main

## Secrets requeridos en GitHub
| Secret | Valor |
|--------|-------|
| `VPS_HOST` | IP del VPS (ya existe en Matute289 org) |
| `VPS_USER` | mgrinberg |
| `VPS_SSH_KEY` | Clave privada SSH (misma que usa xindeler-web-landing) |
| `VPS_DEPLOY_PATH` | `/srv/xindeler/docs/` |

## Notas
- Job name `validate` — consistente con xindeler-web-landing y xindeler-wiki
- rsync via appleboy/scp-action@v0.1.7
