---
layout: post
title: "How I Taught an AI to Navigate My API Gateway Infrastructure (So I Don't Have To)"
date: 2025-12-04 00:00:00 +0000
categories: ai devops integration automation
---

# How I Taught an AI to Navigate My API Gateway Infrastructure (So I Don't Have To)

> **Note:** All application names, SAMU IDs, key aliases, consumer names, and other potentially sensitive identifiers in this post have been obfuscated or replaced with fictional examples. Any similarity to actual system identifiers is purely coincidental.

## When "Simple Questions" Aren't Simple At All

You know how it goes. Someone pings you on Slack: "Hey, can you check why the customer API isn't working in UAT?"

Seems straightforward, right? Except now you're about to open seven different browser tabs, switch between four authentication contexts, and try to remember whether this particular environment uses the "tst1" or "uat8" naming convention. Again.

Welcome to my life as an Integration Engineer at a company, where answering what sounds like a simple question means running a marathon across our infrastructure landscape. Every. Single. Time.

## A Tour of Our Tooling Maze

Let me paint you a picture of what "checking the customer API" actually involves.

**SwaggerHub** holds all our OpenAPI specs. Different teams publish different versions at different times. The customer API? Oh, that might be on version 0.0.1, or 0.0.3, or maybe someone just pushed 0.0.7 last Tuesday and forgot to mention it in standup.

**GitLab** is where the actual configuration lives - `values.yaml` files, environment-specific overrides, integration policies, and enough YAML indentation to make a Python developer weep. Each API has its own repository, because we apparently hate ourselves.

**Tyk Gateway** runs across multiple dataplanes (dev, tst1, tst2, uat8, uat13, uat15, prod - yes, we really have that many). Each environment has its own dashboard, and naturally, the same API has completely different internal IDs everywhere. Because consistency is overrated.

**JIRA** tracks our work, with issues containing cryptic references like "check the CPM integration" buried somewhere between the third and fourth comment. Good luck figuring out that CPM means "Customer and Party Management."

**SAMU** - our Enterprise Architecture tool - claims to be "loved not only by the IT department but also by all participants involved in the transformation activities." That's an actual quote from the documentation. Take from that what you will. But honestly, it's where we keep the canonical naming for everything, so we're stuck with it.

**HashiCorp Vault** stores secrets. I don't want the AI anywhere near the actual values, but being able to confirm "yes, this secret exists and was updated last Thursday" is incredibly useful.

## The Real Problem: Death By A Thousand Tabs

Here's what investigating that "simple" customer API issue actually looks like:

I open JIRA and read about some "CPM customer service error." First puzzle: what the hell is CPM? I check SAMU and discover it's "Customer and Party Management" with ID00005832. Clever.

I search Tyk Dashboard for anything containing ID00005832. Plot twist: there are THREE different APIs under this umbrella - customer-management, customer-search, and customer-notifications. Which one is broken? Back to JIRA to decode the vague description.

Once I've figured out which API we're dealing with, I pull its configuration from Tyk, then jump to GitLab to find the source `values.yaml`. That file references a SwaggerHub spec, so now I'm in SwaggerHub checking the OpenAPI definition. While I'm there, I notice there are three newer versions of the spec. Should probably check if those matter.

![Getting Started]({{ site.baseurl }}/assets/images/posts/2025-12-04-ai-integration-engineer-skill/step1.webp)

And back to JIRA to document my findings.

That's thirteen distinct steps across five different systems. And I haven't actually fixed anything yet - this is just the *investigation*.

## The Lightbulb Moment: What If I Didn't Have To Do This?

I'd written scripts before. Plenty of them. But automating individual tasks wasn't the real problem. The cognitive load was the killer - remembering which system uses which identifier format, keeping track of where I was in the investigation flow, and context-switching so much that I started having dreams about opening new browser tabs.

What if I could hand this entire mess to an AI assistant that understood our infrastructure well enough to do the investigation for me?

## Why I Didn't Build MCP Servers

My first instinct was to build Model Context Protocol servers. I'd done it before - it works great when you need that level of structure. But here's the thing: MCP server development has overhead. You're writing protocol-aware code, handling state management, testing the communication layer. It's not hard, but it's *work*.

I wanted to move fast and iterate quickly. If I discovered something didn't work well, I wanted to fix it by editing a markdown file, not refactoring server code.

## Claude Skills: The Faster Path

Claude Code's skill system offered a different approach entirely. Instead of building protocol infrastructure, I could:

- Create CLI tools that output structured data
- Write documentation teaching the AI how to use them
- Define workflows that guide multi-step processes
- Iterate by editing documentation files

The insight that changed everything: **the AI doesn't need a complex protocol. It just needs good tools and clear instructions.**

Turns out, teaching an AI is a lot like teaching a very smart intern who takes everything literally and never gets tired of repetitive tasks.

![Work in Progress]({{ site.baseurl }}/assets/images/posts/2025-12-04-ai-integration-engineer-skill/inprogress.webp)

## Building It: One Tool at a Time

Looking at my git history is like watching someone slowly realize they're onto something:

```
e13adb0 Initial commit: Tyk CLI and utility scripts
6a6b26c Add tyk-gateway skill for Claude
ce640d2 add gitlab connection
92c84ac vault cli based integration into the skill
183e13f reorganized skillset
a18a403 swaggerhub cli tool for the skill
```

Each commit represents a moment of "oh, if I had *this*, then the AI could also do *that*."

### The Six CLI Tools

**tyk-dashboard-cli** was first. Query the Tyk Gateway, get YAML back. Simple. This let the AI search for APIs, policies, and keys without me having to manually navigate the dashboard.

**tyk-gitlab-cli** came next. The AI needed to read configuration files, check pipeline status, and see what branches existed. Giving it GitLab access was like handing it the keys to the kingdom - in a good way.

**tyk-jira-cli** was inevitable. Half our context lives in JIRA issues. The AI can now read issues, extract information, and even add structured comments with its findings. That last part is a game-changer.

**tyk-integration-naming-cli** is the rosetta stone. Given a fuzzy name like "customer," it returns the canonical SAMU ID, the integration alias, and all the other identifiers needed to search everywhere else. This tool is the reason searches actually work.

**tyk-vault-cli** provides read-only secret verification. The AI can confirm "secret exists at this path, last updated Tuesday" without ever seeing the actual secret value. Security team is happy, I'm happy, everyone's happy.

**tyk-swaggerhub-cli** closes the loop. When a JIRA issue mentions a SwaggerHub URL, the AI uses this instead of trying to fetch the URL directly (more on that particular failure mode later).

### Teaching Through Documentation

Here's something I learned the hard way: you have to be explicit about *everything*.

The JIRA CLI documentation includes this section:

> **Arguments are space-separated** (NOT colon-separated):
> ```bash
> tyk-jira-cli get-issue ILD-2017           # CORRECT
> tyk-jira-cli get-issue:ILD-2017           # WRONG
> ```

Why do I need to spell this out? Because during testing, the AI tried the colon syntax. Multiple times. It was making educated guesses about command structure based on patterns it had seen elsewhere.

Being pedantic in documentation isn't about doubting the AI's intelligence - it's about removing ambiguity so it doesn't waste tokens trying variations.

## The Skill Definition: Orchestrating Everything

The skill itself lives in a SKILL.md file that serves as the master coordinator. It opens with some rules I had to learn the hard way:

> ## CRITICAL RULES
>
> 1. **NEVER use Fetch or WebFetch for any URL.** All external access must go through the provided CLI tools.
> 2. **URLs found in JIRA issues are NOT for direct access.** Parse them and use the appropriate CLI tool.
> 3. **SwaggerHub URLs** → Extract `Owner/ApiName` → Use `tyk-swaggerhub-cli get api-metadata "Owner/ApiName"`

These rules exist because the AI's natural instinct when it sees a URL is to try fetching it. But our internal systems need authentication that the AI doesn't have directly. The CLI tools handle that complexity.

I had to literally tell it "no, don't fetch that, even though it looks like a URL" before it stopped trying.

### Understanding Our Weird Naming Conventions

One of the trickiest parts was encoding our domain model:

> ### Core Concept: One ID, Multiple APIs
>
> **CRITICAL**: A single `samu_id` (e.g., `ID00007219`) often maps to **multiple OAS APIs**, not just one.

This happens because an "Application" in our world is a logical wrapper, and under it live multiple microservices that each have their own API definition. They all share the same SAMU ID but have different service names.

**Example - One ID, Multiple APIs:**
```
Application: Order Management (ID00007219)
├── API: order-processing        (samu_id: ID00007219, service_name: order-processing)
├── API: order-tracking          (samu_id: ID00007219, service_name: order-tracking)
└── API: order-fulfillment       (samu_id: ID00007219, service_name: order-fulfillment)
```

Without understanding this, the AI would be genuinely confused when searching for "the customer API" returned three results. Now it knows this is expected behavior, not an error.

## Workflows: The Real Magic

Individual tools are nice, but workflows are where the value really is. They encode the actual process of solving problems.

### The API Investigation Workflow

This workflow takes the AI through a complete investigation:

```bash
# 1. Get JIRA context
tyk-jira-cli get-issue PROJ-123

# 2. Resolve fuzzy names to real identifiers (CRITICAL step)
tyk-integration-naming-cli search application "customer"

# 3. Find API in Tyk
tyk-dashboard-cli search oas "ID00008541"

# 4. Get GitLab configuration
tyk-gitlab-cli get file <project-id> values.yaml

# ... and so on
```

The workflow continues through checking OpenAPI specs, examining deployments, and updating JIRA with findings. It's my investigation process, codified.

### The OpenAPI Version Check Workflow

This exists specifically because I got tired of watching the AI try to fetch SwaggerHub URLs:

> ## CRITICAL: Never Fetch SwaggerHub URLs
>
> When you see:
> ```
> https://swaggerhub.kubeapps.pgsm.hu/apis/ACME/OrderManagementService/0.0.3
> ```
>
> Extract: `ACME/OrderManagementService` and use:
> ```bash
> tyk-swaggerhub-cli get api-metadata "ACME/OrderManagementService"
> ```

It took creating a dedicated workflow with explicit examples before this finally stuck.

### The Repository Modification Workflow

When you need to actually change things:

```bash
# 1. Get current config from GitLab
tyk-gitlab-cli get file <project-id> values.yaml --by-id

# 2. Find available versions in SwaggerHub
tyk-swaggerhub-cli get api-metadata "ACME/OrderManagementService"

# 3. Verify the new version spec is valid
tyk-swaggerhub-cli get api "ACME/OrderManagementService/0.0.5"

# 4. Clone repo, update, commit, push, create MR
```

This workflow also points to additional documentation about Helm configuration syntax, upstream authentication patterns, and middleware setup.

## How It All Builds

The skill has a build process that assembles everything:

```
skills/                           # Source (edit here)
└── company-integration-engineer/
    ├── SKILL.md
    └── workflows/
        ├── api-investigation.md
        └── ...

tyk/                              # CLI docs
├── tyk-dashboard-cli.md
└── ...

skill_dist/                       # Built artifact
└── company-integration-engineer/
    ├── SKILL.md
    ├── workflows/
    ├── tools/
    └── tyk-editor/
```

Running `./build_skill_dist.sh` copies everything into a distributable package that Claude Code can consume.

## The Iteration Process (Or: Learning From Failure)

Nothing worked perfectly the first time. Or the second. Here's what broke and how I fixed it:

**Problem:** Wrong command syntax
The AI tried `tyk-jira-cli get-issue:ILD-2017` with a colon.

**Fix:** Added explicit examples showing correct vs. incorrect usage to every CLI doc.

**Problem:** Fetching URLs directly
Found a SwaggerHub URL in JIRA and tried WebFetch instead of the CLI.

**Fix:** Added CRITICAL RULES at the top, plus a dedicated workflow showing URL-to-CLI transformation.

**Problem:** Guessing CLI options
Tried options like `--query` or `--project` that didn't exist.

**Fix:** Documented actual options with common patterns as examples.

**Problem:** Skipping SAMU lookup
Searched Tyk directly with free text, got no results.

**Fix:** Made Integration Naming the explicit "START HERE" in every workflow.

Each failure made the documentation better. The AI never got frustrated with my corrections, which is refreshing compared to explaining things to actual humans. But sometimes still forgetting some instructions I have already told him before.

## What It Looks Like in Practice

Now I can ask: "Check JIRA issue ILD-2017 and see if there's a newer OpenAPI version."

The AI:
1. Fetches the JIRA issue
2. Extracts the SwaggerHub reference from the description
3. Uses the CLI to check available versions
4. Reports back with current version, latest version, and recommendations

What used to take 15 minutes across five systems now takes about 30 seconds.

## Real Use Cases From Daily Work

### Use Case 1: OpenAPI Version Analysis with Auto-Generated JIRA Comment

**The ask:** "Check if there's a newer OpenAPI version for the API in this JIRA issue."

The AI fetched the issue, found the SwaggerHub reference, and queried all available versions:

```bash
tyk-jira-cli get-issue ILD-2017
tyk-swaggerhub-cli get api-metadata "ACME/OrderManagementService"
```

It discovered seven versions, identified that three newer versions existed beyond what the issue referenced, and then I asked it to "write a comment to the JIRA issue describing your analysis."

The AI formatted a professional comment with version comparison table, complete history, and recommendations, then added it:

```bash
tyk-jira-cli add-comment ILD-2017 "OpenAPI Version Analysis..."
```

I didn't have to write the comment. I didn't have to format it. The AI did all of it based on what it found.

### Use Case 2: Policy Count Analysis

**The ask:** "Find the team/integration key and count how many policies are connected."

```bash
tyk-dashboard-cli search key --filter-alias "team/integration"
# Found: 687 policies

tyk-dashboard-cli get key "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
# 94 direct API access rights, full breakdown by application
```

The AI provided complete analysis: total policies, direct access rights, breakdown by system, environment tags. We then had a conversation about capacity planning - projecting that full deployment across all 5 PREPROD environments with 100% coverage would mean roughly 6,800 policies on this key.

That's the kind of insight that would have taken me an hour to manually compile.

### Use Case 3: When the AI Builds New Tools

**The ask:** "Create a report about all keys and their policy counts."

Instead of running 103 individual queries, the AI recognized this as a scripting opportunity and wrote a shell script:

```bash
#!/bin/bash
# Query all keys with pagination (11 pages)
# Extract alias and policy count
# Sort by count descending
# Output formatted report
```

The result was a reusable script generating reports like:

```
team/integration: 687 policies
consumer/app-alpha: 512 policies
consumer/mobile-gateway: 489 policies
consumer/partner-api: 463 policies
...
(103 keys total)
```

The AI used its understanding of the CLI tools to build *new automation* on top of them. I gave it tools, and it created more tools. That's when I knew this was working.

## Enhanced Documentation: The Tyk Editor

When modifying API configurations, syntax matters. A lot. The skill includes the Tyk Resource Deployer documentation (my "Tyk Editor" docs):

```
tyk-editor/
├── index.md
├── helm/
│   ├── upstream.md
│   ├── middlewares.md
│   ├── plugins.md
│   └── x-tyk-config.md
├── cicd/
│   └── ...
└── tyk/
    └── ...
```

When the AI needs to modify a `values.yaml` file, it references these docs to understand upstream authentication, header transformations, endpoint-level middleware, and Helm templating patterns.

The Repository Modification workflow explicitly directs it:

> **Read relevant docs from `tyk-editor/` BEFORE making changes:**
>
> - Upstream/auth → `tyk-editor/helm/upstream.md`
> - Middlewares → `tyk-editor/helm/middlewares.md`
> - Plugins → `tyk-editor/helm/plugins.md`

## Patterns That Actually Work

### 1. Structured Output Makes Chaining Easy

All CLI tools output YAML. This isn't an accident:

```yaml
apis:
  - api_version: 0.0.6
    versions: [0.0.1, 0.0.2, 0.0.3, 0.0.4, 0.0.5, 0.0.6]
```

The AI parses this, compares versions, and decides what to do next. No additional instructions needed.

### 2. Environment Categories Beat Raw Environment Names

Instead of dealing with individual environments, we organize into categories:

- **NONPROD** → dev (has its own consumer keys)
- **PREPROD** → tst1, tst2, uat8, uat13, uat15 (default for most work)
- **PROD** → prod (separate everything)

This matches how we actually think about deployments and prevents "whoops, I just modified production" moments.

### 3. The "START HERE" Pattern

Every workflow begins with Integration Naming:

```bash
# Before anything else:
tyk-integration-naming-cli search application "customer"
# → id: ID00005832, integration_alias: cpm

# Now search with confidence:
tyk-dashboard-cli search oas "ID00005832"
tyk-gitlab-cli search projects "cpm"
```

Skipping this step leads to empty results or wrong results. Making it the mandatory first step eliminated an entire class of failures.

### 4. Show The Wrong Way Too

Every CLI doc includes explicit examples of incorrect usage:

```bash
# CORRECT:
tyk-gitlab-cli search projects "name"

# WRONG:
tyk-gitlab-cli search:projects "name"      # colon syntax doesn't work
tyk-gitlab-cli get file --project 636      # this option doesn't exist
```

Showing what *doesn't* work is surprisingly effective.

### 5. URLs Are Data, Not Endpoints

This was a mental shift for both me and the AI. When you find a URL in JIRA, treat it as data to parse:

```
URL: https://swaggerhub.example.com/apis/ACME/ServiceName/0.0.3
                              ↓
Extract: ACME/ServiceName
                              ↓
CLI: tyk-swaggerhub-cli get api-metadata "ACME/ServiceName"
```

Same pattern for GitLab URLs, Tyk Dashboard links, everything.

### 6. Solutions Become Tools

When the AI solves a complex task, that solution can become a reusable script. The policy count example showed this beautifully - a one-time query became a persistent tool.

The AI understands the CLI patterns well enough to compose them into loops, conditionals, and data transformations. The original skill multiplies itself.

## What I Learned About Building AI Skills

**Start with CLIs, not protocols.** A well-designed CLI that outputs structured data is all you need. Skip the server infrastructure.

**Documentation is literally training data.** The quality of your docs directly determines how well the AI performs. Be explicit. Show examples. Anticipate mistakes.

**Iterate based on actual failures.** Watch how the AI uses your skill, identify where it goes wrong, fix those specific cases. Each refinement improves all future executions.

**Constraints are features.** Telling the AI what NOT to do prevents entire categories of errors. The CRITICAL RULES section isn't optional.

**Workflows encode expertise.** Individual tools are useful, but workflows that combine them - that's where your domain knowledge lives and where the real value is.

## Workflow Documentation Patterns

### Decision Trees Work

Workflows include explicit branching logic:

> ### If values.yaml Has SwaggerHub Reference
> When `OAS.openapi` contains `/Owner/Api/Version`:
> ```bash
> tyk-swaggerhub-cli get api "Owner/Api/Version"
> ```
>
> ### If values.yaml Has Local File Reference
> When `OAS.openapi` starts with `./`:
> ```bash
> tyk-gitlab-cli get file <project-id> openapi.yaml --by-id
> ```

This handles conditional logic that would otherwise require trial and error.

### Verification Checklists

Workflows end with explicit verification:

> ## Verification Checklist
>
> - [ ] Entity resolved in Integration Naming
> - [ ] Pipeline status: success
> - [ ] API active in Tyk
> - [ ] SAMU ID matches across systems
> - [ ] Consumer keys exist in Vault

The AI doesn't declare victory prematurely.

### Common Mistakes Tables

Workflows include explicit anti-patterns:

> | Wrong | Right |
> |-------|-------|
> | `Fetch(https://swaggerhub...)` | `tyk-swaggerhub-cli get api-metadata` |
> | `WebFetch(url)` | Use the CLI tool |
> | Opening in browser | Use CLI commands |

The contrast format is surprisingly effective.

### Field Mapping Across Systems

Complex systems have fields that map to each other:

> | Integration Naming | values.yaml | Tyk API Name | Policy Name |
> |-------------------|-------------|--------------|-------------|
> | `id: ID00008541` | `samu_id: ID00008541` | contains `ID00008541` | `id00008541-...` |
> | `integration_alias: cpm` | `integration_alias: cpm` | path contains `cpm` | - |

Helps the AI understand that the same thing appears differently everywhere - uppercase here, lowercase there, prefixed in one place, suffixed in another.

## How It Actually Runs

When I invoke the skill with a task:

1. **Skill loads** - Claude Code loads SKILL.md, sees CRITICAL RULES first
2. **Context established** - AI understands its role and constraints
3. **Workflow selection** - Picks appropriate workflow based on task
4. **Tool documentation** - Reads relevant CLI docs before executing
5. **Execution** - Runs commands with correct syntax
6. **Verification** - Checks results against expected patterns
7. **Reporting** - Formats findings (tables, JIRA comments, etc.)

The SKILL.md orchestrates everything, pointing to workflows for tasks and tool docs for execution details.

## What's Next

The foundation is solid. Future possibilities include:

- **Automated deployment verification** - Run verification workflow after pipeline completion automatically
- **Cross-environment drift detection** - Compare configs everywhere, flag differences
- **Consumer access auditing** - Regular reports on who has access to what
- **Version upgrade recommendations** - Proactive notifications about newer OpenAPI versions

Each of these is just another workflow leveraging the existing CLI tools.

## It's Still Evolving

The skill continues to improve. I find edge cases, add new workflows, refine documentation. But the foundation is solid, and each improvement multiplies the system's capability.

The key insight: **this is much easier to build than you think**. You don't need to be an AI expert or build complex infrastructure. You need:

- Good CLI tools that output structured data
- Clear documentation with examples
- Willingness to iterate based on failures

The AI handles the rest.

## By The Numbers

**CLI Tools:** 6 specialized command-line interfaces covering Tyk, GitLab, JIRA, SAMU, Vault, and SwaggerHub

**Workflows:** 6 guided processes encoding investigation and modification patterns

**Time savings:** Investigation reduced from ~15 minutes to ~30 seconds

**Real data from usage:**
- 103 consumer keys tracked across environments
- 687 policies on a single key (projected 6,800 at full deployment)
- 7 OpenAPI versions discovered in a single query
- Automated JIRA comments with structured analysis

---

![Final Result]({{ site.baseurl }}/assets/images/posts/2025-12-04-ai-integration-engineer-skill/final.webp)

*This skill represents an ongoing evolution in how I work. Each iteration makes the system smarter, each new use case reveals opportunities. The AI learns from better documentation, not from complex training. And honestly? That's the best part.*