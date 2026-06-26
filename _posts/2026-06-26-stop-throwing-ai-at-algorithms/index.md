---
layout: post
title: "Stop Throwing AI at Algorithms"
date: 2026-06-26 00:00:00 +0000
categories: ai automation devops
---

<p class="post-lead">A token-optimization menu, and the orchestrator I deleted.</p>

![An ornate, over-engineered mechanical AI brain looming over a tiny, simple glowing loop on a pedestal]({{ site.baseurl }}/assets/images/posts/2026-06-26-stop-throwing-ai-at-algorithms/hero.jpg)

There's a particular kind of embarrassment that only hits experienced engineers. It's the moment you realize you reached for the most expensive, most complicated tool in the shed to solve a problem that a `for` loop would have handled before your coffee got cold. This is a post about that feeling, and about all the clever things we do to make AI cheaper *after* we've already decided — often wrongly — that we needed AI at all.

Let me start with the part where I was the fool.

---

## The 200 projects, and the babysitter that shouldn't have existed

We have a lot of repositories. More than four hundred. Periodically we need to sweep through them and check for dependency upgrades, deprecated APIs, the usual slow rot of a large estate. We already had an AI skill that did this *beautifully* for a single project: it called a set of predefined CLI tools (not MCP, but the same spirit — thin, deterministic data collectors), gathered the facts from our backbone systems, analyzed them, and — depending on how confident it was — either proposed a change or opened a merge request outright. For one repo, it was genuinely excellent work.

Then someone asked the obvious question: can we run this across the ~200 repositories that are actually processable? And here is where I did the easy, hyped, slightly lazy thing.

I spun up an orchestrator agent. It would reason about which project to tackle next, launch a subagent per repository, and keep track of the whole campaign. Five minutes of setup and it was running. It even *mostly* worked.

```
        ┌─────────────────────────┐
        │     Orchestrator AI     │   reasons about which project
        │      (one big session)  │   comes next, holds 200 results
        └────────────┬────────────┘   in a single, growing context
                     │  spawn · track · re-read
      ┌──────┬───────┼───────┬─────────────── … ───┐
      ▼      ▼       ▼       ▼                     ▼
   ┌─────┐┌─────┐┌─────┐┌─────┐                ┌────────┐
   │ #1  ││ #2  ││ #3  ││ #4  │       …        │ #200 │
   └─────┘└─────┘└─────┘└─────┘                └────────┘

   the orchestrator's context grows with every project →
   context rot near the tail · ~2 in 100 projects mis-initialised
```

"Mostly" is the word that should make any engineer suspicious. Near the end of the run — somewhere past the 180th project — the orchestrator's context had ballooned with the accumulated state of everything it had already done. It started getting sloppy. A couple of times out of a hundred, it set a project up the wrong way entirely. Context rot, paying premium token rates, with a small but real error tail. For a *scheduling* task.

That's the word that finally landed. **Scheduling.** Deciding what runs next and remembering what already ran is not a reasoning problem. It is one of the oldest, most thoroughly solved problems in computer science. It's a task queue. I had hired a brilliant, expensive, easily-distracted intern to read items off a list — and the list never changed.

So I deleted the orchestrator. I wrote a small script that scans the estate, filters down to the genuinely processable repositories, and writes a ledger — a plain YAML file with one entry per task. Then a worker loop walks the ledger and runs each job as a direct, isolated process, with a few flexible branches to handle the cases that don't fit the happy path.

```
   ┌──────────────────────────────┐
   │ build_ledger.sh              │   plain script: scan repos,
   │   → ledger.yaml (200 tasks)  │   keep the 200 real ones
   └───────────────┬──────────────┘
                   │
   ┌───────────────▼──────────────┐
   │ for task in ledger:          │   no reasoning, no shared
   │   run job as its own process │   context — just scheduling
   └───────────────┬──────────────┘   and retries
      ┌──────┬─────┼─────┬───────── … ──┐
      ▼      ▼     ▼     ▼              ▼
   [ #1  ][ #2  ][ #3 ][ #4 ]    …   [ #200 ]
   each run: isolated · fresh · restartable · logged

   orchestration tokens: 0 · both failure modes: gone
```

The orchestration layer now costs nothing, never rots, and is restartable from any point because the ledger *is* the state. Same outcome, none of the AI bill on that layer, and — this is the part that actually matters — it's **more reliable**, not less. The 2% mis-initialization rate didn't get optimized down. It disappeared, because the failure mode it came from no longer exists.

I knew every token-optimization trick in the book. None of them was the answer. The answer was to not have the problem.

---

## The question before the question

The lesson generalizes into a single decision you should make *before* you start tuning anything:

```
                 ┌────────────────────────────┐
                 │  I want to automate a task │
                 └─────────────┬──────────────┘
                               ▼
          ┌────────────────────────────────────────┐
          │ Does the CORE of it need judgement,     │
          │ language, or fuzzy pattern matching?    │
          └──────────┬──────────────────┬───────────┘
                  NO │                  │ YES
                     ▼                  ▼
        ┌──────────────────────┐   ┌──────────────────────────┐
        │ Write a script.      │   │ Is the WHOLE task fuzzy,  │
        │ Deterministic, free, │   │ or just one step of it?   │
        │ testable, boring.    │   └─────┬───────────────┬─────┘
        └──────────────────────┘  one step│             │ all of it
                                          ▼             ▼
                          ┌────────────────────┐ ┌────────────────────┐
                          │ Script the flow,   │ │ Use AI — and only   │
                          │ call AI for the    │ │ NOW ask: do I even  │
                          │ one fuzzy step.    │ │ need token opt?     │
                          └────────────────────┘ └────────────────────┘
```

Most "AI automation" tasks are mostly plumbing with a small fuzzy core. The plumbing — moving files, scheduling jobs, parsing structured output, enforcing a format, gating on a condition — is deterministic. It belongs in a script. Reserve the model for the genuinely fuzzy part: the judgement call, the natural-language summary, the "does this diff look risky" intuition. If you can shrink the AI's job down to just that core, you've done more for your bill than any proxy ever will, and you've removed a whole class of failure modes for free.

Only once you've honestly answered *"yes, this part needs a model"* does the rest of this post become relevant.

---

## The menu

![Seven stacked glass slabs descending from cool, calm blue at the top to unstable, crackling red-violet energy at the bottom]({{ site.baseurl }}/assets/images/posts/2026-06-26-stop-throwing-ai-at-algorithms/the-menu.jpg)

Say you've decided AI genuinely earns its place. Now the question is how hard to work at keeping it cheap — and the honest answer is **it depends entirely on your workload**. Some of these techniques will save you a fortune. Some will do nothing for your particular use case. And at least one of them can actively *corrupt your output* if you apply it to the wrong content. Treat this as a buffet, not a checklist.

```
   cheaper · safer
        |
   [ L0 ]  Don't use AI ........... algorithmic? → script it
   [ L1 ]  Don't generate ......... hooks + shell (jq, fmt, lint)
           what you can compute
   [ L2 ]  Protect the cache ...... static-first prompt, prefix
                                    invariance, TTL choice
   [ L3 ]  Keep context clean ..... /compact, scoped sessions,
                                    lazy tool loading
   [ L4 ]  Compress the payload ... content-aware proxy + retrieval
                                    /!\ CAN DESTROY code / YAML / JSON
   [ L5 ]  Route to cheap/local ... big orchestrator + small subs
   [ L6 ]  Shape the output ....... terseness, effort routing, caps
        |
   heavier · riskier · more moving parts
```

The order is deliberate. The cheap, safe, boring techniques are at the top. The powerful, fiddly, occasionally dangerous ones are at the bottom. Work top-down, and stop as soon as your costs are acceptable. People love starting at L4 because it feels the most clever. It is usually the least worth it for the effort.

### L0 — Don't use AI

You just read 600 words about this. Moving on.

### L1 — Don't generate what you can compute

This is the highest-leverage trick that almost nobody bothers with, because it's not glamorous. Coding agents support lifecycle **hooks** — shell commands that fire before or after a tool runs ([Claude Code hooks docs](https://docs.claude.com/en/docs/claude-code/hooks)). They are a zero-token mechanism for doing deterministic work the model would otherwise do autoregressively and badly.

Two patterns earn their keep immediately:

- **Filter input before it ever enters context.** A `PreToolUse` hook that pipes a log file through `jq` or `grep` to extract just the error lines turns a 30,000-token dump into a few hundred tokens *before the model sees a single one of them.*
- **Offload formatting entirely.** A `PostToolUse` hook running `prettier`, `eslint --fix`, or `cargo fmt` means the model never spends a single (expensive, autoregressive) output token reproducing whitespace-perfect code. It writes the logic; the formatter makes it pretty.

One caveat worth knowing: if a formatter rewrites the file beyond the exact bytes the model emitted, the agent notices the file "changed unexpectedly" and logs a reconciliation message — which costs a few tokens on every edit. Usually still a massive net win, but it's not literally free.

This layer is where my orchestrator story lives, by the way. The ledger-and-worker loop is L1 thinking applied to the whole problem.

### L2 — Protect the prompt cache

This is the one that quietly costs people the most, because it's invisible until you look at a bill.

Prompt caching gives you roughly a **90% discount** on input tokens for the cached prefix ([Anthropic prompt caching docs](https://docs.claude.com/en/docs/build-with-claude/prompt-caching)). But it's a strict, byte-level prefix match — not fuzzy similarity. The API hashes the exact bytes of your prompt up to a cache breakpoint. Change one byte early in that sequence and everything after the change is re-processed at the full base rate.

Three practical consequences:

- **Static first, dynamic last.** Never interpolate volatile data (timestamps, the current working directory, anything that changes per turn) into your system prompt or `CLAUDE.md`. That mutates the start of the byte sequence and invalidates the entire downstream cache on *every* request. Put dynamic state at the *end* of the message array, behind the big static block.
- **Mind the clock.** The default cache TTL is short — on the order of a few minutes. If you fire off a prompt, then wander off to a meeting for an hour and come back to your still-open session, that 100,000-token context is no longer cached. Your next "quick question" re-bills the entire history at full input price. If you're stepping away from a fat session, either `/compact` it first, start fresh when you return, or opt into a longer-TTL cache if your workflow has long natural pauses (it costs more to write, but saves you the cold rebuild).
- **Switching models burns the cache.** The cache is per-model. Bouncing from a big model to a small one mid-session to handle a "trivial" sub-task forces the small model to rebuild its cache from a cold start — which can cost more than just letting the expensive model answer the trivial thing. Counterintuitive, but real. (This has direct implications for L5; see below.)

### L3 — Keep the context clean

Context is not a free conversational buffer; it's a geometric cost mechanism, because agentic loops resend the whole history every turn. Hygiene matters:

- **Compact proactively, not reactively.** Native auto-compaction kicks in when the window gets dangerously full — but to summarize a bloated context, it first has to *send* that bloated context to the model. Done late and automatically, this can trigger cascading summarization passes, each one expensive. Run `/compact` yourself at natural task boundaries, well before you're forced to.
- **Scope ruthlessly.** Only let the agent see the files and directories that the current step actually needs. A smaller window means a cache miss hurts less and reasoning stays sharper.
- **Lazy-load your tools.** A rich MCP setup can inject tens of thousands of tokens of tool schemas into your prefix before you type anything ([Model Context Protocol](https://modelcontextprotocol.io)). Tool-search / lazy-loading mechanisms keep only a lightweight registry resident and pull full schemas for the handful of tools a task actually needs — reclaiming most of that polluted context.

### L4 — Compress the payload (carefully)

Here's the layer everyone wants to start with, and the one with the sharpest edges.

The idea: drop a transparent proxy between your agent and the API. It intercepts outbound payloads, compresses them, and forwards a smaller representation. Modern proxies are **content-aware** — they route different content to different strategies, because a JSON blob, a Python file, and a wall of log text should not be compressed the same way. The serious open-source example here is [Headroom](https://github.com/chopratejas/headroom), which routes JSON to a deterministic structural crusher, source code to an AST-aware compressor built on [tree-sitter](https://tree-sitter.github.io), and prose to a small local model — and crucially keeps the originals locally so the model can retrieve the full text on demand if the compressed version loses something it needs (the "compress-cache-retrieve" pattern).

Now the warning, in bold, because your source content makes it matter: **naive, entropy-based compression will silently destroy structured payloads.** The classic approach (e.g. perplexity-based pruning à la Microsoft's [LLMLingua](https://github.com/microsoft/LLMLingua)) ranks tokens by "information content" and strips the low-scoring ones. That's fine for conversational prose. It is catastrophic for code, JSON, and especially YAML — because the things it classifies as "low information" are exactly the closing brackets, the quote marks, the *indentation* that carries all the meaning. Strip a YAML file's whitespace by entropy and you haven't compressed it, you've corrupted it.

So the rule for this layer:

- **Verbose, low-structure content** (CLI output, log dumps, large JSON API responses, RAG chunks): compresses brilliantly, often 80–95%. Great fit.
- **Code, configs, YAML manifests**: this is where compression earns its danger warning. Good proxies handle this by being *conservative* — leaving recent and actively-discussed code untouched, and falling back to lossless or pass-through handling for formats they don't have a structural parser for. The savings here are modest precisely *because* aggressive compression here is unsafe. If a tool promises you huge savings on your Helm values and Kubernetes manifests, be suspicious, and test reversibility before you trust it.

If your day is mostly hand-curated config and code, L4 will underwhelm you — and that's the proxy being responsible, not failing.

### L5 — Route to cheaper (or local) models

Not every request deserves a frontier model. A coding session is many workloads wearing one coat: summarizing a diff, naming a branch, and compacting old context are throwaway chores; planning a refactor is genuine reasoning. A routing proxy like [claude-code-router](https://github.com/musistudio/claude-code-router) intercepts requests and sends each type to the model you actually want — including a dedicated `background` route for those constant throwaway calls and a `subagent` route for delegated work.

Taken to its conclusion, you can route investigative subtasks to a **local** open-weights model entirely — point the proxy at [LM Studio](https://lmstudio.ai) or [Ollama](https://ollama.com) running a Qwen-class model, and let local hardware absorb the noisy `kubectl`-and-logs phase while only the distilled answer comes back to the cloud orchestrator. Zero API cost for the investigation, and your sensitive context never leaves the machine.

Two hard-won caveats:

- **Size matters for tool-calling.** Small local models (7–9B) reliably fall apart on strict tool-calling over long agentic loops. You want 30B-class models or better for anything that has to emit clean tool calls repeatedly.
- **Remember L2.** Routing a sub-task to a different model means that model builds its cache from cold. For a genuinely noisy, high-volume investigative phase, that's a win. For a single trivial question, the cold-start write can cost more than you saved. Route by *workload shape*, not reflex.

### L6 — Shape the output

Input tokens can be cached and compressed. Output tokens cannot — they're generated one at a time and they're the single most expensive resource you're buying. So squeeze them:

- **Steer for terseness.** Proxies can append a brevity directive to the end of the system prompt (cache-safe, because it's at the end), killing the "Great, let me now…" preamble.
- **Constrain the shape.** If you need structured data back, don't make the model narrate. Ask for a pipe-delimited line or a minimal template, and parse it with `awk`/`sed` — bypassing the token tax of conversational JSON-with-commentary.
- **Route the effort.** Extended "thinking" is billed as output. Defaulting to deep reasoning on routine steps quietly burns tens of thousands of tokens. Reserve high effort for novel errors and real planning; downgrade it when the agent is just continuing after a successful tool result.

And there are more techniques than this — network-level deduplication, schema-aware minification, classifier-based pruning, speculative cache pre-warming. The space is moving fast, and the specific tool names will have rotated by the time you read this. The *categories* are the durable knowledge; the products are disposable. Re-evaluate before you adopt.

---

## So… should you optimize at all?

![A balance scale, one pan holding glowing tokens burning away into sparks, the other a small steady flame, the beam tilted almost imperceptibly]({{ site.baseurl }}/assets/images/posts/2026-06-26-stop-throwing-ai-at-algorithms/optimize-or-not.jpg)

Here's the contrarian closer. Having listed seven layers of optimization, I want to argue that for a lot of work you should use **none of them**.

If your interaction is a **one-shot, human-in-the-loop conversation** — you, a person, working through a problem with an agent in real time — then the economically rational move is often to just let the tool run and do its thing. The cognitive overhead of managing a compression proxy, tuning cache breakpoints, and routing models will cost you more in engineering attention than you'll save in tokens. Let the agent optimize itself and get on with your actual job.

But notice the quiet asymmetry buried in that advice. When you "let the tool optimize itself," you're trusting a system whose vendor *makes money when you burn tokens.* That's not a conspiracy — providers ship real cost-saving features like caching and compaction, and they have genuine reasons to want you happy. But token efficiency is, structurally, not their top priority the way it is yours. The incentives are merely *adjacent*, not aligned. So "let it run" is the right call for one-off interactive work, and the wrong call the moment something becomes a **high-volume, repeated, automated pipeline** — because that's where the gap between "adjacent" and "aligned" compounds into a real bill. That's exactly the territory where you should be ruthless, starting at L0.

The whole thing collapses into two questions, asked in order:

1. **Does this actually need AI, or am I about to hire an intern to read a list?**
2. **If it does need AI — is this a one-shot I should just let run, or a pipeline I should engineer?**

Answer those two honestly and you'll have done more for your costs, your reliability, and your dignity than any proxy on the menu. The cleverest token optimization I did all quarter wasn't on this list. It was a YAML file and a `for` loop.

---

### References

- Anthropic — Prompt caching: <https://docs.claude.com/en/docs/build-with-claude/prompt-caching>
- Anthropic — Claude Code hooks: <https://docs.claude.com/en/docs/claude-code/hooks>
- Model Context Protocol: <https://modelcontextprotocol.io>
- Headroom (content-aware compression proxy): <https://github.com/chopratejas/headroom>
- claude-code-router (model routing proxy): <https://github.com/musistudio/claude-code-router>
- Microsoft LLMLingua (entropy-based prompt compression — note the caveats above): <https://github.com/microsoft/LLMLingua>
- tree-sitter (AST parsing, the basis for safe code compression): <https://tree-sitter.github.io>
- LM Studio: <https://lmstudio.ai> · Ollama: <https://ollama.com>

*Tool names in this space rotate quickly; the layer model is the part worth keeping. Verify any tool's current behaviour — especially its handling of code and YAML — before you trust it with production payloads.*

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
