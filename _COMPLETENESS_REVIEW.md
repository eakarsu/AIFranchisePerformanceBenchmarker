# Completeness Review: AIFranchisePerformanceBenchmarker

- **Review date:** 2026-07-18
- **Assessment basis:** Static source and configuration inspection only. Dependencies were not installed, and no build, database migration, external integration, or runtime workflow was executed.

## Classification

**Prototype-demo**

## Verdict

The repository presents a broad franchise performance management surface (89 source files and 17 route modules), but static evidence is characteristic of a generated prototype. Pages and endpoints demonstrate concepts; they do not establish a verified execution path to normalize location data, compare governed KPIs, identify exceptions, assign action plans, and track outcomes.

## Why it is not complete

- 18 files are explicitly named as gap/gap-feature implementations; route/page count therefore overstates completed product capability.
- The route/page inventory includes `aibenchmark page`, `aicenter`, `aiplayground page`, `alerts page`; these surfaces show breadth but not durable execution against authoritative systems.
- 17 files reference model-provider or chat-completion behavior; generic LLM calls are not a substitute for deterministic domain execution, grounding, or evaluation.
- 33 files contain mock, sample, placeholder, or random-data signals, leaving important outcomes disconnected from authoritative systems.
- No recognizable application test files were found in the inspected tree.
- No CI workflow was found to continuously verify builds, tests, migrations, or security checks.
- No environment example/template was found, so required configuration and secret boundaries are undocumented.

## Needed features

- 1. Implement a workflow to normalize location data, compare governed KPIs, identify exceptions, assign action plans, and track outcomes.
- 2. Connect POS, accounting, labor, inventory, CRM, survey, and franchise-management systems; replace seed/demo records with durable synchronized data and explicit failure handling.
- 3. Validate KPI definitions, entity/period coverage, peer groups, anomaly quality, forecasts, and financial reconciliation.
- 4. Separate franchisor/franchisee access, protect employee/customer data, expose assumptions, and require operator review.
- 5. Add contract, integration, authorization, migration, and end-to-end tests in CI, plus a documented non-destructive deployment/run path.

## Risks or launch blockers

- Credential/secret fallback or demo-password patterns occur in 3 files and must be removed or made development-only.
- The root launcher can terminate unrelated processes occupying configured ports.
- The root launcher seeds, creates, migrates, or otherwise mutates database state during startup.
- The root launcher installs dependencies at run time, reducing reproducibility and expanding supply-chain risk.
- Ungrounded or malformed model output can become a domain action unless schemas, evidence, evaluations, and approval gates are added.

## Evidence inspected

- `client/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `server/package.json` — declared scripts, runtime dependencies, and application boundaries.
- `server/index.js` — service composition, middleware, and registered routes.
- `server/models/index.js` — service composition, middleware, and registered routes.
- `server/routes/aiResults.js` — implemented API surface and domain/AI request handling.
- `server/routes/auth.js` — implemented API surface and domain/AI request handling.

## Recommended next action

Treat this as a prototype: use aibenchmark page and aicenter to select one narrow franchise performance management outcome, quarantine generated gap routes, and implement that outcome end to end with real data, deterministic rules, and tests before adding features.

## Implementation progress

- **Needed feature 1 — locally implemented:** `server/domain/performanceWorkflow.js`, `server/routes/governedPerformance.js`, and `server/migrations/001_governed_performance.sql` now provide a durable tenant-scoped cycle → normalized sourced metrics → deterministic peer benchmark → assigned action plan → reviewed/verified/closed workflow. Metric periods and values are validated, source records and idempotency keys are unique, action transitions use optimistic versions, and verification requires evidence.
- **Needed feature 2 — locally implemented boundary; externally blocked adapters:** synchronization runs now persist provider, cursor, counts, partial/failure status, and error details instead of substituting sample data. Actual POS, accounting, labor, inventory, CRM, survey, and franchise-management connections remain blocked on vendor credentials, schemas, contracts, and authoritative source access.
- **Needed features 3–4 — locally implemented governance:** metrics retain units, periods, sources and records; peer results expose coverage counts and deterministic aggregates; tenant scope derives from signed identity; approval/verification requires an operator, franchisor, or admin role; assumptions, evidence, actor, before/after state, and request IDs are preserved in audit records. KPI definitions, peer-group policy, source reconciliation, retention rules, and operator acceptance still require the franchise organization.
- **Needed feature 5 and launch blockers — implemented:** generated gap endpoints are no longer mounted; JWT and production DB fallbacks are hardened; schema mutation was removed from startup; `.env.example`, non-destructive `start.sh`, separate bootstrap/migration/guarded-demo-seed scripts, operations guidance, a PostgreSQL-backed CI workflow, and policy tests were added. The focused suite passes 3/3 tests and changed JavaScript/shell syntax checks pass.
- **Remaining external gates:** provider integrations, production migration rehearsal, end-to-end reconciliation, security/privacy review, real tenancy provisioning, KPI owner sign-off, and model evaluation were not executed or claimed complete.
