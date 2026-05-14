# Apply Pass 5 — AIFranchisePerformanceBenchmarker

- **Date:** 2026-05-08
- **Stack:** Vite-React + Express. Backend uses Sequelize CRUD factory + dedicated routes; FE in `client/src/`. JWT bearer; `aiRateLimiter`; `ai.callAI` helper.
- **Audit source:** `_AUDIT/reports/batch_04.md` #2 (template-clone, 0 AI per audit — stale).

## Verified present (no new work)

- Pass 1-4 added: `/api/ai/chat`, `/ai/alert-scan`, `/ai/anomaly-scan`, `/ai/benchmark-recompute`, `/ai/unit-rank`, `/ai/predictive-closure`, `/ai/best-practice-extraction`, `/ai/labor-cost-optimizer`, `/goals/:id/weekly-narrative`, plus per-entity `/ai-analyze` and `/ai-analyze-all` from `crudFactory.js`.
- Pass 5 added `server/routes/extensions.js` (mounted at `/api/extensions`) with 7 backlog items implemented (above the 5-cap):
  1. POS integration sync/status (NEEDS-CREDS: POS_API_BASE_URL/POS_API_KEY).
  2. SOP RAG (in-memory hashed-BoW; PRODUCT-DECISION — full vector store deferred).
  3. P&L roll-up (PRODUCT-DECISION; aggregates FinancialRecord by region/owner).
  4. Franchise-to-franchise messaging (PRODUCT-DECISION).
  5. Agentic compliance auditor sweep (PRODUCT-DECISION).
  6. Peer mentorship matching (PRODUCT-DECISION).
  7. Supplier negotiation assistant (PRODUCT-DECISION).
- FE: `client/src/pages/ExtensionsPage.jsx` mounted in `App.jsx` line 61; helpers in `services/api.js`.

## Implemented (this pass)

None — pass 5 already complete (7 items > cap, documented in pass-5 file header).

## Deferred

| Item | Category | Reason |
|------|----------|--------|
| Real-time POS data flow | NEEDS-CREDS | Endpoint stubbed with 503; production POS API access needed. |
| Real vector DB for SOP RAG | NEEDS-CREDS | Hashed-BoW is in-memory; pgvector/Pinecone deferred. |
| Multi-tenant message threading | NEEDS-PRODUCT-DECISION | Current direct-to-recipient only; threads/groups deferred. |
| Continuous-loop agentic auditor | TOO-RISKY | On-demand sweep only; daemon scheduling out-of-scope. |
| Bulk-buy negotiation execution | TOO-RISKY | AI recommendation only; no transaction execution. |

## Smoke test

- `node --check server/index.js` PASS.
- `node --check server/routes/extensions.js` PASS.
- Babel-parse of `client/src/pages/ExtensionsPage.jsx` PASS.
- Live HTTP smoke: skipped (existing pass-4 note documents `helmet` module gap blocking server boot under no-install constraint).

## Notes

Cap exceeded by prior pass (7 items implemented). This pass: verification only.
