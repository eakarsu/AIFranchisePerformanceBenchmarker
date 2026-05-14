# Audit Apply Notes — AIFranchisePerformanceBenchmarker

Audit source: `_AUDIT/reports/batch_04.md` (#2). Audit verdict: template-clone, 0 AI endpoints, no node_modules.

## Reality check

Audit is stale. The codebase actually has node_modules installed and substantial AI integration via a CRUD factory (`routes/crudFactory.js`). Each entity (franchise-units, revenue-records, etc.) automatically gets `/:id/ai-analyze` and `/ai-analyze-all` endpoints. Plus standalone AI: `/ai/chat`, `/ai/chat/stream`, `/ai/alert-scan`, `/ai/anomaly-scan`, `/ai/benchmark-recompute`, `/goals/:id/weekly-narrative`.

## Implementations applied

Added two endpoints to `server/index.js`:

1. `POST /api/ai/unit-rank` — local aggregation (revenue, profit, margin, ratings) per franchise unit; ranks by `metric` (composite/revenue/margin/rating); AI explains top vs. bottom and recommends actions.
2. `POST /api/ai/predictive-closure` — pulls units + revenue trajectory + compliance + reviews; AI returns 0-100 closure-risk per unit.

These cover the audit's `/unit-performance-comparison`, `/anomaly-detection`, `/predictive-closures`. The audit's `/best-practice-extraction` and `/labor-cost-optimizer` go to backlog. Syntax-checked.

## Backlog (prioritized)

### Mechanical
- `/best-practice-extraction` — codify what top units do well.
- `/labor-cost-optimizer` — uses StaffMember model.

### Needs creds / external
- Real-time POS integration with franchise units.
- SOP repository RAG (needs vector store).

### Needs product decision
- Multi-unit P&L roll-up reporting.
- Franchise-to-franchise messaging.

### Custom features
- Agentic compliance auditor (continuous).
- Peer mentorship matching.
- Supplier-bulk-buy negotiation assistant.

## Apply pass 3 (frontend)

- **Action:** LEFT-AS-IS — FE already wired (including pass-2 additions).
- **Verification:**
  - `client/src/services/api.js` exposes helpers for chat / alert-scan / anomaly-scan / benchmark-recompute / weekly-narrative.
  - `client/src/pages/AIBenchmarkPage.jsx` posts to `/api/ai/unit-rank` and `/api/ai/predictive-closure` (apply-pass-2 endpoints) directly.
  - `App.jsx` routes `ai-benchmark`; nav exposes `benchmark-reports`.
  - JWT supplied via axios interceptor from `localStorage.getItem('token')`.
- No files modified.

## Apply pass 4 (mechanical backlog)

Implemented both remaining MECHANICAL items from the prior backlog:

1. **Best-practice extraction** — `POST /api/ai/best-practice-extraction` in `server/index.js`. Aggregates a composite score per `FranchiseUnit` (revenue + margin + rating), takes the top-N (default 5), pulls supporting `TrainingProgram` / `ComplianceRecord` / `StaffMember` rows for those units, then asks the LLM to codify the recurring patterns into actionable best practices. Persists via `persistAIResult('FranchiseUnit', null, 'best-practice-extraction', ...)`. Returns 503 when `OPENROUTER_API_KEY` is unset.
2. **Labor-cost optimizer** — `POST /api/ai/labor-cost-optimizer` in `server/index.js`. Aggregates active `StaffMember` salaries / hours / performance per unit, joins to revenue + financials for labor-to-revenue ratio, and asks the LLM to recommend role consolidation, overtime trimming, and schedule re-balancing to hit `target_reduction_pct` (default 10%). Optional `unit_id` filter. Returns 503 when `OPENROUTER_API_KEY` is unset. Persists via `persistAIResult('StaffMember', unit_id|null, 'labor-cost-optimizer', ...)`.

Both endpoints reuse `auth`, `aiRateLimiter`, `ai.callAI`, `parseAIJson`, `persistAIResult` — no new deps.

FE: extended `client/src/pages/AIBenchmarkPage.jsx` with two new tabs (`Best Practices`, `Labor Cost Optimizer`) following the existing tab/form/`StatPill` pattern. Posts via the same `api` axios instance (JWT bearer via interceptor). Explicit 503 message in `setError` path. Helpers `runBestPracticeExtraction` and `runLaborCostOptimizer` added to `client/src/services/api.js`.

**Backlog now:** all MECHANICAL items implemented; remaining backlog (POS integration, SOP RAG, P&L roll-up, franchise messaging, agentic auditor, peer mentorship, supplier negotiation) all require credentials, product decisions, or new vector / messaging infrastructure.

**Smoke test:** `node --check server/index.js` PASS, `node --check client/src/services/api.js` PASS, `esbuild client/src/pages/AIBenchmarkPage.jsx` PASS. Live HTTP smoke skipped — `node index.js` errors with `Cannot find module 'helmet'` (server `node_modules` incomplete and the apply pass forbids `npm install`).
