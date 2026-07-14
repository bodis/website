---
layout: post
title: "The System Nobody Can Read"
date: 2026-07-14 00:00:00 +0000
categories: ai architecture legacy
---

<p class="post-lead">Post 1 of a series on teaching a legacy system to explain itself.</p>

## The war room

The invite is always thin. A calendar block appears with a subject like *"WAR ROOM — settlement
delays — PROD"*, a bridge link, and no agenda. You don't need an agenda. Everyone knows the
agenda: something, somewhere, inside a platform that runs hundreds of business processes for a
tier-1 bank, is not doing what it should — and nobody can say yet **what**, **why**, or even
**where**.

I've sat in a lot of these rooms over the past decade, across more than one domain. The
pattern is always the same. The call starts with four people and grows to fourteen, because
the only reliable way to find the problem is to keep
inviting people until the union of what they remember covers the path the failing transaction
took. Ops has the logs open. A module owner recognizes a process name. Someone from integrations
knows which external system that step talks to. And then, forty minutes in, a specific engineer
joins — the one who remembers why a particular timeout is set to a particular value — and the
room exhales, because now the narrowing can finish.

```text
        Finding the problem, the only way we could
        ───────────────────────────────────────────

  ~570 business processes      "it's somewhere in the platform"
             │                  ops + duty manager on the bridge
             ▼
   one suspect module           ~80 interdependent workflows
             │                  + two module owners join
             ▼
     one workflow               the failing process, finally named
             │                  + the integration specialist joins
             ▼
   one interface call           a single request to one external system
                                + the one engineer who remembers
                                  why its timeout is set that way
```

Here's the thing that took me longest to accept: the war room is not a failure of the people in
it. It's the *system working as designed* — because the only complete map of that platform is the
combined memory of everyone on the call.

And what were we usually chasing? Something a customer would describe as *a 15-second click*.
One ordinary transaction that, behind the button, crosses **two runtime generations** — a
20-year-old legacy monolith and a 10-year-old modernized platform, coupled so that transactions
run through *both* — touches several of ~45 connected external systems, and ends in a settlement
instruction to an external venue. Any weak link in that chain surfaces as a customer-facing
delay. Or, worse, as a manual database fix at 2 a.m. that no audit trail will ever show.

The system works. That's not the problem. The problem is that **nobody can read it**.

## The map that exists only in footsteps

Let me put numbers on "nobody can read it", because the scale is the story.

The platform runs roughly **570 defined business processes**; one high-traffic module alone
holds more than 80 interdependent workflows. Those processes call about **500 Java delegates** —
the code steps where the actual business logic lives. Underneath sit some **550
business-relevant tables across three separate database schemas**, linked not by database
constraints but by references buried in application code — a constellation held together by
convention and memory. Around all of it: **~45 external systems** (exchanges, a central
securities depository, core banking, market data, regulatory reporting) and **200–300 GB of logs
a day**.

Nowhere in that estate is there a catalog that says what each workflow does, why it exists, what
it reads, what it writes, or who depends on it. That knowledge exists — but it has leaked out of
the code and into people, ticket threads, and ad-hoc notes. Onboarding a new engineer means weeks
of code archaeology. Parts of the system have been described, by the people who maintain them, as
*too convoluted to describe out loud*.

Two details make it worse. An embedded third-party low-code rules framework hides business rules
inside configuration, adds layer upon layer to every call stack, and concentrates understanding
in outside specialists — a brain the bank *rents* but doesn't own. And a core transactional table
uses an entity–attribute–value design, with 100k+ rows per entity type: unoptimizable, and too
risky to change precisely because no one can enumerate what depends on it.

I think of the system's true behavior as a path worn into grass — visible only as the footsteps
of the people who walk it daily. While they're around, the path is obvious. When they leave, it
fades, and newcomers wander.

That's Ring 1 of the problem. There are three more rings around it.

## The problem map

This series is one long walk through a single map, so here it is. Each later post zooms into one
ring.

```text
┌───────────────────────────────────────────────────────────────┐
│ RING 4 · THE THESIS — "so what do we do?"                     │
│ stop looking for a button; build our own way, navigating      │
│ toward a north-star                              → Posts 3–7  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ RING 3 · TECHNIQUE LIMITS — "why isn't this solved?"    │  │
│  │ the obvious 2026 answers each help a little,            │  │
│  │ and each breaks at scale                     → Post 2   │  │
│  │  ┌───────────────────────────────────────────────────┐  │  │
│  │  │ RING 2 · THE BUSINESS RISK                        │  │  │
│  │  │ can't migrate safely · can't onboard quickly ·    │  │  │
│  │  │ can't satisfy auditors · can't grow  → this post  │  │  │
│  │  │  ┌─────────────────────────────────────────────┐  │  │  │
│  │  │  │ RING 1 · THE BLACK BOX                      │  │  │  │
│  │  │  │ what the system does — and why — lives in   │  │  │  │
│  │  │  │ people, tickets and notes; it can't be      │  │  │  │
│  │  │  │ queried, audited, or handed over            │  │  │  │
│  │  │  │                               → this post   │  │  │  │
│  │  │  └─────────────────────────────────────────────┘  │  │  │
│  │  └───────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

Ring 1 you've just seen. Let's walk outward.

## Ring 2 — when a black box becomes a business risk

For years, a black box is survivable. You staff the war rooms, you protect the veterans, you
budget extra weeks for "small" changes. What changes everything is a forcing event — and this
platform has three at once.

**The migration clock is ticking.** The workflow engine at the platform's core reached the end
of community support, and the next major version is not an upgrade — it's a different execution
model. Moving means rewriting, in effect, ~570 processes and ~500 code steps. Staying means
accumulating legacy-ICT risk on a system a regulator has already signaled would not meet modern
ICT-control expectations as-is. Stay or move, both paths run straight through the black box:
**you cannot safely rewrite what you cannot describe.**

**The dual-run coupling is unsustainable.** Remember the 15-second click:

```text
                customer click  (~15 seconds)
                       │
                       ▼
        ┌──────────────┐   dual-run    ┌──────────────┐
        │   20-year    │◄─────────────►│   10-year    │
        │   legacy     │   coupling    │  modernized  │
        │   monolith   │               │   platform   │
        └──────┬───────┘               └──────┬───────┘
               │                              │
               ▼                              ▼
          3 database schemas · ~550 tables
          linked only by application code, no cross-schema constraints
               │                              │
               ▼                              ▼
          ~45 external systems: exchanges · central securities
          depository · core banking · market data · regulatory reporting
```

Every transaction that threads through both runtimes doubles the surface where something can go
quietly wrong — and doubles the number of experts a war room needs.

**Growth is blocked on opacity.** New products and a wider rollout are strategic goals, and each
one asks the same unanswerable question first: *what exactly would this change touch?* When ops
performs manual database interventions daily — with no audit trail — the honest answer is
"nobody fully knows."

This is the compounding at the heart of Ring 2: **knowledge debt becomes delivery risk.** The
risk never shows up on a dashboard, because dashboards measure the system's behavior — not
whether anyone can explain it.

## Ring 3 — "surely AI solves this by now?"

This is where every 2026 reader raises a hand: point a large language model at the repository
and ask it questions. Believe me, we didn't skip that step. Before building anything, we reached
for the obvious buttons — the ones everyone would — and watched each help a little, then break.

| The obvious answer | It helps because… | It falls short because… |
|---|---|---|
| Point a long-context LLM at the repo | it reads a lot at once | the system is bigger than any window can *reason over*; and it forgets everything between runs |
| An advanced RAG product (vector **+** graph) | it scales as the codebase grows | answer quality stays far below acceptable for a system this interconnected |
| A single AI agent investigating on its own | it works on small, coherent code | it redoes generic work every run, can't build on prior runs, and invents its own structure each time |
| Write the documentation by hand | most accurate on day one | it drifts immediately, and bottlenecks on the few experts you can least spare |

I'm being deliberately shallow here — each of those rows deserves, and will get, a proper
dissection in Post 2, grounded in what actually happened when we tried them on a real system.
For now the point is only this: the obvious fixes are good tools facing the wrong job, and each
one breaks at this scale in its own instructive way.

## The baseline nobody defends

One row of that table deserves its full treatment now, because it's the baseline every
enterprise already lives with: *just write the docs.*

We estimated what a proper hand-written map of this platform would take: on the order of **six
months** of effort — from exactly the senior people who are already the bottleneck for every
change, incident, and migration decision. And here is the crueler part:

```text
   day 0          month 3          month 6            month 9
   docs = code    code has moved   docs "finished"    nobody trusts them
   ●───────────────●────────────────●──────────────────●
   accurate        drifting         already stale      back to asking people
```

The map would be stale before it was finished. Manual documentation isn't wrong because writers
are careless; it's wrong because it's a *snapshot* strapped to a *moving* system. Every
enterprise knows this, which is why the wiki is always three reorganizations out of date, and
why the war room — living memory, assembled on demand — remains the only documentation that's
never stale.

That's the bar any real solution has to clear: not "better than nothing," but **better than the
war room.**

## Ring 4 — so we started building

So we stopped looking for a button.

Not because we enjoy building infrastructure — because the elimination was honest. Each obvious
approach contained one or two ideas that genuinely worked, wrapped in assumptions that didn't
survive contact with ~570 interdependent processes. So we started small, our own way: keep the
few ideas that worked, discard the rest, and aim the whole effort at a fixed point on the
horizon.

Here's the reasoning style I'll use for every decision in this series, stated once in full: **we
chose to map the system before rewriting it, because you cannot safely change what you cannot
describe — and what we gain is a basis for every later decision: migration planning, audit
answers, onboarding, impact analysis. What it costs is real too: time spent on understanding
before shipping features.** Every choice from here on gets that same treatment — what we chose,
why, what it buys, what it costs.

And the honest admission, up front, in post one: **our approach isn't finished and doesn't solve
everything.** It trades a known set of problems — the black box, the war rooms, the borrowed
brain — for a new and more tractable set: keeping the map true as the code moves, keeping it
structured as it grows, keeping it usable at scale. No tool removes the need for human judgment
about what *matters* in a system this size; it can only make the system legible enough that
judgment becomes possible. And some knowledge — *why was it built this way in 2009?* — may be
genuinely gone; the best we can do is capture and validate what's still recoverable.

What keeps the work coherent is a north-star we navigate toward rather than a product we claim
to have finished: turn the system itself into a **continuously-true, queryable model** — so that
"what does this actually do?" stops depending on who is still at the company, and the war room
stops being the only interface to the truth.

## What's next

I said the obvious AI answers fall short. That deserves more than a wave of the hand — because
we didn't read about those failures, we paid for them. **Post 2 takes each approach apart**:
what long-context models, a serious vector+graph RAG product, and autonomous agents actually did
when pointed at a large production system — where each one helped, where each one broke, and the
single shared reason behind all of it.

*The one-line preview: they all retrieve or re-derive text. None of them builds — and keeps — a
model.*

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

  .post-content pre {
    font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
    font-size: 0.82rem;
    line-height: 1.45;
  }

  @media (max-width: 768px) {
    .post-content pre {
      font-size: 0.72rem;
    }
  }
</style>
