export interface Slide {
  id: string;
  title: string;
  narrative: string;
  technicalContent: string;
  imageSrc: string;
  shortSummary: string;
  isStartScreen?: boolean;
}

export const slides: Slide[] = [
  {
    id: 'title',
    title: 'From Java to YAML: A Backend Engineer\'s DevOps Journey',
    narrative: `This isn't just a technical report; it's a transformation story. Imagine a developer—me—sitting comfortably at a desk. On my left monitor, the world makes sense: clean Java code, structured Spring Boot annotations, predictable logic. On my right monitor? Pure chaos. An endless scroll of YAML, Kubernetes manifests, and Helm charts.

This is the story of my last six months at Yettel Hungary. It's a mission that involved migrating 250+ APIs, building a GitOps pipeline from scratch, and discovering that "race conditions" are much scarier when they happen in infrastructure than in code.`,
    technicalContent: `## Executive Summary

This document chronicles a 6-month journey of transforming from a backend engineer (Java stack, strong architecture background) into a DevOps integration engineer at Yettel Hungary. The mission: orchestrate the migration from Apigee to Tyk API Gateway for one of Hungary's largest telecom companies, while building a GitOps-first deployment pipeline that would replace years of clickops infrastructure with proper automation.

**Spoiler alert**: It involved more race conditions, Kubernetes operators with opinions, and Go plugins than initially advertised.`,
    shortSummary: 'A 6-month transformation story: from backend Java developer to DevOps integration engineer at Yettel Hungary. Mission: migrate 250+ APIs from Apigee to Tyk while building a GitOps deployment pipeline.',
    imageSrc: './images/dev2devops_0_title_slide.png',
    isStartScreen: true,
  },
  {
    id: 'chapter1',
    title: 'Welcome to DevOps, Here\'s Your Kubernetes',
    narrative: `I walked into the office in early 2024 ready to join the "Integration Team." I expected a bustling room of experts. Instead, I found a ghost town. The "6-person team" consisted of three brand-new hires (myself included) and a few empty chairs where people used to sit.

The mandate was terrifyingly simple: "Move everything from Apigee to Tyk. Don't break anything."

I quickly learned the first rule of this new world: **The Architecture is the Enemy.** We had multiple environments sharing infrastructure, strict firewalls that prohibited applications from talking to each other directly, and an inventory system that was only "theoretically" accurate. My first realization? As a backend dev, I only needed to know my app. As a DevOps engineer, I suddenly had to know *everyone's* app.`,
    technicalContent: `## Chapter 1: The Setup

In early 2024, I joined Yettel Hungary's 6-person integration team (though "6-person" is generous considering 3 of us were brand new, 1 person had just left for another department, and 2-3 others had vanished in the previous 2 years).

### Architecture Constraints
- Multiple environments (UAT8, UAT15, TST2, etc.) all sharing infrastructure
- Multiple security zones requiring different firewall configurations
- Zero direct app-to-app communication allowed (everything through the gateway "wall")
- Both sync (HTTP/REST/WebSocket/gRPC/SSE) and async (Kafka) gateway solutions
- An enterprise architecture inventory system (SAMU) that was *theoretically* the source of truth

### The First Two Months: Permission Quest 2024

As a DevOps engineer, I needed access to:
- GitLab repositories (dozens of them)
- Kubernetes clusters (multiple environments)
- Tyk Dashboard instances
- Vault for secrets management
- SAMU for architecture inventory
- Swaggerhub for OpenAPI specs
- Various monitoring and logging systems

**Key revelation**: "DevOps is different because you need to know more apps than developers and almost as many as high-level architects."`,
    shortSummary: 'Joined Yettel\'s 6-person integration team (3 brand new) to migrate 250+ APIs from Apigee to Tyk. First task: spend 2 months collecting permissions to access all the systems.',
    imageSrc: './images/dev2devops_slide_01.png',
  },
  {
    id: 'chapter2_vision',
    title: 'The Tyk Migration Vision',
    narrative: `We started with a dream. We drew it on a whiteboard: a beautiful, clean GitOps pipeline. We'd use Helm charts! We'd use the Tyk Operator! We'd deploy APIs on demand with a single commit! It looked perfect.

Then, Reality walked in and punched us in the face.

We discovered that our legacy Apigee setup wasn't just a proxy; it was an Enterprise Service Bus in disguise, held together by ancient JavaScript and XML. And Tyk? The sales demo was slick, but the actual product had... "opinions." It didn't support things we desperately needed, like multiple upstream hosts per endpoint or decent Vault integration. Our beautiful whiteboard diagram began to look a lot like a plate of spaghetti.`,
    technicalContent: `## Chapter 2: The Original Vision

The plan seemed straightforward:
1. Create a pipeline for deploying API proxies on demand
2. Use GitOps methodology (everything in Git)
3. Support triggering from external systems
4. Handle multi-team permissions and SLA requirements
5. Use Helm charts as the default technology
6. Leverage Tyk Operator and custom CRDs

### The Reality Check

**Problem #1: The Apigee Legacy**
- JavaScript-based transformations everywhere
- Reusable "shared flows" (not so reusable in Tyk)
- APIs that merged multiple backends
- APIs that split single backends into multiple endpoints
- Enough XML to make any modern developer weep

**Problem #2: Tyk's Sales Team vs. Reality**
- No native support for multiple upstream hosts per API endpoint
- No global URL rewrite (only endpoint-level)
- Vault integration requiring root tokens (security said "lol, no")
- Performance issues with Vault lookups (no caching)
- The operator having... *opinions* about how things should work

**Problem #3: "It's Not Just a Gateway"**
The integration needed to handle: OpenAPI downloads, reference resolution, Vault integration, 15+ environment configs, in-cluster firewall rules, Dynatrace integration, SAMU integration, and contract repositories.`,
    shortSummary: 'The plan: Create GitOps pipeline using Helm and Tyk Operator. Reality: Apigee was an ESB in disguise with JavaScript everywhere. Tyk\'s sales demos looked great but reality had surprises.',
    imageSrc: './images/dev2devops_slide_02.png',
  },
  {
    id: 'chapter2_poc',
    title: 'The Two-Month "PoC"',
    narrative: `Fast forward two months. We had built... something. If a Ferrari is a production-ready system, we had built a skateboard made of duct tape.

Technically, it moved. We had Helm deployment working, and we could proxy basic traffic. But it was fragile. We had zero performance data, no way to handle complex zone-to-zone traffic, and absolutely no idea how we were going to manage API keys without losing our minds. We had a "Proof of Concept," but the concept proved we were in trouble.`,
    technicalContent: `### The Two-Month "PoC"

After two months, we had something that technically worked. Let me be generous: it was "functional in the way a skateboard is a mode of transportation." It had wheels, it moved, but you wouldn't want to transport anything important on it.

**What we had:**
- ✅ Helm-based deployment
- ✅ Basic API proxy functionality
- ✅ Some policies and keys

**What we didn't have:**
- ❌ Performance testing
- ❌ Zone-to-zone traffic handling
- ❌ Real analytics
- ❌ Any confidence in production readiness
- ❌ A way to handle API keys that didn't make us cry`,
    shortSummary: 'After 2 months: created something that \'technically worked\' - like a skateboard is transportation. Had Helm deployment and basic proxy. Missing: performance testing, analytics, production confidence.',
    imageSrc: './images/dev2devops_slide_02_2.png',
  },
  {
    id: 'chapter3_plugins',
    title: 'The Plugin Era: When YAML Isn\'t Enough',
    narrative: `This was the turning point. We realized that declarative configuration (YAML) had hit its limit. We couldn't "configure" our way out of these problems; we had to "engineer" our way out.

I traded my YAML fatigue for a Go compiler. We started writing custom plugins.
First, we built a **Dynamic Router** because Tyk couldn't natively decide which backend to call based on a header.
Then, we built a **Header Validator** because the standard middleware couldn't handle underscores in API keys or dynamic Vault paths.

We built an entire development pipeline just for these plugins. It was my "superhero" moment—taking the limitations of the tool and coding our own bridge over them.`,
    technicalContent: `## Chapter 3: The Plugin Era

### Why Plugins?
Tyk has extensibility through Go plugins. This is both a blessing and a curse. A blessing because you can extend functionality; a curse because now you're maintaining Go code in a DevOps pipeline.

### Plugin #1: The Dynamic Router
**Problem**: Tyk doesn't support multiple upstream hosts per API endpoint natively.
**Solution**: A Go plugin that evaluates routing rules and dynamically sets the upstream target.

**Key Features**:
- Path matching (prefix and regex)
- Method-based routing
- Header-based routing
- Request path rewriting
- Support for Tyk's context and configuration

**Lesson**: Regex compilation needs to happen once, not per request, unless you enjoy watching your CPU weep.

### Plugin #2: The Header Validator
**Problem**: Standard Tyk header middleware doesn't like underscores in API keys.
**Example**: Template like \`$vault_secret.kv-v2/dir1/dir2/{$HEADER_alma}/secret_key\` where \`{$HEADER_alma}\` gets replaced with the actual header value.

### Plugin Development Pipeline
- Separate Git repository for each API-specific plugin
- Generic plugins in a shared repository
- Automated testing (unit tests, not just "does it compile")
- Deployment to artifact repository (Nexus/ProGet)
- Automatic download during API deployment
- Versioning and rollback support`,
    shortSummary: 'When YAML limitations hit, we went to Go plugins. Built Dynamic Router for multi-upstream routing and Header Validator for underscore support. Complete plugin development pipeline with testing and versioning.',
    imageSrc: './images/dev2devops_slide_03.png',
  },
  {
    id: 'chapter4_race',
    title: 'The Race Condition Saga',
    narrative: `Just as we felt confident, the system started haunting us. API keys would randomly change their permissions. One minute a key was policy-based; the next, it was hardcoded with specific rights. It felt like a ghost was in the machine.

I put on my detective hat and dove into the Tyk source code. The culprit? **Lazy Evaluation.** Tyk doesn't apply policies until the first request hits. But worse, we found a race condition. If two pipelines ran at the same time, they would overwrite each other's changes, confusing the system into converting the keys.

The fix required strict discipline: we implemented locking mechanisms and rigorous payload validation. We had to teach the pipeline to say, "No, I won't touch this key until I'm sure it's safe."`,
    technicalContent: `## Chapter 4: The Race Condition Saga

### The Mystery
Keys started mysteriously converting from policy-based to API-based permissions. Not all keys. Not predictably. Just... sometimes.

**Symptoms**:
- Keys that should have \`apply_policies\` instead had \`access_rights\`
- Policy references vanishing into the ether
- Keys working fine, then suddenly having wrong permissions

### The Investigation

**Discovery #1: Lazy Policy Evaluation**
\`\`\`
Key Created → Just has policy IDs
First Request → Policy applied → Results cached in Redis session
Policy Deleted → Cached session persists with materialized access_rights
Key looks "converted" → Actually just showing cached settings
\`\`\`

**Discovery #2: The Dual-Mode Disaster**
Keys can be policy-based OR API-based, not both. But the API accepts both fields.

**Discovery #3: The Race Condition**
\`\`\`
1. Pipeline A: GET key → Merge new policies → PUT key
2. Pipeline B: GET key → Merge new policies → PUT key (simultaneously)
3. Pipeline A completes
4. Pipeline B overwrites A's changes
5. Chaos ensues
\`\`\`

### The Solution
- **Rule #1**: NEVER include \`access_rights\` when updating policy-based keys
- **Rule #2**: Implement optimistic or pessimistic locking for key updates
- **Rule #3**: Add verification steps in the pipeline
- **Rule #4**: Verify operator finished its work before proceeding`,
    shortSummary: 'Mystery: Keys mysteriously converting from policy-based to API-based permissions. Investigation revealed lazy policy evaluation and race conditions in pipelines. Solution: strict payload validation and locking.',
    imageSrc: './images/dev2devops_slide_04.png',
  },
  {
    id: 'chapter5_refactoring',
    title: 'Architecture Evolution: The CLI Refactoring',
    narrative: `Our initial deployment tool was a single Python script—a monolithic 800-line beast called \`deploy_api()\`. It tried to do everything: download, validate, generate, deploy, and pray. Debugging it was a nightmare.

So, we performed surgery. We refactored the monolith into a modular, multi-stage pipeline. Now, we had distinct stages: Collection, Validation, Generation, Deployment, and Verification. It was like moving from a chaotic kitchen where one chef does everything, to an assembly line where every station has a specific job. If the "Verification" stage failed, we didn't have to restart the whole line.`,
    technicalContent: `## Chapter 5: The CLI Refactoring

### The Problem
Our initial Python-based Tyk Deployer CLI was monolithic:
\`\`\`python
# deploy_api() - 800 lines
# Does EVERYTHING:
# - Downloads from Swaggerhub
# - Validates OpenAPI
# - Connects to SAMU
# - Generates Helm charts
# - Deploys via Helm
# - Configures keys
# - Tests deployment
\`\`\`

### The Refactoring - Multi-stage Architecture:

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
- Store as artifacts

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
- Send notifications`,
    shortSummary: 'Refactored monolithic 800-line deploy_api() into modular multi-stage pipeline: Collection → Validation → Generation → Deployment → Verification → Key Config → Post-Deployment.',
    imageSrc: './images/dev2devops_slide_05.png',
  },
  {
    id: 'chapter6_performance',
    title: 'Performance Testing Adventures',
    narrative: `We needed to know if our gateway would melt under pressure. We chose \`k6\` for testing because it felt like writing code, not clicking buttons (looking at you, JMeter).

The biggest headache was testing WebSockets. Browsers don't let you set custom headers during a WebSocket handshake, which broke our auth model. We had to hack together a solution using query parameters just to get through the door. But in the end, we built a suite that could hammer our gateway locally and inside the cluster, giving us the beautiful green checkmarks we craved.`,
    technicalContent: `## Chapter 6: Performance Testing Adventures

### The Tool: k6
We chose k6 over JMeter because:
- ✅ JavaScript-based (more familiar for team)
- ✅ Better cloud-native integration
- ✅ K8s operator available
- ✅ Native Prometheus/Grafana support
- ✅ Same workflow local-to-cluster
- ✅ Open source

### The Structure
\`\`\`
k6-performance-tests/
├── scripts/
│   ├── tests/          # Individual test scenarios
│   ├── common/         # Shared auth/vault helpers
│   └── config/         # Environment configs
├── k8s/                # K8s manifests for cluster deployment
├── results/            # Test output (JSON/HTML)
└── .env                # Local secrets (gitignored)
\`\`\`

### WebSocket Testing Challenges
**The Auth Problem**: WebSocket auth happens only during HTTP handshake, and browsers can't set custom headers.

**The Solution**: Query parameters.
\`\`\`javascript
const ws = new WebSocket(
  'wss://tst1.apigw.pgsm.hu/api/v1/ws?authorization=API_KEY'
);
\`\`\`

### Other PoCs
- **Server-Sent Events (SSE)**: Tested timeout handling for long-lived connections
- **gRPC Support**: Problem was our ingress controllers, not Tyk
- **HTTP/2 Support**: Validated end-to-end HTTP/2 support`,
    shortSummary: 'Built performance testing with k6. Handles Tyk auth, Vault integration, WebSocket testing (auth only at handshake, need query params). Also tested SSE, gRPC, HTTP/2.',
    imageSrc: './images/dev2devops_slide_06.png',
  },
  {
    id: 'chapter7_operator',
    title: 'The Operator Wars',
    narrative: `Enter our nemesis: The Tyk Operator. It's a Kubernetes tool designed to keep everything in sync, but it fought us every step of the way.

We faced missing status fields because the operator couldn't handle parallel tasks. We faced naming collisions where the dashboard thought "customer" and "customer-id" were the same thing. And worst of all, the Operator would sometimes just... stop. It would stare at a resource and do nothing.

Our strategy became "Trust, but Verify." We wrote scripts to double-check the Operator's work, and if it got stuck, we learned the subtle art of "turning it off and on again" (or reducing concurrency) until it behaved.`,
    technicalContent: `## Chapter 7: The Operator Wars

### The Enemy
Tyk Operator is a Kubernetes operator that:
- Watches Tyk CRDs (Custom Resource Definitions)
- Syncs them to Tyk Dashboard/Gateway
- Maintains desired state
- Has bugs. So many bugs.

### Battle #1: The Missing Status Fields
**Problem**: Deploy 1 OAS + 6 SecurityPolicies via Helm. 2 SecurityPolicies' CRs lack \`status.pol_id\` field.

**Root Cause**: Multiple SecurityPolicy reconciliations happening in parallel, all trying to update the same OAS resource's \`linkedPolicies\` list.

### Battle #2: The Naming Collision
**Problem**: Policy named \`api-get-v2-customer\` fails with "This policy name has already been used."
**Plot Twist**: Policy \`api-get-v2-customer-id\` already exists.

### Battle #3: The Operator Doesn't Support Keys
**Impact**: Can't use pure GitOps for complete API deployment. Need custom Python tool for key management.

### Battle #4: The Operator Gets Stuck
**Workaround**: Reduce operator concurrency:
\`\`\`yaml
env:
  - name: MAX_CONCURRENT_RECONCILES
    value: "1"
\`\`\`

### The Battle Plan
Short-term: Add verification step, wait 30 seconds, check all CRs have required status fields, fix broken ones automatically.
Long-term: Report bugs to Tyk, consider contributing fixes upstream.`,
    shortSummary: 'Tyk Operator: watches CRDs, syncs to Dashboard, maintains state... and has bugs. Battles: missing status fields, naming collisions, no key support, getting stuck. Solution: verify, wait-and-fix, reduce concurrency.',
    imageSrc: './images/dev2devops_slide_07.png',
  },
  {
    id: 'chapter8_samu',
    title: 'The SAMU Odyssey',
    narrative: `Every enterprise has a "Source of Truth." Ours is called SAMU. Ideally, it's a pristine database of every application. In reality, it was a mess. Apps had three different names, or didn't exist, or hadn't been updated since 2019.

We couldn't fix the database overnight, so we built a protective layer around it—an API wrapper that normalized the chaos into something our pipeline could understand. While two brave souls spent months manually cleaning the data, our wrapper allowed us to keep building, pretending the world was cleaner than it actually was.`,
    technicalContent: `## Chapter 8: The SAMU Odyssey

### What is SAMU?
SAMU is an "enterprise-level architecture and inventory application" - basically a database of:
- Applications
- Application Components
- Teams
- Integrations
- Infrastructure
- Other architecture elements

It's *supposed* to be the single source of truth.

### The Reality

**Problem #1: Data Quality**
Sometimes we integrate with:
- An "Application" in SAMU
- An "Application Component" in SAMU
- Something that doesn't exist in SAMU
- Something with a completely different name

**Problem #2: Staleness** - SAMU is updated... eventually. Maybe.

**Problem #3: The API** - APIs that work most of the time, data that's sometimes current, endpoints that occasionally time out, schema that changes without notice.

**Problem #4: Ownership** - SAMU is managed by a different department. Changes require meetings, approvals, waiting, hope.

### The Solution
**Phase 1**: API wrapper that normalizes data, caches responses, handles errors gracefully
**Phase 2**: 2 people spent 2-3 months cleaning SAMU data (still ongoing)
**Phase 3**: Validation in pipeline - warn if data looks suspicious, proceed anyway`,
    shortSummary: 'SAMU: enterprise architecture inventory, supposedly single source of truth. Reality: data quality issues, staleness, API problems. Solution: API wrapper, manual data cleaning, validation with warnings.',
    imageSrc: './images/dev2devops_slide_08.png',
  },
  {
    id: 'chapter9_contracts',
    title: 'The Contract Repository Pattern',
    narrative: `To bring order to the chaos of 250+ integrations, we adopted the "Contract Repository" pattern. It's a digital handshake. The Consumer and Provider agree on a repo that contains the security contract and mock examples.

When it works, it's magical—a self-documenting history of who is allowed to talk to whom. But getting there was hard. We had to merge configs from four different sources, handle version drift, and manage environment-specific overrides. It was complex, but it turned "permission requests" from email chains into Git commits.`,
    technicalContent: `## Chapter 9: The Contract Repository Pattern

### The Concept
Yettel's SDLC defined a "contract repository" structure:
- Consumer app wants to integrate with Provider app
- They create a repository together
- Repository contains mock examples, security contract, integration metadata, version history

### The Structure
\`\`\`
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
\`\`\`

### The Challenges
**Problem #1: Multiple Sources** - Contract repo, Provider repo, Environment overrides, Default templates
**Problem #2: Versioning** - Contract repo version should match OpenAPI version. In practice: they drift.
**Problem #3: Multi-Environment** - Same contract, different configs per environment

### The Benefits
- ✅ Clear consumer-provider contract
- ✅ Auditable permission changes
- ✅ Version control for security settings
- ✅ Self-documenting integrations
- ✅ Easy rollback`,
    shortSummary: 'Contract repository pattern: consumer+provider create repo with mock examples, security contract, integration metadata. Benefits: clear contract, auditable changes, version control. Challenges: multiple sources, version drift.',
    imageSrc: './images/dev2devops_slide_09.png',
  },
  {
    id: 'chapter10_environments',
    title: 'Environment Abstraction Complexity',
    narrative: `We have a dizzying array of environments: UAT8, UAT15, TST1, TST2, DEV, PROD. But for licensing reasons, we had to pretend we only had three: PROD, PREPROD, and NONPROD.

This created a massive translation layer. We had to map physical realities (URLs, clusters, certificates) to logical groupings. Our \`values.yaml\` files became a complex hierarchy of overrides. Debugging meant figuring out which environment variable "won" the argument.`,
    technicalContent: `## Chapter 10: Environment Abstraction

### The Problem
We have many named environments: uat8, uat15, tst1, tst2, dev, prod, etc.

For licensing reasons, we needed to group them:
- **PROD** = prod
- **PREPROD** = uat8, uat15, tst1, tst2
- **NONPROD** = dev

### The Solution
\`\`\`python
ENVIRONMENT_MAPPING = {
    'prod': 'PROD',
    'uat8': 'PREPROD',
    'uat15': 'PREPROD',
    'tst1': 'PREPROD',
    'tst2': 'PREPROD',
    'dev': 'NONPROD',
}
\`\`\`

### The Complications

**Domain Resolution**:
\`\`\`python
'prod' → 'apps.okd.pgsm.hu'
'uat8' → 'apps.okduat.pgsm.hu'
'tst1' → 'tst1.apigw.pgsm.hu'
\`\`\`

Each environment group has:
- Different domain patterns
- Different Kubernetes clusters
- Different firewall rules
- Different certificate authorities

**Values.yaml Complexity**:
Our pipeline merges these correctly, but debugging which value won is... educational.`,
    shortSummary: 'Many environments (uat8, uat15, tst1, tst2, dev, prod) mapped to three groups for licensing. Each group has different domains, K8s clusters, firewall rules, CAs. Values.yaml complexity with merge order debugging.',
    imageSrc: './images/dev2devops_slide_10.png',
  },
  {
    id: 'chapter11_helm',
    title: 'The Helm Template Evolution',
    narrative: `Our Helm templates grew up alongside us. Version 1 was too simple to be useful. Version 2 was a 1,500-line monster file that made grown engineers cry.

Finally, we reached Version 4: Modular Enlightenment. We broke the templates into logical files—\`oas.yaml\`, \`policies.yaml\`, \`firewall.yaml\`. We created helper functions to handle the ugly logic. We finally had a template that was flexible enough to handle complex auth and generic enough to be reused.`,
    technicalContent: `## Chapter 11: The Helm Template Evolution

### Version 1: Simple and Broken
\`\`\`yaml
apiVersion: tyk.tyk.io/v1alpha1
kind: TykOasApiDefinition
metadata:
  name: {{ .Values.name }}
spec:
  tykOAS:
    # Paste entire OAS here
\`\`\`
Problems: No reusability, no parameterization, no Vault support, no error handling

### Version 2: The Monster Template
Everything in one file. 1500 lines of Helm template madness.
Problems: Impossible to read, debug, test, maintain

### Version 3: Helper Templates
\`\`\`yaml
{{- define "tyk.resolveVaultSecret" -}}
  {{- if hasPrefix "$vault_secret." . -}}
    {{- . -}}
  {{- else -}}
    {{- . -}}
  {{- end -}}
{{- end -}}
\`\`\`
Benefits: Reusable logic, Testable components, Clear separation of concerns

### Version 4: The Current State
Modular structure with:
- \`_helpers.tpl\` - Shared functions
- \`oas.yaml\` - API definition template
- \`policies.yaml\` - Security policy templates
- \`firewall.yaml\` - Firewall configuration templates

**Key Features**: Upstream authentication, Multi-environment support, Conditional features, Vault references`,
    shortSummary: 'Version 1: Too simple. Version 2: 1500-line monster. Version 3: Helper templates. Version 4 (current): Modular structure with separate files, each validates its config, handles Vault references.',
    imageSrc: './images/dev2devops_slide_11.png',
  },
  {
    id: 'chapter12_infrastructure',
    title: 'Infrastructure Battles',
    narrative: `While we fought with the application, the ground beneath us kept shifting. We were told Nginx Ingress was being deprecated (with no replacement named). We found out our Docker images had licensing issues and had to be swapped.

And then there were the firewalls. A request has to pass through six different layers—external firewalls, ingress, network policies, the gateway, more firewalls, and HAProxy—before it hits the app. Debugging a connection timeout wasn't engineering; it was archaeology. We had to dig through layers of sediment to find out which fossilized rule was blocking us.`,
    technicalContent: `## Chapter 12: Infrastructure Battles

### The Ingress Deprecation
**The Announcement**: "Nginx Ingress will be deprecated next year."
**Our Response**: "Cool, what are we switching to?"
**The Answer**: "We're still deciding."

### The Image Licensing Saga
**Problem**: Redis and PostgreSQL images had licensing issues.
**Solution**: Find alternative images, test compatibility, update all Helm charts, deploy to all environments, hope nothing breaks.
**Reality**: Some things broke. We fixed them. Some things broke again.

### The Certificate Authority Ballet
Different environments, different CAs:
- Production: Official company CA
- UAT: Different CA
- Test: Yet another CA
- Dev: Self-signed

### The Firewall Layers
Traffic flow through our infrastructure:
\`\`\`
Client
  → External Firewall
    → Ingress Controller
      → In-Cluster Firewall (K8s NetworkPolicy)
        → Tyk Gateway
          → Another Firewall
            → HA Proxy (sometimes)
              → Upstream Service
\`\`\`

Each layer has its own timeout settings, connection limits, logging format, failure modes, and configuration. Debugging a connection timeout means checking all 6+ layers, finding which one is timing out, adjusting that timeout, breaking something else, repeat.`,
    shortSummary: 'Infrastructure battles: Nginx Ingress deprecation (no replacement yet), Docker image licensing issues, different CAs per environment. Traffic through 6+ firewall layers, each with own timeout/limits/failures.',
    imageSrc: './images/dev2devops_slide_12.png',
  },
  {
    id: 'chapter13_multitenancy',
    title: 'The Multitenancy Subplot: Cetin Challenge',
    narrative: `As if things weren't hard enough, Yettel's child company, Cetin, asked to move in. They wanted to use our platform but needed total isolation—separate GitLab, separate Vault, separate secrets.

It was like trying to share a house with a roommate where you use the same front door (Kubernetes cluster) but are legally forbidden from seeing each other's groceries. We are currently migrating from Vault to OpenBAO to give them their own secret store, building walls inside our cluster to keep everyone happy and secure.`,
    technicalContent: `## Chapter 13: The Multitenancy Subplot

### The Cetin Challenge
Cetin is Yettel's "child company" - separate but owned by Yettel, responsible for physical infrastructure.

**The Request**: "We want to use your Tyk deployment."
**The Catch**: Separate security boundaries, separate configs, separate GitLab, separate Vault, but same Kubernetes cluster (licensing reasons)

### The Requirements
**Multi-tenancy needs**:
- Security isolation between Yettel and Cetin APIs
- Separate access control and authentication
- Isolated firewall rules
- Separate secret management
- Shared infrastructure (cost sharing)

### The Solution (In Progress)

**Namespace Isolation**:
\`\`\`yaml
# Yettel namespace
namespace: tyk-gateway-yettel

# Cetin namespace
namespace: tyk-gateway-cetin
\`\`\`

**Separate Tyk Instances**: Different gateway pods, dashboards, Redis instances, PostgreSQL databases. Same Kubernetes cluster.

**Vault → OpenBAO Migration**: Moving from centralized Vault to separate OpenBAO instances. Each tenant gets their own secret storage. API-compatible with Vault (mostly). More operational overhead (the price of independence).

**Spring 2026 deadline** for completing this setup.`,
    shortSummary: 'Cetin (Yettel\'s child company) wants to use our Tyk deployment. Requirements: separate everything (GitLab, Vault, secrets) BUT same K8s cluster (licensing). Solution: namespace isolation, Vault→OpenBAO migration.',
    imageSrc: './images/dev2devops_slide_13.png',
  },
  {
    id: 'chapter14_monitoring',
    title: 'Monitoring and Observability',
    narrative: `We didn't just want to move traffic; we wanted to *see* it. We needed distributed tracing that could follow a request from the client, through our gateway, all the way to the backend.

We wrote a custom Go plugin to generate OpenTelemetry trace IDs and inject them into every request. But the real headache was configuring this for three different flavors of Dynatrace (Managed, SaaS, and Jaeger). Now, when a request fails, we don't just guess; we pull up a structured log with a trace ID and see exactly where the patient died.`,
    technicalContent: `## Chapter 14: Monitoring and Observability

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

Each needs different export endpoints, authentication methods, format requirements, retry logic.

### Logging Strategy
\`\`\`go
logger.WithFields(log.Fields{
    "trace_id": traceID,
    "span_id": spanID,
    "consumer": keyAlias,
    "api": apiID,
    "error_type": errorType,
}).Warn("Header validation failed")
\`\`\`

**Requirements**: Structured logging (JSON), trace ID correlation, log levels, environment-specific verbosity, no PII in logs, queryable in monitoring tools.

### The Analytics Gap
Tyk provides analytics, but not detailed enough for our needs. Custom analytics: Log structured events, export to Dynatrace, custom Grafana dashboards, alerting on anomalies.`,
    shortSummary: 'Full distributed tracing through all layers. Custom Go plugin generates OTEL trace IDs, injects into context, logs with operations. Config nightmare: support 3 Dynatrace modes with different auth/endpoints.',
    imageSrc: './images/dev2devops_slide_14.png',
  },
  {
    id: 'chapter15_lessons',
    title: 'Lessons Learned: Technical & Architectural',
    narrative: `So, what did this journey teach me?
1. **Lazy Evaluation is Sneaky:** Caching hides bugs. Always verify runtime behavior.
2. **Operators aren't Magic:** They are just code, and code has bugs.
3. **GitOps isn't a Magic Wand:** Automation requires constant verification.
4. **Abstractions Leak:** Eventually, you have to look under the hood.

But the biggest lesson was the shift in mindset. As a developer, I focused on features. As a DevOps engineer, I focus on reliability. I learned that "It works on my machine" is the beginning of the conversation, not the end.`,
    technicalContent: `## Chapter 15: Lessons Learned

### Technical Insights

**1. Lazy Evaluation is Sneaky**
Tyk's lazy policy evaluation meant problems only appear at runtime. Cached results hide underlying issues.
**Lesson**: Always verify actual runtime behavior, not just configuration.

**2. Race Conditions Are Real**
Even with "eventual consistency" systems: Optimistic locking failures are common, concurrent modifications need careful handling, operators can have race conditions too.
**Lesson**: Never assume sequential execution in distributed systems.

**3. Operators Are Not Magic**
They have bugs, limitations, and opinions about how things should work.
**Lesson**: Operators are tools, not solutions. Understand their behavior.

**4. GitOps Is Great (When It Works)**
Not everything fits the model (like API keys). State drift is inevitable. Verification and correction are necessary.
**Lesson**: GitOps is a methodology, not a magic wand.

**5. Abstractions Leak**
Every abstraction leaked at some point: Helm templates generated invalid YAML, Tyk Operator couldn't handle concurrent updates, Vault integration had performance issues.
**Lesson**: Know what's happening under your abstractions.

### Architectural Insights
- **Modular Design Matters**: The CLI refactoring made debugging easier, enabled better testing
- **Validation Early, Often, and Clearly**: Fail-fast validation saved us countless times
- **Environment Abstraction Is Hard**: Requires careful design and testing
- **Plugin Development Needs Infrastructure**: Treat plugins as first-class code
- **Documentation Is Not Optional**: Write docs as you go, not after`,
    shortSummary: 'Technical insights: Lazy evaluation sneaky, race conditions real, operators have bugs, GitOps not magic, abstractions leak. Architectural: modular design, validate early, environment abstraction hard, document everything.',
    imageSrc: './images/dev2devops_slide_15.png',
  },
  {
    id: 'chapter16_current',
    title: 'Current State and Future Work',
    narrative: `Where are we now? The pipeline works. The infrastructure is up. We have successfully migrated 50 of the 250 APIs. The team of six is still standing, and we haven't run out of coffee yet.

We still have a mountain to climb—cleaning up the data, finishing the multi-tenancy setup, and hitting that Spring 2026 deadline. But for the first time, we feel cautiously optimistic.`,
    technicalContent: `## Chapter 16: Current State and Future Work

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

**The Team**: 6 people (still!), some level of sanity maintained, Spring 2026 deadline possibly achievable

### What's Still TODO
**Short-term**: Complete SAMU data cleaning, Finish Cetin multi-tenancy setup, Vault → OpenBAO migration, Fix remaining Tyk Operator bugs, Deploy remaining Apigee APIs, Performance testing for all critical APIs

**Medium-term**: Centralized Key Manager service, Automated SAMU synchronization, Advanced analytics dashboards, Disaster recovery procedures

**Long-term**: Complete Apigee decommissioning, Full GitOps for everything, Self-service API deployment

### The Migration Progress
**APIs Migrated**: ~50 of 250+
**Team Confidence**: Cautiously optimistic`,
    shortSummary: 'What\'s working: Pipeline functional, infrastructure deployed (PROD+PREPROD), GitOps, monitoring, custom plugins. Progress: 50 of 250+ APIs migrated. TODO: SAMU cleanup, Cetin setup, remaining migrations. Spring 2026 deadline.',
    imageSrc: './images/dev2devops_slide_16.png',
  },
  {
    id: 'conclusion',
    title: 'Was It Worth It?',
    narrative: `Six months. Thousands of lines of Python, Helm, and Go. Countless late nights. Was it worth it?

Moving from backend to DevOps was like stopping playing the violin to conduct the orchestra. It's chaotic, it's loud, and you have to know a little bit about every instrument. But when it works, it's a symphony.

Would I do it again? Probably. Would I recommend it? Only if you enjoy constant learning and the adrenaline of debugging a distributed system at 2 AM.`,
    technicalContent: `## Conclusion: Was It Worth It?

### The Stats
**Time Investment**: 6 months (and counting), countless late nights, more Git commits than I can count

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
Would I recommend it to others? Only if they enjoy learning constantly, debugging distributed systems, automating all the things, making things reliable at scale.`,
    shortSummary: '6 months journey: ~5000 lines Python, ~2000 lines Helm, ~3000 lines Go. Knowledge: API gateway, K8s operators, Go plugins, GitLab CI/CD, distributed systems. Moving from backend to DevOps = from instrument to orchestra.',
    imageSrc: './images/dev2devops_slide_17_conclusion.png',
  },
  {
    id: 'epilogue',
    title: 'Advice for Future DevOps Engineers',
    narrative: `If you are stepping onto this path, here is my advice:
Learn the infrastructure first. Embrace the terminal. Read the operator logs—they are the tea leaves of our trade. And remember: The network is never the problem, until it is, and then it is *always* the problem.

This is the end of my presentation, but in DevOps, there is no "End." There is only the next ticket.`,
    technicalContent: `## Epilogue: Advice for Future DevOps Engineers

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

15. **Remember**: Every "production incident" is a "learning opportunity."

---

*This document chronicles the journey from "Java developer who knows Spring Boot" to "DevOps engineer who debugs Kubernetes operators at 2 AM."*

**THE END**
*(But not really, because in DevOps, it's never really the end)*`,
    shortSummary: '15 pieces of advice: Learn infrastructure, embrace terminal, read logs, test everywhere, document, understand distributed systems, learn a real language, master Git, network is always the problem, automate verification, keep learning.',
    imageSrc: './images/dev2devops_slide_17_conclusion.png',
  },
];
