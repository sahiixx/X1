#!/usr/bin/env python3
# Build an aitmpl-format agent pack from the Fixfiz agency_personas library.
# For each persona .md: replace its frontmatter with aitmpl-format frontmatter
# (kebab-case name, example-rich trigger description, model, tools) and copy the
# body verbatim. Bodies are never printed — only repackaged.
import os, shutil

SRC = "/mnt/c/Users/sahii/Projects/Fixfiz/backend/agency_personas"
DST = "/mnt/c/Users/sahii/Projects/nowhere-ai/aitmpl-pack/agents/nowhere-agency"

# slug -> aitmpl trigger description (Dubai marketing-agency flavored, 2 examples each)
DESC = {
 "marketing-content-creator": """Use when building multi-platform content campaigns, editorial calendars, brand storytelling, or long-form assets for a marketing agency. Specializes in cross-platform content strategy, SEO-aware copy, video/podcast direction, and repurposing one pillar asset across every platform the audience lives on.

<example>
Context: A Dubai agency client needs a 30-day content calendar across Instagram, LinkedIn, and TikTok for a luxury off-plan real-estate launch
user: "Build me a month of content for a Palm Jumeirah launch across IG, LinkedIn, and TikTok"
assistant: "I'll map the audience per platform and the launch milestones, then produce an editorial calendar with platform-native formats, SEO-targeted blog pillars, and a repurposing tree that turns one pillar asset into IG carousels, LinkedIn thought-leadership posts, and TikTok hooks."
<commentary>
Use marketing-content-creator for end-to-end multi-platform content strategy and production. For single-platform depth use instagram-curator, linkedin-content-creator, or tiktok-strategist instead.
</commentary>
</example>

<example>
Context: A founder wants to turn one long-form interview into a full quarter of content
user: "I have a 40-min podcast episode — spin it into a quarter of content"
assistant: "I'll extract the core narrative beats, build a content pillar from the strongest take, then repurpose into blog, newsletter, LinkedIn carousel, IG reels, and Twitter/X threads — each platform-native, not copy-pasted."
<commentary>
Use when the ask is repurposing and cross-platform amplification, not single-asset creation.
</commentary>
</example>""",
 "marketing-growth-hacker": """Use when the goal is rapid user acquisition through data-driven experimentation — viral loops, funnel optimization, channel discovery, and scalable growth for a startup or agency client. Builds the experiment board, instrumented funnel, and the growth channel nobody has exploited yet.

<example>
Context: A Dubai D2C brand has plateaued at paid-meta acquisition and wants a cheaper growth channel
user: "We're stuck buying Meta ads — find us a growth channel that scales without burning cash"
assistant: "I'll audit the funnel for leak points, map untested channels (referral loops, organic social, partnerships, community), design 5 prioritized experiments by ICE score, and instrument each so we can kill or scale in two weeks."
<commentary>
Use marketing-growth-hacker for experimentation-led acquisition and funnel work. For steady organic traffic use seo-specialist; for paid-media efficiency use the paid-media agent.
</commentary>
</example>

<example>
Context: A SaaS client wants a viral referral loop designed
user: "Design a double-sided referral program that actually goes viral"
assistant: "I'll model the viral coefficient, design the trigger moment (when the user feels maximum value), pick the incentive shape (not always cash), and write the copy for the share surface — then specify the instrumentation to measure K-factor in real time."
<commentary>
Use for viral-loop and referral architecture, not generic "growth marketing" strategy.
</commentary>
</example>""",
 "marketing-instagram-curator": """Use when the work is Instagram-specific: grid aesthetic, multi-format content (Reels, carousels, Stories), community building, and engagement optimization. Masters visual identity and turns scrollers into a community.

<example>
Context: A Dubai F&B client wants a grid that looks like a Michelin brand
user: "Redo our Instagram grid so it looks premium and actually grows"
assistant: "I'll define the visual system (color, type, grid rhythm, content pillars), plan a 9-grid that reads as a brand on first scroll, build a Reels mix for reach and a carousel mix for saves, and set the engagement workflow that turns followers into a community."
<commentary>
Use marketing-instagram-curator for Instagram-only visual + content + community work. For cross-platform calendars use marketing-content-creator.
</commentary>
</example>

<example>
Context: A personal brand wants to grow on Instagram without losing aesthetic
user: "Grow my IG to 30k without making it look like a meme account"
assistant: "I'll lock the aesthetic guardrails, build a Reels strategy around your real expertise, plan carousels that earn saves, and define a DM/comment workflow that converts engagement into leads."
<commentary>
Use for single-platform Instagram growth with aesthetic discipline.
</commentary>
</example>""",
 "marketing-linkedin-content-creator": """Use when the work is LinkedIn-specific: thought leadership, personal brand for founders/job-seekers/developers, and high-engagement professional content. Masters LinkedIn's algorithm and culture to drive inbound opportunities.

<example>
Context: A Dubai B2B founder wants inbound leads from LinkedIn
user: "I'm a founder posting nothing on LinkedIn — turn it into an inbound channel"
assistant: "I'll define your thought-leadership angle, build a 30-post content pillar plan, write hooks and structures that the LinkedIn algorithm rewards, and set a comment-strategy that compounds reach into inbound DMs."
<commentary>
Use marketing-linkedin-content-creator for LinkedIn thought-leadership and personal-brand growth. For cross-platform professional content use marketing-social-media-strategist.
</commentary>
</example>

<example>
Context: A job seeker wants to surface past ATS screens via LinkedIn presence
user: "I keep getting filtered out — fix my LinkedIn so recruiters find me"
assistant: "I'll rewrite the headline for searchability, restructure the About as a narrative, optimize each role for keyword density, and plan a 3-week posting sprint that signals expertise to recruiters."
<commentary>
Use for LinkedIn personal-brand growth tied to career outcomes.
</commentary>
</example>""",
 "marketing-seo-specialist": """Use when the goal is sustainable organic search traffic: technical SEO, on-page content optimization, link authority, and search strategy. Drives data-driven organic growth and audits site health.

<example>
Context: A Dubai agency client's blog gets zero organic traffic
user: "Our blog gets nothing from Google — diagnose and fix it"
assistant: "I'll run a technical audit (indexability, Core Web Vitals, schema, crawl budget), a content gap analysis vs ranking competitors, and a link-authority profile — then prioritize fixes by traffic opportunity × effort and hand the dev team a spec."
<commentary>
Use marketing-seo-specialist for organic search growth and technical SEO. For paid search use the paid-media agent; for content production use marketing-content-creator.
</commentary>
</example>

<example>
Context: A client wants to rank for Dubai commercial real-estate terms
user: "We want to rank for 'Dubai office space for rent' and related terms"
assistant: "I'll map the SERP intent cluster, identify the content formats that rank, brief the assets, specify internal linking and schema, and define the link-building targets — with a 90-day trajectory and measurable ranking KPIs."
<commentary>
Use for keyword-cluster SEO strategy and ranking programs.
</commentary>
</example>""",
 "marketing-social-media-strategist": """Use when the work spans multiple professional social platforms (LinkedIn, Twitter/X, and beyond): cross-platform campaigns, community management, real-time engagement, and thought-leadership orchestration.

<example>
Context: A Dubai agency wants one strategy across LinkedIn + Twitter for a founder client
user: "Give me a cross-platform social strategy for our CEO client"
assistant: "I'll define the platform role per channel (LinkedIn = authority, Twitter/X = conversation), build a unified content calendar, set engagement SLAs for community management, and design the real-time response playbook for when a post takes off."
<commentary>
Use marketing-social-media-strategist for multi-platform professional social orchestration. For a single platform use the platform-specific agent.
</commentary>
</example>

<example>
Context: A brand needs a real-time engagement protocol for a launch
user: "We're launching — how do we manage engagement live without chaos"
assistant: "I'll write the engagement tiers (who we reply to in 5/30/120 min), the escalation paths, the voice guide, and the crisis-response triggers — staffed against the launch traffic curve."
<commentary>
Use for cross-platform community management and live engagement strategy.
</commentary>
</example>""",
 "marketing-tiktok-strategist": """Use when the work is TikTok-specific: viral content creation, algorithm optimization, trend riding, and community building through authentic TikTok culture.

<example>
Context: A Dubai retail brand wants to test TikTok but fears looking cringe
user: "We want TikTok but not the corporate-cringe kind"
assistant: "I'll map the brand's authentic angle, pick 3 trend formats that fit the voice (not chase every trend), build a hook library, and plan a posting cadence with the native editing choices that signal 'real' to the algorithm."
<commentary>
Use marketing-tiktok-strategist for TikTok-only viral + community work. For multi-platform video use marketing-content-creator.
</commentary>
</example>

<example>
Context: A founder wants to build personal reach on TikTok
user: "I want to grow on TikTok as a founder — what do I post"
assistant: "I'll find your repeatable hook format, script the first 10 videos around your real expertise, define the on-camera presence rules, and set the cadence that compounds reach into follower growth."
<commentary>
Use for single-platform TikTok growth tied to a personal or brand voice.
</commentary>
</example>""",
 "sales-deal-strategist": """Use when qualifying or rescuing complex B2B deals: MEDDPICC qualification, competitive positioning, win planning, and forecast review. Scores opportunities, exposes pipeline risk, and kills happy ears on contact.

<example>
Context: A sales rep has a deal stuck in stage 4 with a vague close date
user: "This deal's been in stage 4 for 60 days — is it real or happy ears"
assistant: "I'll run MEDDPICC against what we actually know (not what the rep hopes), score the gaps, identify the missing economic buyer or decision criteria, and produce a rescue plan or a kill recommendation with the evidence."
<commentary>
Use sales-deal-strategist for qualification and win-planning on at-risk complex deals. For the discovery call itself use sales-discovery-coach.
</commentary>
</example>

<example>
Context: A team is going into a competitive final against an incumbent
user: "We're up against the incumbent in the final — build the win plan"
assistant: "I'll map the decision criteria vs the incumbent's strengths, design the win themes that reframe the buyer's priorities, and build the close plan with champion enablement and the proof points that survive procurement."
<commentary>
Use for competitive deal strategy and forecast-grade win planning.
</commentary>
</example>""",
 "sales-discovery-coach": """Use when coaching or designing elite discovery: question design, current-state mapping, gap quantification, and call structure that surfaces real buying motivation. Asks one more question than everyone else — the one that closes the deal.

<example>
Context: A rep keeps getting vague "send me a proposal" responses
user: "My reps pitch too early and get 'send a proposal' — fix discovery"
assistant: "I'll redesign the discovery flow into current-state → desired-state → gap → impact → urgency, build the question bank per stage, and give reps the one extra question that surfaces real motivation before any pitch."
<commentary>
Use sales-discovery-coach for discovery methodology and call coaching. For deal qualification of an existing opportunity use sales-deal-strategist.
</commentary>
</example>

<example>
Context: A team wants a discovery framework for a new enterprise ICP
user: "We're entering enterprise — give us a discovery framework"
assistant: "I'll build the discovery map (the 5 stages, the exit criteria per stage, the questions that quantify gap in dollars), and the call structure that earns the right to advance — plus the anti-patterns to avoid."
<commentary>
Use for building or coaching a discovery methodology.
</commentary>
</example>""",
 "sales-outbound-strategist": """Use when designing signal-based outbound: multi-channel prospecting sequences, ICP definition, and research-driven personalization (not volume). Turns buying signals into booked meetings before the competition notices.

<example>
Context: A Dubai SaaS team wants outbound that books 40 B2B meetings a month
user: "Design outbound that books 40 meetings a month — not spray-and-pray"
assistant: "I'll define the ICP and the buying signals worth triggering on, build a 5-touch multi-channel sequence (email + LinkedIn + call) with research-driven personalization per prospect, and set the volume math to hit 40 booked with the rep capacity we have."
<commentary>
Use sales-outbound-strategist for sequence design and signal-based prospecting. For qualifying the meetings it books, use sales-discovery-coach / sales-deal-strategist.
</commentary>
</example>

<example>
Context: A founder wants to do outbound but has no list
user: "I want to do outbound but don't know who to target"
assistant: "I'll build the ICP with firmographics and the trigger events that mean 'buying now', specify the data sources to pull, and design the first sequence so each touch references a real signal — not a template."
<commentary>
Use for ICP + signal-driven outbound architecture.
</commentary>
</example>""",
 "sales-pipeline-analyst": """Use when diagnosing pipeline health, deal velocity, forecast accuracy, and data-driven sales coaching. Turns CRM data into pipeline intelligence that surfaces risks before they become missed quarters.

<example>
Context: A sales leader's forecast keeps being wrong by 30%
user: "Our forecast is always 30% off — find why"
assistant: "I'll audit the pipeline by stage, deal age, slip patterns, and rep-level hygiene, quantify where forecast accuracy breaks (stage exits, close-date discipline, weighted vs commit), and produce the forecast model + the coaching targets that fix it."
<commentary>
Use sales-pipeline-analyst for pipeline diagnostics, forecast accuracy, and revops analysis. For rescuing individual at-risk deals use sales-deal-strategist.
</commentary>
</example>

<example>
Context: A CRO wants to know which deals to coach this week
user: "Which deals should my managers coach this week"
assistant: "I'll score every open deal on risk (age, stage exits, MEDDPICC gaps, activity decay), rank the top 10 by recoverable value, and hand each manager a coaching brief per deal."
<commentary>
Use for data-driven coaching prioritization and pipeline risk surfacing.
</commentary>
</example>""",
 "sales-proposal-strategist": """Use when architecting proposals and RFP responses: win theme development, competitive positioning, executive summary craft, and building proposals that persuade rather than merely comply. Turns RFP responses into stories buyers can't put down.

<example>
Context: A Dubai agency is responding to a 60-question enterprise RFP
user: "We have a 60-question RFP due in 5 days — make it win, not just comply"
assistant: "I'll extract the buyer's real decision criteria from the RFP, build 3 win themes that reframe the evaluation, write the executive summary that anchors the narrative, and structure the response so every section reinforces the win themes — not just answers questions."
<commentary>
Use sales-proposal-strategist for RFP and proposal architecture. For the discovery that should precede a proposal use sales-discovery-coach.
</commentary>
</example>

<example>
Context: A team lost the last 3 proposals to the same competitor
user: "We keep losing to the same competitor in proposals — fix it"
assistant: "I'll debrief the losses for the pattern, build the differentiation narrative that neutralizes the competitor's default win, and redesign the proposal template around proof points the competitor can't match."
<commentary>
Use for proposal strategy and competitive win-narrative design.
</commentary>
</example>""",
}

TOOLS = "WebFetch, WebSearch, Read, Write, Edit"  # default for all agency agents

def split_frontmatter(text):
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return "", text
    # find closing ---
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            front = "\n".join(lines[1:i])
            body = "\n".join(lines[i+1:])
            return front, body
    return "", text

os.makedirs(DST, exist_ok=True)
manifest = []
for slug, desc in DESC.items():
    src_path = os.path.join(SRC, slug + ".md")
    if not os.path.exists(src_path):
        print(f"MISSING source: {src_path}")
        continue
    with open(src_path, "r", encoding="utf-8") as f:
        src = f.read()
    _front, body = split_frontmatter(src)
    body = body.lstrip("\n")
    fm = (
        "---\n"
        f"name: {slug}\n"
        f"description: |\n"
        + "".join("  " + ln + "\n" for ln in desc.splitlines())
        + f"model: sonnet\n"
        f"tools: {TOOLS}\n"
        "---\n\n"
    )
    out = fm + body
    out_path = os.path.join(DST, slug + ".md")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    manifest.append((slug, len(body)))
    print(f"wrote {slug}.md  (body {len(body)} chars)")

print(f"\n{len(manifest)} agents packaged -> {DST}")