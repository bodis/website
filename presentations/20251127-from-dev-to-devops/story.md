# From Java to YAML: A Backend Engineer's DevOps Journey at Yettel
## Presentation-Annotated Version

---

<!-- SLIDE: title -->
```yaml
slide_id: title
slide_title: "From Java to YAML: A Backend Engineer's DevOps Journey"
image_prompt: "Comic book style title page showing a confused developer sitting at a desk covered in coffee cups. On one monitor: clean Java code with Spring Boot annotations. On the other monitor: an endless scroll of YAML files with Kubernetes and Helm charts. The developer has a thought bubble with a question mark. Behind them, a pile of books labeled 'Kubernetes', 'Go', 'Tyk', and 'GitOps'. Style: colorful comic book art, slightly humorous, tech workspace."
short_summary: |
  A 6-month transformation story: from backend Java developer to DevOps integration engineer at Yettel Hungary. Mission: migrate 250+ APIs from Apigee to Tyk while building a GitOps deployment pipeline. Spoiler: It involved more race conditions and Go plugins than advertised.
```

## Executive Summary

This document chronicles a 6-month journey of transforming from a backend engineer (Java stack, strong architecture background) into a DevOps integration engineer at Yettel Hungary. The mission: orchestrate the migration from Apigee to Tyk API Gateway for one of Hungary's largest telecom companies, while building a GitOps-first deployment pipeline that would replace years of clickops infrastructure with proper automation.

**Spoiler alert**: It involved more race conditions, Kubernetes operators with opinions, and Go plugins than initially advertised.

---

<!-- SLIDE: chapter1 -->
```yaml
slide_id: chapter1
slide_title: "Welcome to DevOps, Here's Your Kubernetes"
image_prompt: "Comic strip with 3 panels: Panel 1: New team member arriving at office, manager handing them a laptop saying 'Welcome to the team!' Panel 2: The new developer opening laptop to see 6 terminal windows, each showing different error messages from kubectl, GitLab, Vault, and SAMU. Panel 3: Developer looking shocked with spiral eyes, thought bubble showing a fortress with multiple locked gates labeled 'Permissions'. Background shows a countdown timer to 'Spring 2026 Deadline'. Style: humorous comic book art with exaggerated expressions."
short_summary: |
  Joined Yettel's 6-person integration team (3 brand new, others recently departed) to migrate 250+ APIs from Apigee to Tyk. The challenge: multiple environments, security zones, zero direct app communication allowed. First task: spend 2 months collecting permissions to access all the systems. Key lesson: DevOps means knowing more apps than developers, almost as many as architects.
```

## Chapter 1: "Welcome to DevOps, Here's Your Kubernetes"

### The Setup

In early 2024, I joined Yettel Hungary's 6-person integration team (though "6-person" is generous considering 3 of us were brand new, 1 person had just left for another department, and 2-3 others had vanished in the previous 2 years). The mission was clear, if somewhat terrifying: migrate 250+ APIs from Apigee to Tyk while building a production-grade GitOps deployment pipeline.

The architecture constraints were... interesting:
- Multiple environments (UAT8, UAT15, TST2, etc.) all sharing infrastructure 
- Multiple security zones requiring different firewall configurations
- Zero direct app-to-app communication allowed (everything through the gateway "wall")
- Both sync (HTTP/REST/WebSocket/gRPC/SSE) and async (Kafka) gateway solutions
- An enterprise architecture inventory system (SAMU) that was *theoretically* the source of truth

**Key revelation from day one**: "DevOps is different because you need to know more apps than developers and almost as many as high-level architects."

Translation: You're now responsible for understanding how ~250 completely different APIs work, their security requirements, their upstream dependencies, AND you get to deploy them all without breaking production. *No pressure*.

### The First Two Months: Permission Quest 2024

The initial phase was less "DevOps engineer" and more "professional permission requester." Yettel's security team is... let's say *thorough* when it comes to outsiders needing access. As a DevOps engineer, I needed access to:
- GitLab repositories (dozens of them)
- Kubernetes clusters (multiple environments)
- Tyk Dashboard instances
- Vault for secrets management
- SAMU for architecture inventory
- Swaggerhub for OpenAPI specs
- Various monitoring and logging systems

By the time I had all the necessary permissions, I'd already:
- Fixed several pipeline bugs in various repos
- Corrected Kafka topic partition configurations
- Debugged Java and Python applications
- Learned more about Helm templating than I ever wanted to know
- Developed a deep appreciation for the phrase "it works on my machine"

---

<!-- SLIDE: chapter2_vision -->
```yaml
slide_id: chapter2_vision
slide_title: "The Tyk Migration Vision"
image_prompt: "Comic panel showing two parts - TOP: A beautiful, clean architecture diagram with neat boxes labeled 'GitOps', 'Helm', 'Tyk Operator' flowing smoothly with green checkmarks and arrows. Everyone smiling. BOTTOM: Reality - the same diagram but with red X marks, tangled spaghetti arrows going everywhere, small fires breaking out, and a confused engineer staring at a screen showing 'ERROR 500'. Style: before/after comparison, comic book style with contrasting moods."
short_summary: |
  The plan: Create GitOps pipeline using Helm and Tyk Operator for on-demand API deployment. Support multi-team permissions and SLAs. Simple, right? Reality: Apigee was an ESB in disguise with JavaScript everywhere. Tyk's sales demos looked great but reality had surprises - no multi-upstream support, vault integration issues, and operator bugs.
```

## Chapter 2: The Tyk Migration - Or, "How Hard Can API Proxying Be?"

### The Original Vision

The plan seemed straightforward:
1. Create a pipeline for deploying API proxies on demand
2. Use GitOps methodology (everything in Git)
3. Support triggering from external systems
4. Handle multi-team permissions and SLA requirements
5. Use Helm charts as the default technology
6. Leverage Tyk Operator and custom CRDs

What could possibly go wrong?

### The Reality Check

**Problem #1: The Apigee Legacy**

The old Apigee setup wasn't a "simple proxy." It was basically an ESB in disguise:
- JavaScript-based transformations everywhere
- Reusable "shared flows" (spoiler: not so reusable in Tyk)
- APIs that merged multiple backends
- APIs that split single backends into multiple endpoints
- Enough XML to make any modern developer weep

**Problem #2: Tyk's Sales Team vs. Reality**

The sales demos showed beautiful API gateway functionality. What they *didn't* show:
- No native support for multiple upstream hosts per API endpoint
- No global URL rewrite (only endpoint-level)
- Vault integration requiring root tokens (security said "lol, no")
- Performance issues with Vault lookups (no caching)
- The operator having... *opinions* about how things should work

**Problem #3: "It's Not Just a Gateway"**

The integration needed to handle:
- OpenAPI definition downloads from Swaggerhub
- Reference resolution in nested OpenAPI specs
- Vault integration for storing API keys
- Environment-specific configurations across 15+ named environments
- In-Kubernetes firewall rules (because one firewall wasn't enough)
- Dynatrace integration for traces and analytics
- SAMU integration for architecture inventory
- Contract repositories for consumer-provider agreements

---

<!-- SLIDE: chapter2_poc -->
```yaml
slide_id: chapter2_poc
slide_title: "The Two-Month 'PoC'"
image_prompt: "Comic showing a skateboard made of duct tape and broken parts with wheels pointing different directions, labeled 'Our PoC'. An engineer sits on it nervously while another engineer pushes, both sweating. In the background: a checklist on a wall with half items checked in green (Basic proxy, Helm deployment) and half in red X (Performance testing, Analytics, Production readiness). A sign pointing forward says 'To Production' with a cliff visible ahead. Style: humorous comic book art emphasizing makeshift solution."
short_summary: |
  After 2 months: created something that 'technically worked' - like a skateboard is transportation. Had Helm deployment and basic proxy functionality. Didn't have: performance testing, zone traffic handling, analytics, or any confidence in production. Missing: a way to handle API keys without tears.
```

### The Two-Month "PoC"

After two months, we had something that technically worked. Let me be generous: it was "functional in the way a skateboard is a mode of transportation." It had wheels, it moved, but you wouldn't want to transport anything important on it.

What we had:
- ✅ Helm-based deployment
- ✅ Basic API proxy functionality
- ✅ Some policies and keys

What we didn't have:
- ❌ Performance testing
- ❌ Zone-to-zone traffic handling
- ❌ Real analytics
- ❌ Any confidence in production readiness
- ❌ A way to handle API keys that didn't make us cry

---

<!-- SLIDE: chapter3_plugins -->
```yaml
slide_id: chapter3_plugins
slide_title: "The Plugin Era: When YAML Isn't Enough"
image_prompt: "Two-panel comic: LEFT: Engineer looking at YAML file with sad face, text bubble 'YAML can't do everything'. RIGHT: Same engineer now wearing a cape, holding a glowing Go file (golang gopher mascot visible), surrounded by floating code snippets. Three smaller panels show: 1) Traffic routing to different servers, 2) Headers being validated with checkmarks, 3) Vault secrets being magically retrieved. Style: superhero transformation scene, comic book style with dramatic lighting."
short_summary: |
  When YAML limitations hit, we went to Go plugins. Plugin #1: Dynamic Router - route to different upstreams based on headers, paths, methods. Plugin #2: Header Validator - supports underscores in API keys, dynamic Vault path construction. Built complete plugin development pipeline with testing, versioning, and automated deployment. Key lesson: Regex compilation should happen once, not per request (CPU says thanks).
```

## Chapter 3: The Plugin Era - "When YAML Isn't Enough"

### Why Plugins?

Tyk has extensibility through Go plugins. This is both a blessing and a curse. A blessing because you can extend functionality; a curse because now you're maintaining Go code in a DevOps pipeline.

### Plugin #1: The Dynamic Router

**The Problem**: Tyk doesn't support multiple upstream hosts per API endpoint natively. Sometimes you need to route to different backends based on headers, keys, path patterns, or whatever business logic demands.

**The Solution**: A Go plugin that evaluates routing rules and dynamically sets the upstream target.

**Key Features**:
- Path matching (prefix and regex)
- Method-based routing
- Header-based routing
- Request path rewriting
- Support for Tyk's context and configuration

**Lessons Learned**:
- Tyk plugins are standalone functions, not middleware classes
- Reuse Tyk's existing infrastructure (logging, context handling)
- Unit tests are your friend (integration tests are expensive)
- Clean separation between business logic and infrastructure = testability

**The Fun Part**: Discovering that regex compilation needs to happen once, not per request, unless you enjoy watching your CPU weep.

### Plugin #2: The Header Validator

**The Problem**: Standard Tyk header middleware doesn't like underscores in API keys (we used them). Also, we needed dynamic Vault path construction based on request headers.

**Example**: Template like `$vault_secret.kv-v2/dir1/dir2/{$HEADER_alma}/secret_key` where `{$HEADER_alma}` gets replaced with the actual header value.

**The Solution**: Custom header middleware that:
- Supports underscore characters in keys
- Enables dynamic Vault path construction
- Validates header formats
- Provides detailed logging with trace IDs

**The Interesting Bit**: WebSocket authentication happens only during the initial HTTP handshake, and browsers don't allow custom headers on WebSocket requests, so we had to use query parameters. *Sigh*.

### Plugin Development Pipeline

We built a complete plugin development workflow:
- Separate Git repository for each API-specific plugin
- Generic plugins in a shared repository
- Automated testing (unit tests, not just "does it compile")
- Deployment to artifact repository (Nexus/ProGet)
- Automatic download during API deployment
- Versioning and rollback support

**Pro tip**: When your plugins start having plugins, it might be time to reconsider your architecture. We weren't quite there, but we could see it from where we stood.

---

<!-- SLIDE: chapter4_race -->
```yaml
slide_id: chapter4_race
slide_title: "The Race Condition Saga"
image_prompt: "Comic strip showing: Panel 1: Two pipelines (represented as cartoon runners) racing toward a key (literal key icon) on a pedestal. Panel 2: Both grab the key simultaneously, a 'CRASH!' effect. Panel 3: The key transforms from having 'apply_policies' label to 'access_rights' label, looking corrupted with glitch effects. Panel 4: Engineer at desk with detective hat and magnifying glass examining Tyk source code files. Panel 5: Light bulb moment - engineer discovers 'lazy evaluation' diagram. Style: mystery detective comic with action sequences."
short_summary: |
  Mystery: Keys mysteriously converting from policy-based to API-based permissions. Investigation revealed: 1) Tyk's lazy policy evaluation (applies at runtime, caches in Redis), 2) Keys can't be both policy AND API mode, 3) Race conditions in pipeline creating malformed payloads with both fields. Solution: strict payload validation, never include access_rights when updating policy keys, implement locking, add verification steps.
```

## Chapter 4: The Race Condition Saga - Or, "Eventual Consistency is Eventually Consistent"

### The Mystery

Keys started mysteriously converting from policy-based to API-based permissions. Not all keys. Not predictably. Just... sometimes.

**Symptoms**:
- Keys that should have `apply_policies` instead had `access_rights`
- Policy references vanishing into the ether
- Keys working fine, then suddenly having wrong permissions
- Orphaned policy references that couldn't be cleaned up

### The Investigation

This required diving into Tyk's source code:
- `reverse_proxy.go` - Understanding request handling
- `api_loader.go` - Understanding API loading
- `session_manager.go` - Understanding key management

**Discovery #1: Lazy Policy Evaluation**

Tyk doesn't apply policies when you create a key. It applies them *at runtime* during the first request, then caches the result in Redis.

```
Key Created → Just has policy IDs
First Request → Policy applied → Results cached in Redis session
Policy Deleted → Cached session persists with materialized access_rights
Key looks "converted" → Actually just showing cached settings
```

**Discovery #2: The Dual-Mode Disaster**

Keys can be policy-based OR API-based, not both. But the API accepts both fields:
```json
{
  "apply_policies": ["policy-id"],  // Policy mode
  "access_rights": {...}            // API mode
}
```

If you include both in a PUT request, Tyk's internal failover mechanism "helpfully" converts the key from policy mode to API mode.

**Discovery #3: The Race Condition**

Our GitLab pipeline did this:
```
1. Pipeline A: GET key → Merge new policies → PUT key
2. Pipeline B: GET key → Merge new policies → PUT key (simultaneously)
3. Pipeline A completes
4. Pipeline B overwrites A's changes
5. Chaos ensues
```

With concurrent pipelines updating keys, we were creating malformed payloads with both fields, triggering the conversion mechanism.

### The Solution

**Rule #1**: NEVER include `access_rights` when updating policy-based keys. Ever. Not even if it seems like a good idea.

**Rule #2**: Implement optimistic locking or pessimistic locking for key updates.

**Rule #3**: Add verification steps in the pipeline:
```python
def update_key_safely(key_id, new_policy_ids):
    # 1. Get current key state
    current_key = tyk_api.get_key(key_id)
    
    # 2. Validate mode
    if "access_rights" in current_key and "apply_policies" in current_key:
        raise ValueError("Key is corrupted - mixed mode!")
    
    if "access_rights" in current_key:
        raise ValueError("Key is in API mode, cannot add policies!")
    
    # 3. Build clean payload - ONLY policy fields
    update_payload = {
        "org_id": current_key["org_id"],
        "apply_policies": new_policy_ids,  # ONLY this
        "expires": current_key.get("expires", 0),
        "meta_data": current_key.get("meta_data", {}),
        # DO NOT include access_rights
    }
    
    # 4. Update with clean payload
    tyk_api.put_key(key_id, update_payload)
    
    # 5. Verify it worked
    verify_key_update(key_id, new_policy_ids)
```

**Rule #4**: Add a verification step to ensure the operator finished its work before proceeding.

---

<!-- SLIDE: chapter5_refactoring -->
```yaml
slide_id: chapter5_refactoring
slide_title: "Architecture Evolution: The CLI Refactoring"
image_prompt: "Before/After comic: TOP (Before): Giant monolithic block labeled 'deploy_api()' with 800 lines, showing a tangled mess of spaghetti code, smoke coming out, error messages everywhere. Engineer crying. BOTTOM (After): Clean modular boxes arranged in a pipeline: 'Collect' → 'Validate' → 'Generate' → 'Deploy' → 'Verify' → 'Configure' → 'Test'. Each box clean and organized. Same engineer now smiling with thumbs up. GitLab artifacts flowing between stages. Style: dramatic before/after transformation, comic book style."
short_summary: |
  Refactored monolithic 800-line deploy_api() function into modular multi-stage pipeline: 1) Artifact Collection, 2) Validation, 3) Generation/Dry Run, 4) Deployment, 5) Verification, 6) Key Configuration, 7) Post-Deployment. Benefits: modularity, testability, flexibility, easier debugging, inspectable artifacts at each stage. Each function focused, testable, and reusable.
```

## Chapter 5: Architecture Evolution - The CLI Refactoring

### The Problem

Our initial Python-based Tyk Deployer CLI was monolithic:
```python
# deploy_api() - 800 lines
# Does EVERYTHING:
# - Downloads from Swaggerhub
# - Validates OpenAPI
# - Connects to SAMU
# - Generates Helm charts
# - Deploys via Helm
# - Configures keys
# - Tests deployment
# - Makes coffee (okay, not really)
```

This made it:
- Hard to test individual components
- Difficult to reuse logic
- Impossible to run steps independently
- A nightmare to debug
- Resistant to extension

### The Refactoring

We moved to a multi-stage architecture:

**Stage 1: Artifact Collection**
- Download OpenAPI from Swaggerhub
- Collect integration.yaml from contract repositories
- Resolve OpenAPI references
- Store as GitLab artifacts

**Stage 2: Validation**
- Validate OpenAPI structure
- Validate integration.yaml format
- Validate values.yaml schema
- Check SAMU integration

**Stage 3: Generation (Dry Run)**
- Generate Helm manifests
- Create policy definitions
- Generate firewall rules
- Store as artifacts (future snapshot point)

**Stage 4: Deployment**
- Deploy API via Helm
- Deploy Security Policies
- Deploy firewall configurations

**Stage 5: Verification**
- Check Tyk Operator sync status
- Verify CRs have required fields
- Validate API is accessible

**Stage 6: Key Configuration**
- Register/update Tyk keys
- Sync permission matrices
- Update Vault if needed

**Stage 7: Post-Deployment**
- Generate Postman collection
- Sync to Postman Cloud
- Send notifications

### The Benefits

**Modularity**: Each stage is a separate command with clear inputs/outputs.

**Testability**: Unit test validators, integration test full pipeline.

**Flexibility**: Run stages independently or in sequence.

**Debugging**: When stage 5 fails, you don't need to re-run stages 1-4.

**Artifacts**: Every stage produces artifacts that can be inspected, stored, or redeployed.

### The Code Structure

```python
# Old way
deploy_api(args)  # 800 lines, does everything

# New way
collect_artifacts(args)  # Downloads and collects
validate_artifacts(args)  # Validates collected artifacts
generate_manifests(args)  # Creates deployment files
deploy_helm(args)  # Deploys to cluster
verify_deployment(args)  # Checks it worked
configure_keys(args)  # Sets up authentication
generate_postman(args)  # Creates test collection
```

Each function is focused, testable, and reusable.

---

<!-- SLIDE: chapter6_performance -->
```yaml
slide_id: chapter6_performance
slide_title: "Performance Testing Adventures"
image_prompt: "Comic showing: Panel 1: Engineer with laptop running k6 locally, coffee cup nearby, graphs on screen showing performance metrics. Panel 2: Same tests running in K8s cluster with multiple pods shooting load at Tyk gateway (shown as a fortress). Panel 3: Special case - WebSocket testing with cartoon ws:// protocol character being rejected by HTTPS bouncer, then wss:// character being let through. Panel 4: Performance results dashboard with green checkmarks. Style: technical comic with some humor, showing local to cloud progression."
short_summary: |
  Built performance testing with k6 (chose over JMeter). Structure: local development first, K8s cluster deployment later. Handles Tyk auth, Vault integration, parameterizable (VUs, duration). Special challenges: WebSocket testing (auth only at handshake, browsers can't set headers, need wss:// for HTTPS). Also tested SSE, gRPC, HTTP/2. Results in JSON, visualized with xk6-dashboard.
```

## Chapter 6: Performance Testing Adventures

### The Challenge

We needed performance testing for Tyk gateway. Requirements:
- Test locally during development
- Run on K8s cluster for realistic load
- Handle Tyk authentication (API keys)
- Support Vault integration
- Parameterizable (VUs, ramp-up, duration)
- Generate useful reports

### The Tool: k6

We chose k6 over JMeter because:
- ✅ JavaScript-based (more familiar for team)
- ✅ Better cloud-native integration
- ✅ K8s operator available
- ✅ Native Prometheus/Grafana support
- ✅ Same workflow local-to-cluster
- ✅ Open source (unlike the cloud SaaS version)

### The Structure

```
k6-performance-tests/
├── scripts/
│   ├── tests/          # Individual test scenarios
│   ├── common/         # Shared auth/vault helpers
│   └── config/         # Environment configs
├── k8s/                # K8s manifests for cluster deployment
├── results/            # Test output (JSON/HTML)
└── .env                # Local secrets (gitignored)
```

### The Special Cases: WebSocket Testing

Testing WebSocket through Tyk presented unique challenges:

**The Auth Problem**: WebSocket auth happens only during HTTP handshake, and browsers can't set custom headers on WebSocket requests.

**The Solution**: Query parameters.
```javascript
const ws = new WebSocket(
  'wss://tst1.apigw.pgsm.hu/api/v1/ws?authorization=API_KEY'
);
```

**The Protocol Problem**: HTTPS gateway requires `wss://`, not `ws://`.

**The Test Setup**:
- Deployed `jmalloc/echo-server` for WebSocket echo testing
- Created OAS definition for WebSocket proxy
- Tested complete traffic flow: Client → Ingress → Tyk → Upstream
- Validated TLS termination, HA Proxy, timeouts, and SLA enforcement

### Performance Testing Pipeline

**Local Development**:
```bash
# Load environment
export $(cat .env | xargs)

# Run test
k6 run scripts/tests/api-test.js

# With custom params
TARGET_VUS=50 k6 run scripts/tests/api-test.js

# Save results
k6 run --out json=results/test-$(date +%Y%m%d).json scripts/tests/api-test.js

# Visualize
docker run --rm -p 5665:5665 \
  -v $(pwd)/results:/results \
  ghcr.io/szkiba/xk6-dashboard:latest \
  dashboard replay /results/test-result.json
```

**Cluster Deployment**:
- K8s Job with k6 image
- ConfigMap for test scripts
- Secrets for credentials
- Multiple replicas for distributed load
- Results collected to persistent volume

### Other PoCs

**Server-Sent Events (SSE)**:
- Tested timeout handling for long-lived connections
- Validated that Tyk correctly proxies SSE streams
- Configured appropriate timeouts at each layer

**gRPC Support**:
- The problem wasn't Tyk (it proxies fine)
- The problem was our ingress controllers
- Nginx ingress needed special configuration

**HTTP/2 Support**:
- Validated end-to-end HTTP/2 support
- Tested with both cleartext and TLS

---

<!-- SLIDE: chapter7_operator -->
```yaml
slide_id: chapter7_operator
slide_title: "The Operator Wars"
image_prompt: "Comic battle scene: LEFT side shows Tyk Operator as a robot with Kubernetes logo, holding a CR (Custom Resource) document. RIGHT side shows various bug monsters attacking: 'Race Condition' monster, 'Missing Status' ghost, 'Name Collision' demon. CENTER: Engineer in armor defending with a shield labeled 'Workarounds' and sword labeled 'Debugging'. Background shows logs scrolling rapidly and a battle plan diagram on wall. Style: epic battle comic, humorous take on technical problems."
short_summary: |
  Tyk Operator watches CRDs, syncs to Tyk Dashboard, maintains desired state... and has bugs. Battle #1: Missing status fields due to parallel reconciliation conflicts. Battle #2: Naming collisions. Battle #3: Operator doesn't support Keys. Battle #4: Operator gets stuck. Solutions: verification steps, wait-and-fix scripts, reduce concurrency, custom key management tool, patience, and regular bug reports to Tyk.
```

## Chapter 7: The Operator Wars

### The Enemy

Tyk Operator is a Kubernetes operator that:
- Watches Tyk CRDs (Custom Resource Definitions)
- Syncs them to Tyk Dashboard/Gateway
- Maintains desired state
- Has bugs. So many bugs.

### Battle #1: The Missing Status Fields

**Problem**: Deploy 1 OAS + 6 SecurityPolicies via Helm. All show up in Tyk Dashboard, but 2 SecurityPolicies' CRs lack `status.pol_id` field.

**Investigation**:
```
18:48:58 - All policies try to reconcile (API doesn't exist)
18:48:58 - OAS successfully created
18:48:58 - 5 policies successfully create
18:48:58 - 1 policy creates but fails updating linked APIs
           "optimistic lock error: object has been modified"
```

**Root Cause**: Multiple SecurityPolicy reconciliations happening in parallel, all trying to update the same OAS resource's `linkedPolicies` list.

**Why It's a Problem**: Without `status.pol_id`, we can't:
- Verify deployment succeeded
- Update the policy later
- Delete it cleanly
- Know if it actually exists in Tyk

**The Workaround**:
```bash
# Wait for initial reconciliation
sleep 30

# Find broken policies
kubectl get securitypolicies -n tyk-gateway-yg -o json | \
  jq -r '.items[] | select(.status.pol_id == null)'

# Delete policy from Tyk Dashboard
curl -X DELETE "$DASHBOARD_URL/api/portal/policies/$pol_id"

# Operator recreates it (without parallel conflicts)
# Verify it now has pol_id
```

### Battle #2: The Naming Collision

**Problem**: Policy named `api-get-v2-customer` fails with "This policy name has already been used."

**Plot Twist**: Policy `api-get-v2-customer-id` already exists.

**The Cause**: Tyk Dashboard might be treating similar names as duplicates in some scenarios.

**The Solution**: Use more distinctive naming patterns.

### Battle #3: The Operator Doesn't Support Keys

**Problem**: Tyk Operator manages APIs and Policies but NOT Keys.

**Impact**: 
- Can't use pure GitOps for complete API deployment
- Need separate key management pipeline
- Key-to-Policy mapping requires custom tooling
- Race conditions in key updates (see Chapter 4)

**The Workaround**: Custom Python tool that:
- Runs after Helm deployment
- Registers/updates keys via Dashboard API
- Connects keys to policies
- Verifies everything worked
- Stores keys in Vault

### Battle #4: The Operator Gets Stuck

Sometimes the operator just... stops. Reconciliation hangs for minutes. The deployment seems fine in Tyk, but the CR status never updates.

**Symptoms**:
- Long reconciliation times (60+ seconds)
- No error messages
- CR stays in "processing" state
- Tyk Dashboard shows resource exists

**Workaround**: Reduce operator concurrency:
```yaml
env:
  - name: MAX_CONCURRENT_RECONCILES
    value: "1"
```

This forces sequential reconciliation. Slower, but more reliable.

### The Battle Plan

**Short-term**:
1. Add verification step after Helm deployment
2. Wait 30 seconds for reconciliation to settle
3. Check all CRs have required status fields
4. Fix broken ones automatically

**Long-term**:
1. Report bugs to Tyk (we became the contact person)
2. Consider contributing fixes upstream
3. Maybe separate OAS and SecurityPolicy into different Helm charts
4. Implement proper retry logic
5. Hope operator gets better in future versions

---

<!-- SLIDE: chapter8_samu -->
```yaml
slide_id: chapter8_samu
slide_title: "The SAMU Odyssey"
image_prompt: "Comic showing: Panel 1: Beautiful pristine database labeled 'SAMU - Single Source of Truth' glowing with heavenly light. Panel 2: Closer look reveals data quality issues - one application has 3 different names, another doesn't exist, one is from 2019. Panel 3: Engineer trying to query SAMU API, API returning timeout errors and 404s. Panel 4: Two people cleaning data with brooms labeled 'Data Quality', still working months later. Panel 5: Engineer creating API wrapper that fixes everything. Style: epic quest comic with humor about data quality challenges."
short_summary: |
  SAMU: enterprise architecture inventory database, supposedly single source of truth. Reality: data quality issues (apps with multiple names, missing entries, outdated info), API not designed for our use case, managed by different department, changes require meetings. Solution: teammate built API wrapper for normalization and caching, 2 people spent months cleaning data, pipeline validates but proceeds anyway (what choice do we have?). Lesson: architecture tools are only as good as their data.
```

## Chapter 8: The SAMU Odyssey

### What is SAMU?

SAMU is an "enterprise-level architecture and inventory application" - basically a database of:
- Applications
- Application Components
- Teams
- Integrations
- Infrastructure
- Other architecture elements

It's *supposed* to be the single source of truth for the company's IT architecture.

### The Reality

**Problem #1: Data Quality**

Sometimes we integrate with:
- An "Application" in SAMU
- An "Application Component" in SAMU
- Something that doesn't exist in SAMU
- Something with a completely different name than in SAMU

**Problem #2: Staleness**

SAMU is updated... eventually. Maybe. If someone remembers.

**Problem #3: The API**

SAMU has APIs, but they're not exactly designed for our use case. We needed:
- Provider application lookup
- Consumer application lookup
- Consumer team information
- Real-time data

What we got:
- APIs that work most of the time
- Data that's sometimes current
- Endpoints that occasionally time out
- Schema that changes without notice

**Problem #4: Ownership**

SAMU is managed by a completely different department that's responsible for much more than IT architecture. Changes require:
- Meetings
- More meetings
- Approvals
- Waiting
- Hope

### The Solution

**Phase 1**: Another team member created an API wrapper in front of SAMU that:
- Normalized data formats
- Cached responses
- Handled errors gracefully
- Provided a consistent interface

**Phase 2**: Manual data cleaning
- 2 people spent 2-3 months cleaning SAMU data
- Still ongoing
- Critical for Apigee migration
- Required for proper inventory

**Phase 3**: Validation in pipeline
- Validate provider exists in SAMU
- Validate consumer exists in SAMU
- Warn if data looks suspicious
- Proceed anyway (because what choice do we have?)

### The Lesson

Enterprise architecture tools are great in theory. In practice, they're as good as the data inside them, and keeping that data current is hard.

---

<!-- SLIDE: chapter9_contracts -->
```yaml
slide_id: chapter9_contracts
slide_title: "The Contract Repository Pattern"
image_prompt: "Comic showing contract repository workflow: Panel 1: Consumer app and Provider app shaking hands over contract document. Panel 2: Git repository structure tree showing integration.yaml, mocks/, and docs/. Panel 3: Contract flowing through pipeline stages being transformed. Panel 4: Challenges panel showing multiple sources merging (contract repo, provider repo, env overrides) with arrows tangling. Panel 5: When it works - happy consumer and provider with green checkmarks. Style: business process comic with technical details."
short_summary: |
  SDLC defined 'contract repository' structure: consumer+provider create repo with mock examples, security contract, integration metadata, version history tied to OpenAPI. Pipeline: collects integration.yaml, merges with env overrides, validates against OpenAPI, generates policies, creates keys, links them. Challenges: multiple config sources, version drift, multi-environment complexity. Benefits when working: clear contract, auditable changes, version control, self-documenting, easy rollback.
```

## Chapter 9: The Contract Repository Pattern

### The Concept

Yettel's SDLC defined a "contract repository" structure:
- Consumer app wants to integrate with Provider app
- They create a repository together
- Repository contains:
  - Mock request/response examples
  - Security contract (who can access what)
  - Integration metadata
  - Version history tied to OpenAPI versions

### The Structure

```
contract-repo/
├── integration.yaml           # Security contract
│   ├── consumer: consumer-app-id
│   ├── provider: provider-app-id
│   ├── policies:
│   │   └── policy-1:
│   │       ├── endpoints: [/api/v1/users]
│   │       ├── methods: [GET, POST]
│   │       ├── rate_limit: 1000/60s
│   └── environments:
│       ├── uat8: {...}
│       └── tst2: {...}
├── mocks/                     # Request/response examples
└── docs/                      # Integration documentation
```

### The Pipeline Integration

Our deployment pipeline:
1. Collects `integration.yaml` from contract repos
2. Merges with environment-specific overrides
3. Validates against provider's OpenAPI spec
4. Generates Tyk policies
5. Creates consumer keys
6. Links keys to policies

### The Challenges

**Problem #1: Multiple Sources**

Integration configs can come from:
- Contract repository
- Provider repository
- Environment-specific overrides
- Default templates

Merge order matters. Precedence rules are complex.

**Problem #2: Versioning**

Contract repo version should match OpenAPI version. In practice:
- They drift
- Someone forgets to tag
- Consumer wants new version, provider isn't ready
- Git branches get complicated

**Problem #3: Multi-Environment**

Same contract, different configs per environment:
```yaml
# uat8 might have:
rate_limit: 100/min

# prod might have:
rate_limit: 10000/min
```

Keeping these in sync and validated is... fun.

### The Benefits

When it works:
- ✅ Clear consumer-provider contract
- ✅ Auditable permission changes
- ✅ Version control for security settings
- ✅ Self-documenting integrations
- ✅ Easy rollback

It's the right pattern. Implementation is just hard.

---

<!-- SLIDE: chapter10_environments -->
```yaml
slide_id: chapter10_environments
slide_title: "Environment Abstraction Complexity"
image_prompt: "Comic showing: TOP: Many environment boxes labeled 'UAT8', 'UAT15', 'TST1', 'TST2', 'DEV', 'PROD' scattered chaotically. MIDDLE: Engineer building abstraction layer - organizing environments into three groups 'PROD', 'PREPROD', 'NONPROD' with arrows mapping many-to-few. BOTTOM: Complexity revealed - each group has different domains, K8s clusters, firewall rules, certificates. Engineer's thought bubble shows tangled mess of values.yaml overrides. Style: organizational chart comic with humor about complexity."
short_summary: |
  Many environments (uat8, uat15, tst1, tst2, dev, prod) mapped to three groups for licensing: PROD=prod, PREPROD=all UATs+TSTs, NONPROD=dev. Complications: each group has different domain patterns, K8s clusters, firewall rules, CAs. Values.yaml complexity with environment-specific overrides and merge order. Pipeline handles merging, debugging which value won is 'educational'.
```

## Chapter 10: Environment Abstraction

### The Problem

We have many named environments:
- uat8, uat15, tst1, tst2, dev, prod, etc.

For licensing reasons, we needed to group them:
- **PROD** = prod
- **PREPROD** = uat8, uat15, tst1, tst2
- **NONPROD** = dev (and future dev environments)

But Tyk installations are:
- One shared PREPROD Tyk instance (licensing)
- One PROD Tyk instance
- One DEV Tyk instance (created recently)

### The Solution

Environment abstraction layer:
```python
ENVIRONMENT_MAPPING = {
    'prod': 'PROD',
    'uat8': 'PREPROD',
    'uat15': 'PREPROD',
    'tst1': 'PREPROD',
    'tst2': 'PREPROD',
    'dev': 'NONPROD',
}

def get_tyk_instance(env_name):
    return ENVIRONMENT_MAPPING[env_name]

def get_dashboard_url(env_name):
    tyk_env = get_tyk_instance(env_name)
    return DASHBOARD_URLS[tyk_env]
```

### The Complications

**Domain Resolution**:
```python
# Production
'prod' → 'apps.okd.pgsm.hu'

# UAT
'uat8' → 'apps.okduat.pgsm.hu'

# Test
'tst1' → 'tst1.apigw.pgsm.hu'
```

Each environment group has:
- Different domain patterns
- Different Kubernetes clusters
- Different firewall rules
- Different certificate authorities

**Values.yaml Complexity**:
```yaml
# Base values.yaml
upstream:
  url: "https://backend-service.com"

# values.uat8.yaml
upstream:
  url: "https://backend-service.uat8.internal"

# values.tst1.yaml
upstream:
  url: "https://backend-service.tst1.internal"
```

Our pipeline merges these correctly, but debugging which value won is... educational.

---

<!-- SLIDE: chapter11_helm -->
```yaml
slide_id: chapter11_helm
slide_title: "The Helm Template Evolution"
image_prompt: "Evolution comic showing four stages: Stage 1 'Simple & Broken' - tiny basic template with red X. Stage 2 'The Monster' - gigantic 1500-line template scrolling off page, developer buried underneath. Stage 3 'Helper Functions' - organized boxes of reusable helpers with clean connections. Stage 4 'Current State' - modular architecture with separate files (oas.yaml, policies.yaml, firewall.yaml) connected cleanly with green checkmarks. Developer evolved from panicked to confident. Style: evolution/progression comic with before/after humor."
short_summary: |
  Version 1: Too simple, no features. Version 2: 1500-line monster, impossible to maintain. Version 3: Helper templates with reusable logic, testable components. Version 4 (current): Modular structure with separate files, each validates its config, handles Vault references, supports optional parameters. Key features: upstream authentication, multi-environment support, conditional features. Lesson: abstraction and modularity matter.
```

## Chapter 11: The Helm Template Evolution

### Version 1: Simple and Broken

```yaml
# First attempt - too simple
apiVersion: tyk.tyk.io/v1alpha1
kind: TykOasApiDefinition
metadata:
  name: {{ .Values.name }}
spec:
  tykOAS:
    # Paste entire OAS here
```

**Problems**:
- No reusability
- No parameterization
- No Vault support
- No upstream auth
- No error handling

### Version 2: The Monster Template

Everything in one file. 1500 lines of Helm template madness. Every feature, every edge case, every "what if" scenario.

**Problems**:
- Impossible to read
- Impossible to debug
- Impossible to test
- Impossible to maintain
- Did I mention impossible?

### Version 3: Helper Templates

```yaml
# _helpers.tpl
{{- define "tyk.resolveVaultSecret" -}}
  {{- if hasPrefix "$vault_secret." . -}}
    {{- . -}}
  {{- else -}}
    {{- . -}}
  {{- end -}}
{{- end -}}

{{- define "tyk.buildUpstreamAuth" -}}
  {{- if eq .auth.type "basicAuth" -}}
    {{- include "tyk.buildBasicAuth" . -}}
  {{- else if eq .auth.type "oauth" -}}
    {{- include "tyk.buildOAuth" . -}}
  {{- end -}}
{{- end -}}
```

**Benefits**:
- Reusable logic
- Testable components
- Clear separation of concerns
- Maintainable

### Version 4: The Current State

Modular structure with:
- `_helpers.tpl` - Shared functions
- `oas.yaml` - API definition template
- `policies.yaml` - Security policy templates
- `firewall.yaml` - Firewall configuration templates

Each template:
- Has clear inputs and outputs
- Validates its own configuration
- Provides useful error messages
- Supports optional parameters
- Handles Vault references

### Key Features

**Upstream Authentication**:
```yaml
upstream:
  url: "https://backend.com"
  auth:
    type: "basicAuth"
    basic:
      username: "$vault_secret.kv-v2/upstream/creds#username"
      password: "$vault_secret.kv-v2/upstream/creds#password"
```

**Multi-Environment Support**:
```yaml
# Base config
listen_path: "/api/v1"

# Environment override
{{- if eq .Values.env "prod" -}}
listen_path: "/api/v1"
{{- else -}}
listen_path: "/{{ .Values.env }}/api/v1"
{{- end -}}
```

**Conditional Features**:
```yaml
{{- if .Values.cors.enabled }}
cors:
  enabled: true
  allowed_origins: {{ .Values.cors.origins | toJson }}
{{- end }}
```

---

<!-- SLIDE: chapter12_infrastructure -->
```yaml
slide_id: chapter12_infrastructure
slide_title: "Infrastructure Battles"
image_prompt: "Comic battlefield showing multiple simultaneous battles: TOP-LEFT: Nginx Ingress controller with 'Deprecated' banner being replaced by '?' question mark. TOP-RIGHT: Docker images with licensing warning signs. BOTTOM-LEFT: Multiple certificate authority castles (Prod CA, UAT CA, Test CA, Dev self-signed) each with different keys. BOTTOM-CENTER: Traffic flow maze showing Client → External Firewall → Ingress → In-Cluster Firewall → Tyk → Another Firewall → HAProxy → Upstream with timeout icons at each layer. Style: chaotic battle map comic showing complexity."
short_summary: |
  Multiple infrastructure battles: 1) Nginx Ingress deprecation announcement (no clear replacement yet). 2) Redis/PostgreSQL image licensing issues requiring alternatives. 3) Different CAs per environment (prod=company CA, uat=different, test=another, dev=self-signed). 4) Traffic through 6+ layers of firewalls/proxies, each with own timeout/limits/logging/failures. Debugging connection timeout = check all layers, adjust one, break something else, repeat.
```

## Chapter 12: Infrastructure Battles

### The Ingress Deprecation

**The Announcement**: "Nginx Ingress will be deprecated next year."

**Our Response**: "Cool, what are we switching to?"

**The Answer**: "We're still deciding."

**Our Situation**: All traffic goes through Nginx Ingress.

**The Plan**: Wait and see, prepare for migration, hope it's not HAProxy.

### The Image Licensing Saga

**The Problem**: Redis and PostgreSQL images we were using had licensing issues.

**The Solution**: 
- Find alternative images
- Test compatibility
- Update all Helm charts
- Deploy to all environments
- Hope nothing breaks

**The Reality**: Some things broke. We fixed them. Some things broke again. We fixed them again.

**The Lesson**: Open source doesn't mean free from licensing concerns.

### The Certificate Authority Ballet

Different environments, different CAs:
- Production: Official company CA
- UAT: Different CA
- Test: Yet another CA
- Dev: Self-signed (because why not)

Every environment needs:
- Correct CA certificates
- Proper trust chains
- Valid certificate validation
- Timeout handling for slow validation

### The Firewall Layers

Traffic flow through our infrastructure:
```
Client
  → External Firewall
    → Ingress Controller
      → In-Cluster Firewall (Kubernetes NetworkPolicy)
        → Tyk Gateway
          → Another Firewall
            → HA Proxy (sometimes)
              → Upstream Service
```

Each layer:
- Has its own timeout settings
- Has its own connection limits
- Has its own logging format
- Has its own failure modes
- Needs its own configuration

Debugging a connection timeout means:
1. Check all 6+ layers
2. Find which one is actually timing out
3. Adjust that timeout
4. Break something else
5. Repeat

---

<!-- SLIDE: chapter13_multitenancy -->
```yaml
slide_id: chapter13_multitenancy
slide_title: "The Multitenancy Subplot: Cetin Challenge"
image_prompt: "Comic showing: Panel 1: Yettel and Cetin (represented as two buildings/companies) connected by parent-child relationship arrow. Panel 2: Both wanting to use same Tyk deployment but needing separation - shown as two halves of K8s cluster divided by wall. Panel 3: Separation requirements list with checkmarks: separate GitLab, separate Vault/OpenBAO, separate namespaces, separate security. Panel 4: Engineer building complex multi-tenant architecture with both sides satisfied. Panel 5: Migration plan arrow showing Vault → OpenBAO. Style: architectural planning comic with enterprise complexity."
short_summary: |
  Cetin (Yettel's child company) wants to use our Tyk deployment. Requirements: separate security boundaries, separate configs, separate GitLab, separate Vault, BUT same K8s cluster (licensing). Solution in progress: namespace isolation, separate Tyk instances per tenant, Vault → OpenBAO migration (each tenant gets own secret storage), maintaining backward compatibility while supporting both tenants. Spring 2026 deadline.
```

## Chapter 13: The Multitenancy Subplot

### The Cetin Challenge

Cetin is Yettel's "child company" - separate but owned by Yettel, responsible for physical infrastructure.

**The Request**: "We want to use your Tyk deployment."

**The Catch**: 
- Separate security boundaries
- Separate OAS/firewall configs
- Separate GitLab instance
- Separate Vault instance
- But same Kubernetes cluster (licensing reasons)

### The Requirements

**Multi-tenancy needs**:
- Security isolation between Yettel and Cetin APIs
- Separate access control and authentication
- Isolated firewall rules
- Separate secret management
- Shared infrastructure (cost sharing)

**Operational requirements**:
- Cetin deploys from their own GitLab
- Cetin manages their own secrets in their Vault (or OpenBAO)
- Both teams can operate independently
- No cross-contamination of configurations

### The Solution (In Progress)

**Namespace Isolation**:
```yaml
# Yettel namespace
namespace: tyk-gateway-yettel

# Cetin namespace
namespace: tyk-gateway-cetin
```

**Separate Tyk Instances**:
- Different Tyk gateway pods
- Different Tyk dashboards
- Different Redis instances
- Different PostgreSQL databases
- Same Kubernetes cluster

**Vault → OpenBAO Migration**:
- Moving from centralized Vault to separate OpenBAO instances
- Each tenant gets their own secret storage
- API-compatible with Vault (mostly)
- More operational overhead (the price of independence)

**The Fun Part**: Making all this work while:
- Maintaining backward compatibility
- Not breaking existing deployments
- Supporting both tenants simultaneously
- Meeting the spring 2026 deadline

---

<!-- SLIDE: chapter14_monitoring -->
```yaml
slide_id: chapter14_monitoring
slide_title: "Monitoring and Observability"
image_prompt: "Comic showing distributed tracing journey: Panel 1: Request coming in with trace ID badge. Panel 2: Following trace through layers - Ingress (checkpoint 1), Tyk Gateway (checkpoint 2), Plugin (checkpoint 3), Upstream (checkpoint 4). Panel 3: Three different Dynatrace deployment modes (Managed, SaaS, Jaeger) each with different authentication. Panel 4: Custom Go plugin generating OTEL trace IDs and logging structured JSON. Panel 5: Beautiful Grafana dashboard showing all traces correlated. Style: technical journey comic showing observability path."
short_summary: |
  Goal: Full distributed tracing client→Tyk→upstream. Challenge: trace ID propagation through all layers. Solution: Custom Go plugin generates OTEL trace IDs, injects into context, logs with operations, correlates with Dynatrace. Config nightmare: support 3 Dynatrace modes (Managed, SaaS, Jaeger) with different auth/endpoints. Logging: structured JSON with trace correlation, environment-specific verbosity. Custom analytics for gaps in Tyk's built-in analytics.
```

## Chapter 14: Monitoring and Observability

### Dynatrace Integration

**The Goal**: Full distributed tracing from client through Tyk to upstream.

**The Challenge**: Making trace IDs propagate through:
- Ingress
- Tyk Gateway
- Tyk Plugins
- Upstream services

**The Solution**: Custom Go plugin that:
- Generates OTEL-compatible trace IDs
- Injects them into request context
- Logs them with every operation
- Correlates with Dynatrace traces

**The Config Nightmare**: Dynatrace has three deployment modes:
- Managed Dynatrace
- SaaS Dynatrace  
- Self-hosted Jaeger

We needed to support all three, with different:
- Export endpoints
- Authentication methods
- Format requirements
- Retry logic

### Logging Strategy

**The Requirements**:
- Structured logging (JSON)
- Trace ID correlation
- Log levels (DEBUG, INFO, WARN, ERROR)
- Environment-specific verbosity
- No PII in logs
- Queryable in monitoring tools

**The Implementation**:
```go
logger.WithFields(log.Fields{
    "trace_id": traceID,
    "span_id": spanID,
    "consumer": keyAlias,
    "api": apiID,
    "error_type": errorType,
}).Warn("Header validation failed")
```

### The Analytics Gap

Tyk provides analytics, but:
- Not detailed enough for our needs
- Doesn't integrate well with Dynatrace
- Doesn't track policy application failures
- Doesn't show key conversion events

**Our Solution**: Custom analytics:
- Log structured events
- Export to Dynatrace
- Custom dashboards in Grafana
- Alerting on anomalies

---

<!-- SLIDE: chapter15_lessons -->
```yaml
slide_id: chapter15_lessons
slide_title: "Lessons Learned: Technical & Architectural"
image_prompt: "Comic showing wisdom gained: Panel 1 'Lazy Evaluation' - sleeping policy waking up at runtime. Panel 2 'Race Conditions' - two pipelines colliding. Panel 3 'Operators' - robot labeled 'operator' with visible gears and occasional spark/bug. Panel 4 'GitOps' - beautiful git workflow with asterisk saying 'some assembly required'. Panel 5 'Abstractions Leak' - clean top layer peeling back to reveal messy complexity underneath. Panel 6: Developer now wise, surrounded by learned lessons floating as scrolls. Style: educational comic with humor and wisdom."
short_summary: |
  Technical insights: 1) Lazy evaluation is sneaky (Tyk applies policies at runtime, caches results). 2) Race conditions are real in distributed systems. 3) Operators have bugs and limitations. 4) GitOps is great but not everything fits. 5) Abstractions leak - know what's underneath. Architectural insights: Modular design matters, validate early/often/clearly, environment abstraction is hard, plugins need infrastructure, documentation not optional. DevOps vs Development: need to know more systems, understand interactions, think operations not just features.
```

## Chapter 15: Lessons Learned

### Technical Insights

**1. Lazy Evaluation is Sneaky**

Tyk's lazy policy evaluation meant that:
- Keys look fine when created
- Problems only appear at runtime
- Cached results hide underlying issues
- Debugging requires understanding the caching layer

**Lesson**: Always verify actual runtime behavior, not just configuration.

**2. Race Conditions Are Real**

Even with "eventual consistency" systems:
- Optimistic locking failures are common
- Concurrent modifications need careful handling
- Operators can have race conditions too
- Wait-and-verify is sometimes the best strategy

**Lesson**: Never assume sequential execution in distributed systems.

**3. Operators Are Not Magic**

Kubernetes operators promise declarative infrastructure, but:
- They have bugs
- They have limitations
- They have opinions about how things should work
- Sometimes you need to work around them

**Lesson**: Operators are tools, not solutions. Understand their behavior.

**4. GitOps Is Great (When It Works)**

GitOps is powerful, but:
- Not everything fits the model (like API keys)
- State drift is inevitable
- Verification and correction are necessary
- Automation doesn't eliminate the need for understanding

**Lesson**: GitOps is a methodology, not a magic wand.

**5. Abstractions Leak**

Every abstraction leaked at some point:
- Helm templates generated invalid YAML
- Tyk Operator couldn't handle concurrent updates
- Vault integration had performance issues
- Network policies blocked expected traffic

**Lesson**: Know what's happening under your abstractions.

### Architectural Insights

**1. Modular Design Matters**

The CLI refactoring from monolithic to modular:
- Made debugging easier
- Enabled better testing
- Allowed independent execution
- Facilitated reuse

**Lesson**: Resist the urge to put everything in one function/file/service.

**2. Validation Early, Often, and Clearly**

Fail-fast validation saved us countless times:
- Invalid OpenAPI? Fail before deployment
- Missing required fields? Fail with clear message
- Incompatible configuration? Fail before Kubernetes

**Lesson**: Clear errors early are better than mysterious failures later.

**3. Environment Abstraction Is Hard**

Mapping many physical environments to fewer logical environments:
- Simplified operations
- Reduced costs
- Introduced complexity in configuration
- Required careful domain/URL resolution

**Lesson**: Abstraction layers need to be well-designed and well-tested.

**4. Plugin Development Needs Infrastructure**

Building Go plugins successfully required:
- Automated testing (unit and integration)
- CI/CD pipeline for plugin builds
- Artifact repository for versioning
- Documentation for usage

**Lesson**: Treat plugins as first-class code, not afterthoughts.

**5. Documentation Is Not Optional**

Good documentation made the difference between:
- Successfully onboarding new team members
- Debugging issues quickly
- Maintaining the system long-term
- Scaling the solution

**Lesson**: Write docs as you go, not after everything works.

### DevOps vs Development

**The Big Difference**: As a DevOps engineer, you need to:
- Know more systems than developers
- Understand interactions between systems
- Debug issues across team boundaries
- Think about operations, not just features
- Balance multiple stakeholders
- Deal with "it works on my machine" all day

**The Similarity**: Good engineering practices still matter:
- Clean code
- Modularity
- Testing
- Documentation
- Version control
- Code review

**The Shift**: Moving from "make this feature work" to "make this system work for everyone, reliably, at scale, forever."

### Personal Growth

**What I Learned**:
- Helm templating (more than I ever wanted)
- Go development (plugins saved us)
- Kubernetes operations (CRDs, operators, networking)
- GitLab CI/CD (advanced patterns)
- Pipeline design (modular, testable, maintainable)
- Vault secrets management
- Tyk architecture (probably more than Tyk developers)
- Debugging distributed systems
- Working with enterprise architecture tools
- Multi-team coordination
- How to read operator logs (crucial skill)

**What I Realized**:
- DevOps is not "development, but in YAML"
- Understanding systems holistically is a superpower
- Automation is only as good as your understanding
- Sometimes the best solution is a bash script and cron
- Race conditions are everywhere in distributed systems
- Documentation is a gift to your future self
- Testing in production is not always wrong (but have good monitoring)

---

<!-- SLIDE: chapter16_current -->
```yaml
slide_id: chapter16_current
slide_title: "Current State and Future Work"
image_prompt: "Comic progress report: TOP-LEFT: Checklist of working features with green checkmarks (pipeline, infrastructure, team sanity). TOP-RIGHT: TODO list with items unchecked (SAMU cleanup, Cetin setup, Vault migration). CENTER: Progress bar showing '50 of 250+ APIs migrated' with 'Spring 2026' deadline flag. BOTTOM-LEFT: Team of 6 people (still!) drinking coffee, looking cautiously optimistic. BOTTOM-RIGHT: Timeline showing short-term (3 months), medium-term (6 months), long-term goals. Style: status report comic with progress indicators and team morale."
short_summary: |
  What's working: Pipeline functional (collects, validates, generates, deploys, verifies), infrastructure deployed (PROD+PREPROD), GitOps for APIs, Vault integration, monitoring, performance testing, custom plugins, team of 6 maintained. TODO: Complete SAMU cleanup, Cetin multitenancy, Vault→OpenBAO migration, fix operator bugs, migrate remaining APIs, performance testing all critical APIs. Progress: 50 of 250+ APIs migrated, Spring 2026 deadline, cautiously optimistic.
```

## Chapter 16: Current State and Future Work

### What's Working

**The Pipeline**:
- ✅ Collects artifacts from multiple sources
- ✅ Validates configurations
- ✅ Generates Helm manifests
- ✅ Deploys via Tyk Operator
- ✅ Configures keys and policies
- ✅ Verifies deployments
- ✅ Generates Postman collections
- ✅ Handles multiple environments

**The Infrastructure**:
- ✅ Tyk gateways in PROD and PREPROD
- ✅ GitOps for API deployments
- ✅ Vault integration for secrets
- ✅ Dynatrace for monitoring
- ✅ Performance testing framework (k6)
- ✅ Custom plugins for extensions

**The Team**:
- ✅ 6 people (still!)
- ✅ Some level of sanity maintained
- ✅ Spring 2026 deadline possibly achievable
- ✅ Coffee consumption within safe limits

### What's Still TODO

**Short-term (next 3 months)**:
- [ ] Complete SAMU data cleaning
- [ ] Finish Cetin multi-tenancy setup
- [ ] Vault → OpenBAO migration
- [ ] Fix remaining Tyk Operator bugs (or workarounds)
- [ ] Deploy remaining Apigee APIs
- [ ] Performance testing for all critical APIs

**Medium-term (6 months)**:
- [ ] Centralized Key Manager service
- [ ] Automated SAMU synchronization
- [ ] Advanced analytics dashboards
- [ ] Disaster recovery procedures
- [ ] Capacity planning automation

**Long-term (beyond)**:
- [ ] Complete Apigee decommissioning
- [ ] Full GitOps for everything
- [ ] Self-service API deployment
- [ ] Advanced traffic management
- [ ] Service mesh integration (maybe, if we survive this)

### The Migration Progress

**APIs Migrated**: ~50 of 250+
**Environments**: PREPROD stable, PROD ramping up
**Apigee Shutdown**: Scheduled for 2026 spring
**Team Confidence**: Cautiously optimistic

---

<!-- SLIDE: conclusion -->
```yaml
slide_id: conclusion
slide_title: "Was It Worth It?"
image_prompt: "Comic showing transformation: LEFT side 'Before' - developer with Java code and Spring Boot books, comfortable at desk. RIGHT side 'After' - same person as orchestra conductor with baton, managing multiple sections (K8s, Tyk, Vault, GitLab, Monitoring) playing together. Musical notes flowing as code deployments. Audience (business stakeholders) applauding. Bottom banner: 'From Playing Instrument to Conducting Orchestra'. Style: before/after transformation comic with musical metaphor."
short_summary: |
  6 months journey: countless late nights, ~5000 lines Python, ~2000 lines Helm, ~3000 lines Go, extensive testing, documentation. Knowledge gained: API gateway architecture, K8s operators, Go plugins, GitLab CI/CD mastery, distributed systems, enterprise integration. Moving from backend to DevOps = switching from playing instrument to conducting orchestra. Would do it again? Probably. Recommend to others? Only if they enjoy constant learning, debugging distributed systems, automation, making things reliable at scale.
```

## Conclusion: Was It Worth It?

### The Stats

**Time Investment**:
- 6 months (and counting)
- Countless late nights
- More Git commits than I can count
- Probably a few grey hairs

**Knowledge Gained**:
- API Gateway architecture
- Kubernetes operators (and their quirks)
- Go plugin development
- GitLab CI/CD mastery
- Distributed systems debugging
- Enterprise architecture integration
- The pain of race conditions
- Why documentation matters

**Code Produced**:
- Python CLI tool (~5000 lines)
- Helm templates (~2000 lines)
- Go plugins (~3000 lines)
- GitLab CI configs (too many to count)
- Test suites (still growing)
- Documentation (finally catching up)

### The Verdict

Moving from backend development to DevOps was like switching from playing an instrument to conducting an orchestra. You need to:
- Know how each instrument works
- Understand how they work together
- Keep everyone in sync
- Deal with musicians (teams) with strong opinions
- Make it all sound good to the audience (business)

Would I do it again? Probably.

Would I recommend it to others? Only if they enjoy:
- Learning constantly
- Debugging distributed systems
- Working with multiple teams
- Automating all the things
- Making things reliable at scale

Was it worth it? Ask me after the Apigee decommissioning party in spring 2026.

---

<!-- SLIDE: epilogue -->
```yaml
slide_id: epilogue
slide_title: "Advice for Future DevOps Engineers"
image_prompt: "Comic showing wise mentor (evolved from earlier panels) sitting with young developer, passing on wisdom scrolls. Scrolls floating around showing key lessons: 'Learn Infrastructure', 'Read Operator Logs', 'Document Everything', 'Automate Verification', 'Test in Dev', 'Network Is The Problem'. Background shows journey highlights as small vignettes. Bottom: Coffee cups and terminal windows. Style: mentorship comic with wisdom transmission theme, slightly humorous elder teaching younger generation."
short_summary: |
  15 key pieces of advice: 1) Learn infrastructure first, 2) Embrace terminal, 3) Read operator logs, 4) Test in all environments, 5) Document as you go, 6) Understand distributed systems, 7) Learn real programming language, 8) Master Git, 9) Network is always/never the problem, 10) Automate verification, 11) Keep learning, 12) Build relationships, 13) Celebrate small wins, 14) Maintain sanity, 15) Every incident is a learning opportunity. Remember: In DevOps, it's never really the end.
```

## Epilogue: Advice for Future DevOps Engineers

If you're considering a similar journey, here's what I wish someone had told me:

1. **Learn the Infrastructure First**: You can't automate what you don't understand.

2. **Embrace the Terminal**: GUI is for mortals, kubectl is for DevOps engineers.

3. **Read the Operator Logs**: They're like tea leaves, but for debugging.

4. **Test in Dev**: Then test in test. Then test in UAT. Then test in prod with monitoring.

5. **Document As You Go**: Future you will thank present you.

6. **Understand Distributed Systems**: Race conditions are not just a theory.

7. **Learn a Real Programming Language**: YAML is not enough.

8. **Master Git**: Branching strategies matter when 6 people deploy to prod.

9. **Network is Never the Problem**: Until it is. Then it's always the problem.

10. **Automate Verification**: Trust, but verify. Automatically.

11. **Keep Learning**: Tech changes faster than documentation updates.

12. **Build Relationships**: That team that owns the ingress? Be friends with them.

13. **Celebrate Small Wins**: That deployment worked on first try? That's a win.

14. **Maintain Your Sanity**: It's a marathon, not a sprint. Take breaks.

15. **Remember**: Every "production incident" is a "learning opportunity." At least that's what we tell management.

---

*This document chronicles the journey from "Java developer who knows Spring Boot" to "DevOps engineer who debugs Kubernetes operators at 2 AM." The transformation is ongoing, the challenges are real, and the coffee is strong.*

*Last Updated: November 2024*  
*Status: Still Surviving*  
*Next Major Milestone: Complete Cetin separation (Q1 2025)*  
*Ultimate Goal: Apigee decommissioning (Spring 2026)*

**THE END**

*(But not really, because in DevOps, it's never really the end)*