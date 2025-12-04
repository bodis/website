# From Java to YAML: A Backend Engineer's DevOps Journey at Yettel
## Narrative Presentation Script

---

**Slide: From Java to YAML**

This isn't just a technical report; it's a transformation story. Imagine a developer—me—sitting comfortably at a desk. On my left monitor, the world makes sense: clean Java code, structured Spring Boot annotations, predictable logic. On my right monitor? Pure chaos. An endless scroll of YAML, Kubernetes manifests, and Helm charts. 

This is the story of my last six months at Yettel Hungary. It’s a mission that involved migrating 250+ APIs, building a GitOps pipeline from scratch, and discovering that "race conditions" are much scarier when they happen in infrastructure than in code.

---

**Slide: Welcome to DevOps, Here's Your Kubernetes**

I walked into the office in early 2024 ready to join the "Integration Team." I expected a bustling room of experts. Instead, I found a ghost town. The "6-person team" consisted of three brand-new hires (myself included) and a few empty chairs where people used to sit. 

The mandate was terrifyingly simple: "Move everything from Apigee to Tyk. Don't break anything." 

I quickly learned the first rule of this new world: **The Architecture is the Enemy.** We had multiple environments sharing infrastructure, strict firewalls that prohibited applications from talking to each other directly, and an inventory system that was only "theoretically" accurate. My first realization? As a backend dev, I only needed to know my app. As a DevOps engineer, I suddenly had to know *everyone's* app.

---

**Slide: The Tyk Migration Vision**

We started with a dream. We drew it on a whiteboard: a beautiful, clean GitOps pipeline. We’d use Helm charts! We’d use the Tyk Operator! We’d deploy APIs on demand with a single commit! It looked perfect.

Then, Reality walked in and punched us in the face. 

We discovered that our legacy Apigee setup wasn't just a proxy; it was an Enterprise Service Bus in disguise, held together by ancient JavaScript and XML. And Tyk? The sales demo was slick, but the actual product had... "opinions." It didn't support things we desperately needed, like multiple upstream hosts per endpoint or decent Vault integration. Our beautiful whiteboard diagram began to look a lot like a plate of spaghetti.

---

**Slide: The Two-Month 'PoC'**

Fast forward two months. We had built... something. If a Ferrari is a production-ready system, we had built a skateboard made of duct tape.

Technically, it moved. We had Helm deployment working, and we could proxy basic traffic. But it was fragile. We had zero performance data, no way to handle complex zone-to-zone traffic, and absolutely no idea how we were going to manage API keys without losing our minds. We had a "Proof of Concept," but the concept proved we were in trouble.

---

**Slide: The Plugin Era: When YAML Isn't Enough**

This was the turning point. We realized that declarative configuration (YAML) had hit its limit. We couldn't "configure" our way out of these problems; we had to "engineer" our way out. 

I traded my YAML fatigue for a Go compiler. We started writing custom plugins.
First, we built a **Dynamic Router** because Tyk couldn't natively decide which backend to call based on a header. 
Then, we built a **Header Validator** because the standard middleware couldn't handle underscores in API keys or dynamic Vault paths.

We built an entire development pipeline just for these plugins. It was my "superhero" moment—taking the limitations of the tool and coding our own bridge over them.

---

**Slide: The Race Condition Saga**

Just as we felt confident, the system started haunting us. API keys would randomly change their permissions. One minute a key was policy-based; the next, it was hardcoded with specific rights. It felt like a ghost was in the machine.

I put on my detective hat and dove into the Tyk source code. The culprit? **Lazy Evaluation.** Tyk doesn't apply policies until the first request hits. But worse, we found a race condition. If two pipelines ran at the same time, they would overwrite each other's changes, confusing the system into converting the keys.

The fix required strict discipline: we implemented locking mechanisms and rigorous payload validation. We had to teach the pipeline to say, "No, I won't touch this key until I'm sure it's safe."

---

**Slide: Architecture Evolution: The CLI Refactoring**

Our initial deployment tool was a single Python script—a monolithic 800-line beast called `deploy_api()`. It tried to do everything: download, validate, generate, deploy, and pray. Debugging it was a nightmare.

So, we performed surgery. We refactored the monolith into a modular, multi-stage pipeline. Now, we had distinct stages: Collection, Validation, Generation, Deployment, and Verification. It was like moving from a chaotic kitchen where one chef does everything, to an assembly line where every station has a specific job. If the "Verification" stage failed, we didn't have to restart the whole line.

---

**Slide: Performance Testing Adventures**

We needed to know if our gateway would melt under pressure. We chose `k6` for testing because it felt like writing code, not clicking buttons (looking at you, JMeter).

The biggest headache was testing WebSockets. Browsers don't let you set custom headers during a WebSocket handshake, which broke our auth model. We had to hack together a solution using query parameters just to get through the door. But in the end, we built a suite that could hammer our gateway locally and inside the cluster, giving us the beautiful green checkmarks we craved.

---

**Slide: The Operator Wars**

Enter our nemesis: The Tyk Operator. It’s a Kubernetes tool designed to keep everything in sync, but it fought us every step of the way.

We faced missing status fields because the operator couldn't handle parallel tasks. We faced naming collisions where the dashboard thought "customer" and "customer-id" were the same thing. And worst of all, the Operator would sometimes just... stop. It would stare at a resource and do nothing.

Our strategy became "Trust, but Verify." We wrote scripts to double-check the Operator's work, and if it got stuck, we learned the subtle art of "turning it off and on again" (or reducing concurrency) until it behaved.

---

**Slide: The SAMU Odyssey**

Every enterprise has a "Source of Truth." Ours is called SAMU. Ideally, it's a pristine database of every application. In reality, it was a mess. Apps had three different names, or didn't exist, or hadn't been updated since 2019.

We couldn't fix the database overnight, so we built a protective layer around it—an API wrapper that normalized the chaos into something our pipeline could understand. While two brave souls spent months manually cleaning the data, our wrapper allowed us to keep building, pretending the world was cleaner than it actually was.

---

**Slide: The Contract Repository Pattern**

To bring order to the chaos of 250+ integrations, we adopted the "Contract Repository" pattern. It’s a digital handshake. The Consumer and Provider agree on a repo that contains the security contract and mock examples.

When it works, it's magical—a self-documenting history of who is allowed to talk to whom. But getting there was hard. We had to merge configs from four different sources, handle version drift, and manage environment-specific overrides. It was complex, but it turned "permission requests" from email chains into Git commits.

---

**Slide: Environment Abstraction Complexity**

We have a dizzying array of environments: UAT8, UAT15, TST1, TST2, DEV, PROD. But for licensing reasons, we had to pretend we only had three: PROD, PREPROD, and NONPROD.

This created a massive translation layer. We had to map physical realities (URLs, clusters, certificates) to logical groupings. Our `values.yaml` files became a complex hierarchy of overrides. Debugging meant figuring out which environment variable "won" the argument.

---

**Slide: The Helm Template Evolution**

Our Helm templates grew up alongside us. Version 1 was too simple to be useful. Version 2 was a 1,500-line monster file that made grown engineers cry.

Finally, we reached Version 4: Modular Enlightenment. We broke the templates into logical files—`oas.yaml`, `policies.yaml`, `firewall.yaml`. We created helper functions to handle the ugly logic. We finally had a template that was flexible enough to handle complex auth and generic enough to be reused.

---

**Slide: Infrastructure Battles**

While we fought with the application, the ground beneath us kept shifting. We were told Nginx Ingress was being deprecated (with no replacement named). We found out our Docker images had licensing issues and had to be swapped.

And then there were the firewalls. A request has to pass through six different layers—external firewalls, ingress, network policies, the gateway, more firewalls, and HAProxy—before it hits the app. Debugging a connection timeout wasn't engineering; it was archaeology. We had to dig through layers of sediment to find out which fossilized rule was blocking us.

---

**Slide: The Multitenancy Subplot**

As if things weren't hard enough, Yettel's child company, Cetin, asked to move in. They wanted to use our platform but needed total isolation—separate GitLab, separate Vault, separate secrets.

It was like trying to share a house with a roommate where you use the same front door (Kubernetes cluster) but are legally forbidden from seeing each other's groceries. We are currently migrating from Vault to OpenBAO to give them their own secret store, building walls inside our cluster to keep everyone happy and secure.

---

**Slide: Monitoring and Observability**

We didn't just want to move traffic; we wanted to *see* it. We needed distributed tracing that could follow a request from the client, through our gateway, all the way to the backend.

We wrote a custom Go plugin to generate OpenTelemetry trace IDs and inject them into every request. But the real headache was configuring this for three different flavors of Dynatrace (Managed, SaaS, and Jaeger). Now, when a request fails, we don't just guess; we pull up a structured log with a trace ID and see exactly where the patient died.

---

**Slide: Lessons Learned**

So, what did this journey teach me?
1.  **Lazy Evaluation is Sneaky:** Caching hides bugs. Always verify runtime behavior.
2.  **Operators aren't Magic:** They are just code, and code has bugs.
3.  **GitOps isn't a Magic Wand:** Automation requires constant verification.
4.  **Abstractions Leak:** Eventually, you have to look under the hood.

But the biggest lesson was the shift in mindset. As a developer, I focused on features. As a DevOps engineer, I focus on reliability. I learned that "It works on my machine" is the beginning of the conversation, not the end.

---

**Slide: Current State and Future Work**

Where are we now? The pipeline works. The infrastructure is up. We have successfully migrated 50 of the 250 APIs. The team of six is still standing, and we haven't run out of coffee yet.

We still have a mountain to climb—cleaning up the data, finishing the multi-tenancy setup, and hitting that Spring 2026 deadline. But for the first time, we feel cautiously optimistic.

---

**Slide: Was It Worth It?**

Six months. Thousands of lines of Python, Helm, and Go. Countless late nights. Was it worth it?

Moving from backend to DevOps was like stopping playing the violin to conduct the orchestra. It’s chaotic, it’s loud, and you have to know a little bit about every instrument. But when it works, it’s a symphony. 

Would I do it again? Probably. Would I recommend it? Only if you enjoy constant learning and the adrenaline of debugging a distributed system at 2 AM.

---

**Slide: Advice for Future DevOps Engineers**

If you are stepping onto this path, here is my advice:
Learn the infrastructure first. Embrace the terminal. Read the operator logs—they are the tea leaves of our trade. And remember: The network is never the problem, until it is, and then it is *always* the problem.

This is the end of my presentation, but in DevOps, there is no "End." There is only the next ticket.