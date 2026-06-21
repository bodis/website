---
layout: post
title: "Teaching a Fleet of API Proxies to Explain Themselves"
date: 2026-06-21 00:00:00 +0000
categories: ai devops automation security
---

<p class="post-lead">An autonomous approach to paying down migration debt and reverse-engineering the truth.</p>

> **Note:** Application names, secret references, key aliases, and other potentially sensitive identifiers in this post have been obfuscated or generalized. Any resemblance to specific system identifiers is coincidental.

## TL;DR (the 30-second executive summary)

Migrating an API gateway is relatively straightforward; migrating the *truth* about those APIs is the real challenge.

When we migrated our legacy API proxies to Tyk, the migration ETL tool did exactly what it was supposed to: it faithfully extracted the original proxy definitions and translated them to the new platform. Secrets were securely copied into our new Vault, and routing rules were ported one-to-one. But an ETL tool can only migrate the data it's given — and years of organic architectural drift had made that data stale.

We had roughly 200 proxies, and many were drifting: migrated Vault secrets out of sync with the real upstream configuration, and OpenAPI definitions referencing outdated or incomplete endpoint lists. With our new SwaggerHub-driven SDLC we finally had the capability to maintain a precise, real-time "menu" of our APIs — but to do that, and to safely lock endpoints down with **RBAC**, we needed to know exactly what every upstream service was *truly* exposing. With the team steering a migration of **250+ APIs toward a Spring 2026 deadline**, validating that by hand wasn't an option. So I built an autonomous AI loop that reverse-engineers the truth from the running environment.

<div class="stat-strip">
  <div class="stat-card">
    <span class="stat-number">182</span>
    <span class="stat-label">proxies investigated</span>
  </div>
  <div class="stat-card">
    <span class="stat-number">~250</span>
    <span class="stat-label">actionable findings</span>
  </div>
  <div class="stat-card">
    <span class="stat-number">13</span>
    <span class="stat-label">dead proxies found</span>
  </div>
  <div class="stat-card">
    <span class="stat-number">$0</span>
    <span class="stat-label">out-of-pocket ($307 metered)</span>
  </div>
  <div class="stat-card">
    <span class="stat-number">~⅓</span>
    <span class="stat-label">findings auto-fixable</span>
  </div>
</div>

**The impact:**

- **Scale:** investigated **182 proxies** and surfaced **~250 concrete, actionable findings**.
- **Security unlocked:** by discovering each service's *true* endpoint list, we can now publish an accurate API catalog and properly lock down access with **RBAC** — the thing the migration was blocking.
- **Cleanup:** safely identified **13 entirely dead proxies** with no living upstream, flagged for immediate decommission.
- **Cost:** the token-metered equivalent was about **$307**, but it ran inside an existing Anthropic **Max plan**, so the actual out-of-pocket cost was **zero**.
- **Quick follow-up win:** roughly **a third** of the findings are mechanically auto-fixable — a cheap second pass away from being cleared.

We replaced a decade of blind trust with hard evidence, and proved that autonomous agents can safely take on large-scale DevOps debt **when given the right boundaries**.

---

## Part 1 — The migration reality and the API "menu"

When we modernized onto Tyk, we moved the proxy definitions over one-to-one — and to be clear, the migration ETL (Extract, Transform, Load) tool performed exceptionally well. It used multiple techniques to preserve the original definitions, faithfully extracting configuration from our legacy Apigee-era gateway, translating it into Helm charts, and copying the original secrets into our new Vault infrastructure.

The tooling did its job perfectly. The problem is that it perfectly replicated **years of undocumented drift.**

```
  Legacy gateway  ──(migration ETL: faithful, one-to-one)──►  Tyk Helm charts
   (a decade of                                                "correct as copied"
    organic drift)                                                   │
                                                                     ├─ secrets copied ✓
                                                                     │    …but not always the ones
                                                                     │      the upstream now uses
                                                                     ├─ routing ported ✓
                                                                     │    …but backend paths moved
                                                                     └─ OAS reference carried ✓
                                                                          …but endpoints grew, and
                                                                            SwaggerHub now exists
```

The secrets landed safely in Vault, but weren't always in sync with the *real* upstream config. The OpenAPI definitions were worse: some proxies still referenced deprecated endpoints; others exposed only a fraction of a service that had quietly grown over the years.

And this had to be true across **three deployment tiers** — **NONPROD** (DEV), **PREPROD** (UAT + TST), and a strict **PROD** — each of which could drift independently.

Our modern delivery process changed the game: **SwaggerHub** became our system of record, finally giving us a place to keep OpenAPI definitions strictly current. But enforcing that new SDLC meant we couldn't trust the migrated legacy configs — we had to know what each upstream was *actually* serving. That isn't just administrative cleanup:

- A correct, comprehensive endpoint list is a clean **"menu"** other teams can consume.
- Knowing exactly what's exposed lets us configure **RBAC** to secure specific endpoints.

The goal was to bridge the gap between a faithfully-migrated legacy config and the living reality of the services — a secure, accurate catalog developers can trust.

---

## Part 2 — The autonomous solution

The traditional fix is to track down each upstream's owner, send dozens of messages, and collect the facts by hand. I inverted it: instead of asking humans what a proxy *should* do, reverse-engineer what it *actually* does from the running deployment.

Before letting an agent loose, I defined precisely what a "configuration review" means for our estate — **three alignments**, each checked against the live world with a dedicated CLI as the evidence source:

```
  For each proxy's values.yaml, verify 3 alignments against the LIVE systems:

    ① Vault credential   → vault-cli      : does the referenced secret field actually
                                            exist and resolve for this environment?
    ② Routing accuracy   → tyk-cli + k8s  : do the proxy's listen-path / prefix match
                                            what the backend service truly expects?
    ③ SwaggerHub align   → swaggerhub-cli : is the referenced spec current & published —
                           + the image      and does it match the endpoints the running
                                            container actually serves?
```

Those three checks are the whole point. Everything else is plumbing to answer them honestly. The loop that runs them:

```
        scan_proxies.py
              │  builds / refreshes
              ▼
        ┌───────────────┐        the resumable work-list & state DB
        │  ledger.yaml  │◄───────  (status · steps · metrics, one row per proxy)
        └───────────────┘
              ▲   │ pick next `todo`
   finalize   │   ▼
  (only the   │   ┌─────────────────────────────────────────────────────────┐
   driver     │   │  run_loop.sh — the single-writer autonomous driver      │
   writes     │   │  • reachability pre-filter (no upstream → flag as dead) │
   here)      │   │  • one fresh, context-cleared Sonnet session per proxy  │
              └───┤  • read-only · resumable · self-pauses on rate limits   │
                  └────────────────────────────┬────────────────────────────┘
                                               ▼
        ┌─────────────────────────────────────────────────────────────────┐
        │  ONE clean session — acts like a detective                      │
        │                                                                 │
        │  pull the upstream image · decompile · read the real interfaces │
        │  · cross-check  ①vault-cli  ②tyk-cli/k8s  ③swaggerhub-cli     │
        │  · write findings into the repo README · open ONE Merge Request │
        │                                                                 │
        │  ( the image investigation is a reusable "k8s-app-investigator" │
        │    skill — and ~60–70% of all the work in a run )               │
        └──────────────────────────┬──────────────────────────────────────┘
                                   │ RESULT <status> <mr_url> <open_issues>
                                   ▼
                ┌─────────────────────────────────────────────┐
                │  OPUS ORCHESTRATOR (observe & improve)       │
                │  watches cost/quality · suggests prompt      │
                │  tweaks · HALTS on a NEEDS-ATTENTION verdict │
                └─────────────────────────────────────────────┘
```

In plain terms, each proxy is handed to its own fresh AI session (the worker is **Claude Sonnet**). The agent pulls the upstream container image, reads the real interfaces, cross-checks the live Tyk gateway, SwaggerHub, and Vault, writes everything it finds into the repository's README, and opens a single Merge Request.

One nuance that matters for trust: **it does not freely "fix" things.** Only the narrowest, provably-correct change is ever applied automatically (e.g. a routing prefix it can *prove* from the backend). **Everything else — even findings it's fairly confident about — is logged as an explicit "Open issue" for a human.** In practice the vast majority of MRs touch only the README; the live config is left alone. That conservatism is deliberate, and Part 3 shows exactly why.

---

## Part 3 — Keeping the AI honest

Letting an AI analyze infrastructure sounds great until it confidently breaks production. The guardrails:

- **Read-only against live systems.** The agent could look but not touch — it queried live systems from cached snapshots and only ever proposed changes via an isolated Git branch and MR.
- **A single source of truth.** Only the main driver script updates the central work-list, which makes the whole sweep crash-safe and fully resumable. Hit an API rate limit and it simply pauses and resumes itself when the window reopens.
- **An orchestrator watching the metrics.** While the Sonnet workers did the heavy lifting, a **Claude Opus** orchestrator monitored cost and quality. Watching the loop run let me optimize the prompts *mid-sweep* — cutting the number of "turns" the AI took and driving the compute cost down as the project went on, with no change to what the investigation produces. (The whole flow is also portable to a fully local stack — **OpenCode + LM Studio + a Qwen 3 model** — just slower.)

**Did the guardrails work? Absolutely** — and the harness earned its keep by catching two moments where the AI overreached:

- **The "everything" spec.** For a deliberately narrow 2-endpoint migration shim, the agent exported the upstream's *entire* 67-endpoint application spec and committed it — accidentally including internal `/health` and `/status` endpoints that must never reach a published gateway API.
- **The confident hallucination.** Into a hand-authored proxy, the agent invented a complete OAuth block and malformed Vault secret references and wrote them straight into the Helm `values.yaml` — almost certainly breaking the render.

Because of the one-at-a-time review, both were caught immediately and reverted before going anywhere. The boundary held — proving that **agents are excellent at investigation but require supervision for complex edits.** It's also why auto-fix is kept so deliberately small.

---

## Part 4 — The results

The sweep investigated **182 proxies**. The remainder were either deduplicated migration twins or — notably — **13 dead proxies** pointing at services deleted long ago, caught for free by the reachability pre-filter and instantly flagged for decommission.

Across the rest, the agent raised **~250 actionable findings** (123 proxies carried at least one; 59 came back completely clean). Grouped against the three alignments — with the column that matters most to an engineer, *can the agent just fix it?*:

| What the agent found | ~count | Auto-fixable? |
|---|---:|---|
| **① Vault reference mismatch** — migrated secret ref isn't the one the upstream actually uses (API key injects empty) | ~31 | ✅ repoint to the verified upstream Vault reference |
| **③ OAS version drift** — SwaggerHub has a newer, backward-compatible version | ~27 | ✅ bump the OAS version |
| **③ Spec extracted from the image** — a real OpenAPI now exists but was never published | ~12 | ✅ publish/register it to SwaggerHub |
| **③ Placeholder → real SwaggerHub link** — a migrated stub with a genuine SwaggerHub match | a few | ✅ swap the local ref for the SwaggerHub one |
| **② Routing / upstream path-prefix** (503/404, missing `/v1`) | ~35 | ⚠️ partial — add prefix when provable; cluster routes need ops |
| **Identity / listen-path mismatch** (samu_id, alias, service name) | ~40 | ⚠️ partial — changes routing identity → confirm first |
| **③ Spec ↔ image endpoint gap** — each missing what the other has | ~25 | ❌ owner decides which side is canonical |
| **Missing Tyk deployment in some environments** | ~14 | ❌ a deployment/ops task |
| **Dead proxy — no live upstream** | **13** | ❌ flag for decommission (human call) |

The ✅ rows — **wrong Vault references, stale API versions, never-published specs, missing SwaggerHub links** — are precisely the migration debt the project set out to pay down, and they're roughly **a third of all findings**. A second, narrowly-scoped auto-fix pass (with the same review harness watching) could clear them mechanically. The rest are now documented in front of the right human owners instead of hiding silently in production.

The entire estate is now **validated**. We've replaced a fragile web of trust with hard, verifiable evidence at fleet scale — the foundation for an accurate API catalog and real RBAC, and one of the last blockers cleared on the road to the Spring 2026 migration. And because the whole system is repeatable and resumable, re-validating the infrastructure next quarter is a **single terminal command**, not a multi-month project.

---

*Under the hood: per-proxy worker **Claude Sonnet**; observability/orchestration **Claude Opus** (portable to OpenCode + LM Studio + Qwen 3). Investigation driven by a reusable `k8s-app-investigator` skill plus `vault-cli` / `tyk-cli` / `swaggerhub-cli` / `gitlab-cli`.*

---

*Do you have any ideas, comments, or anything to add on this topic? Contact me: [LinkedIn](https://www.linkedin.com/in/tamas-bodis)*

<style>
  .post-lead {
    font-size: 1.25rem;
    line-height: 1.6;
    color: var(--text-secondary);
    font-style: italic;
    margin: 0 0 32px 0;
    padding-left: 18px;
    border-left: 4px solid var(--primary);
  }

  .stat-strip {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;
    margin: 32px 0;
  }

  .stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 20px 16px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: relative;
    overflow: hidden;
    transition: transform 0.3s ease, border-color 0.3s ease;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(to right, var(--primary), var(--secondary));
  }

  .stat-card:hover {
    transform: translateY(-4px);
    border-color: var(--primary);
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.1;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
    line-height: 1.35;
  }

  @media (max-width: 768px) {
    .stat-strip {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
