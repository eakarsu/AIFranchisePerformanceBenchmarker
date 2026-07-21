# Security and operations

The supported local path is explicit: run `scripts/bootstrap.sh` once, export `DATABASE_URL`, run `scripts/migrate.sh`, and then run `./start.sh`. Startup never installs packages, creates or seeds tables, or terminates processes it did not start. `scripts/seed-demo.sh` is guarded and must target an isolated disposable database.

The governed API under `/api/performance-workflow` records normalized metrics with source identifiers and idempotency keys, computes deterministic peer summaries, and moves action plans through explicit review and verification gates. Tenant scope derives from the signed identity; approving and verifying requires an operator/franchisor role and evidence. Every metric ingestion and transition writes an immutable audit event. Provider adapters must record partial and failed synchronization runs rather than silently substituting samples.

Production readiness still requires organization-specific POS, accounting, labor, inventory, CRM, survey and franchise-system credentials; authoritative KPI definitions and peer-group governance; reconciliation against source systems; retention/privacy policy; key rotation; and operator acceptance testing. AI output is advisory only and must never alter a plan without the deterministic transition endpoint and human approval.
