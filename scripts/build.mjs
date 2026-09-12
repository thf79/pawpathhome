import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SITE, skills, principles, plan, faqs, guides as baseGuides, quickActions as baseQuickActions, quickActionGuideSlugs as baseQuickActionGuideSlugs, guideVisuals as baseGuideVisuals } from "./site-data.mjs";
import { extraGuides, extraQuickActions, extraQuickActionGuideSlugs, extraGuideVisuals } from "./extra-site-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const guides = [...baseGuides, ...extraGuides];
const quickActions = [...baseQuickActions, ...extraQuickActions];
const quickActionGuideSlugs = { ...baseQuickActionGuideSlugs, ...extraQuickActionGuideSlugs };
const guideVisuals = { ...baseGuideVisuals, ...extraGuideVisuals };
const HERO_SVG = await readFile(path.join(rootDir, "src", "assets", "hero-home.svg"), "utf8");

const esc = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const json = (value) =>
  JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll("&", "\\u0026");

const rootFor = (file) => (file.includes("/") ? "../" : "");
const absoluteUrl = (file) => (file === "index.html" ? `${SITE.domain}/` : `${SITE.domain}/${file}`);

const navItems = [
  { label: "Start here", file: "start-here.html" },
  { label: "Training plan", file: "training-plan.html" },
  { label: "Guides", file: "guides.html" },
  { label: "About", file: "about.html" }
];

function header(root, currentFile) {
  const nav = navItems
    .map((item) => {
      const current = currentFile === item.file || (item.file === "guides.html" && currentFile.startsWith("guides/"));
      return `<a href="${root}${item.file}"${current ? ' aria-current="page"' : ""}>${esc(item.label)}</a>`;
    })
    .join("");

  return `
  <a class="skip-link" href="#main-content">Skip to content</a>
  <header class="site-header" data-header>
    <div class="container header-inner">
      <a class="brand" href="${root}index.html" aria-label="${esc(SITE.name)} home">
        <img src="${root}assets/logo.svg" width="42" height="42" alt="" />
        <span><strong>PawPath</strong><small>HOME</small></span>
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">
        <span class="sr-only">Toggle navigation</span><span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Primary navigation">
        ${nav}
        <a class="button button-small" href="${root}training-plan.html">Start training</a>
      </nav>
    </div>
  </header>`;
}

function footer(root) {
  return `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand brand-light" href="${root}index.html">
          <img src="${root}assets/logo.svg" width="42" height="42" alt="" />
          <span><strong>PawPath</strong><small>HOME</small></span>
        </a>
        <p>Clear, kind training for the way real dogs live at home.</p>
      </div>
      <div><h2>Learn</h2><a href="${root}start-here.html">Start here</a><a href="${root}training-plan.html">4-week plan</a><a href="${root}guides.html">Training guides</a></div>
      <div><h2>Popular guides</h2><a href="${root}guides/name-and-attention.html">Name & attention</a><a href="${root}guides/come-when-called.html">Come when called</a><a href="${root}guides/loose-leash.html">Loose leash</a></div>
      <div><h2>About</h2><a href="${root}about.html">Our approach</a><a href="${root}privacy.html">Privacy</a></div>
    </div>
    <div class="container footer-bottom">
      <p>© ${new Date().getFullYear()} ${esc(SITE.name)}. Educational content only.</p>
      <p>Not a substitute for veterinary care or individualized behavior support.</p>
    </div>
  </footer>`;
}

function layout({ file, title, description, content, bodyClass = "", extraHead = "", structuredData = [] }) {
  const root = rootFor(file);
  const fullTitle = title === SITE.name ? `${SITE.name} | Positive Dog Training at Home` : `${title} | ${SITE.name}`;
  const schema = structuredData.map((item) => `<script type="application/ld+json">${json(item)}</script>`).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#17352c" />
  <title>${esc(fullTitle)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${absoluteUrl(file)}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="${esc(SITE.name)}" />
  <meta property="og:title" content="${esc(fullTitle)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${absoluteUrl(file)}" />
  <meta property="og:image" content="${SITE.domain}/assets/og-cover.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(fullTitle)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${SITE.domain}/assets/og-cover.png" />
  <link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml" />
  <link rel="manifest" href="${root}site.webmanifest" />
  <link rel="stylesheet" href="${root}assets/styles.css" />
  ${schema}
  ${extraHead}
</head>
<body class="${esc(bodyClass)}" data-page="${esc(file)}">
  ${header(root, file)}
  <main id="main-content">${content}</main>
  ${footer(root)}
  <script src="${root}assets/site.js" defer></script>
</body>
</html>`;
}

function iconArrow() { return `<span aria-hidden="true">→</span>`; }

function sectionIntro(kicker, title, text, centered = false) {
  return `<div class="section-intro${centered ? " section-intro-center" : ""}"><p class="eyebrow">${esc(kicker)}</p><h2>${esc(title)}</h2><p>${esc(text)}</p></div>`;
}

function skillCard(skill) {
  return `<article class="skill-card reveal"><span class="icon-tile" aria-hidden="true">${esc(skill.icon)}</span><h3>${esc(skill.title)}</h3><p>${esc(skill.text)}</p><a class="text-link" href="guides.html">Find the lesson ${iconArrow()}</a></article>`;
}

function guideCard(guide) {
  return `<article class="guide-card reveal" data-category="${esc(guide.category.toLowerCase())}"><div class="guide-card-top"><span class="icon-tile" aria-hidden="true">${esc(guide.icon)}</span><span class="pill">${esc(guide.category)}</span></div><p class="eyebrow">${esc(guide.kicker)}</p><h2><a href="guides/${esc(guide.slug)}.html">${esc(guide.title)}</a></h2><p>${esc(guide.summary)}</p><div class="guide-meta"><span>${esc(guide.duration)}</span><span>${esc(guide.difficulty)}</span></div><a class="text-link" href="guides/${esc(guide.slug)}.html">Open lesson ${iconArrow()}</a></article>`;
}

function faqMarkup() {
  return `<div class="faq-list">${faqs.map((item, index) => `<details class="faq-item"${index === 0 ? " open" : ""}><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join("")}</div>`;
}

function ctaBand() {
  return `<section class="cta-band"><div class="container cta-inner"><div><p class="eyebrow eyebrow-light">Your first session starts small</p><h2>Five calm minutes are enough to begin.</h2><p>Use the free four-week plan or start with the attention lesson today.</p></div><div class="button-row"><a class="button button-sun" href="training-plan.html">Open the 4-week plan</a><a class="button button-ghost-light" href="guides/name-and-attention.html">Start with attention</a></div></div></section>`;
}

function homePage() {
  const skillCards = skills.map(skillCard).join("");
  const principleCards = principles.map((item) => `<article class="principle-card reveal"><span class="principle-number">${esc(item.number)}</span><h3>${esc(item.title)}</h3><p>${esc(item.text)}</p></article>`).join("");
  const weekCards = plan.map((week) => `<article class="week-summary reveal"><span class="week-number">Week ${week.week}</span><h3>${esc(week.title)}</h3><p>${esc(week.goal)}</p></article>`).join("");
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } }))
  };
  const webSchema = { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: `${SITE.domain}/`, description: SITE.description };

  return layout({
    file: "index.html",
    title: SITE.name,
    description: SITE.description,
    bodyClass: "home-page",
    structuredData: [webSchema, faqSchema],
    content: `
      <section class="hero hero-home">
        <div class="container hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">Positive training for real homes</p>
            <h1>Small dog.<br><span>Big progress.</span></h1>
            <p class="hero-lede">${esc(SITE.tagline)} Short lessons, clear steps, and no complicated equipment.</p>
            <div class="button-row"><a class="button" href="training-plan.html">Start the free plan ${iconArrow()}</a><a class="button button-secondary" href="guides.html">Browse training guides</a></div>
            <ul class="mini-checks"><li>5–10 minute sessions</li><li>Force-free methods</li><li>Apartment-friendly</li><li>No account needed</li></ul>
          </div>
          <div class="hero-art">${HERO_SVG}<div class="floating-note floating-note-one"><strong>80%</strong><span>then add difficulty</span></div><div class="floating-note floating-note-two"><strong>Yes!</strong><span>mark the win</span></div></div>
        </div>
        <div class="container hero-footnote"><span>Built for puppies and adult dogs</span><span>•</span><span>Works in small spaces</span><span>•</span><span>Rewards, not intimidation</span></div>
      </section>
      <section class="section section-cream">
        <div class="container">${sectionIntro("The practical basics", "Teach the skills that make home life easier", "Each guide breaks one everyday skill into small, repeatable wins. No jargon and no perfect-dog pressure.", true)}<div class="card-grid card-grid-skills">${skillCards}</div></div>
      </section>
      <section class="section">
        <div class="container split-layout">
          <div class="sticky-copy"><p class="eyebrow">A method you can trust</p><h2>Training works best when your dog feels safe enough to try.</h2><p>PawPath Home uses positive reinforcement and humane, minimally aversive teaching. We focus on what to do, how to make it easier, and when to get qualified help.</p><a class="text-link" href="about.html">Read our training approach ${iconArrow()}</a></div>
          <div class="stacked-cards">${principleCards}</div>
        </div>
      </section>
      <section class="section section-green">
        <div class="container">
          <div class="section-intro section-intro-light"><p class="eyebrow eyebrow-light">No guesswork</p><h2>A four-week route from first cue to real life</h2><p>Practice five days a week, keep sessions short, and repeat any week that needs more time.</p></div>
          <div class="week-grid">${weekCards}</div><div class="center-action"><a class="button button-sun" href="training-plan.html">See every daily step</a></div>
        </div>
      </section>
      <section class="section">
        <div class="container feature-panel">
          <div class="feature-copy"><p class="eyebrow">Made for smaller dogs</p><h2>Same training principles. More attention to the details.</h2><p>Small and medium dogs are not miniature versions of large dogs, and they are not all low-energy. Our lessons use reward placement, body awareness, and realistic home setups that respect your dog’s size and comfort.</p><ul class="check-list"><li>Short training bursts that fit a busy household</li><li>Indoor foundations before distracting outdoor work</li><li>Harness and leash guidance without aversive tools</li><li>Clear thresholds for involving a professional</li></ul></div>
          <div class="feature-visual" aria-hidden="true"><div class="measure-card"><span class="measure-dog">“</span><p>Small body. Real feelings. Plenty of capacity to learn.</p><span class="measure-rule"></span></div></div>
        </div>
      </section>
      <section class="section section-cream">
        <div class="container narrow-layout">${sectionIntro("Questions, answered", "Before you pick up the treat pouch", "Quick answers about age, session length, treats, and when to bring in professional support.", true)}${faqMarkup()}</div>
      </section>
      ${ctaBand()}`
  });
}

function startHerePage() {
  const firstWeek = plan[0];
  const dayRows = firstWeek.days.map((day) => `<tr><th scope="row">${esc(day.label)}</th><td><span class="table-focus">${esc(day.focus)}</span></td><td>${esc(day.task)}</td></tr>`).join("");
  const actionCards = quickActions.map((action) => `<article class="action-card reveal"><figure class="action-art"><img src="assets/actions/${esc(action.art)}.svg" alt="${esc(action.alt)}" loading="lazy" /></figure><div class="action-card-head"><span class="action-icon" aria-hidden="true">${esc(action.icon)}</span><span class="pill">${esc(action.time)}</span></div><h2>${esc(action.name)}</h2><ol class="action-steps">${action.steps.map((step) => `<li>${esc(step)}</li>`).join("")}</ol><a class="text-link action-link" href="guides/${esc(quickActionGuideSlugs[action.name])}.html">Full method + pictures ${iconArrow()}</a></article>`).join("");

  return layout({
    file: "start-here.html",
    title: "Start Here",
    description: "Everything you need for your first successful week of positive at-home dog training: rewards, marker words, setup, and a five-minute session formula.",
    structuredData: [{ "@context": "https://schema.org", "@type": "Article", headline: "Start Here: Your First Successful Training Week", description: "A practical introduction to positive, at-home dog training.", author: { "@type": "Organization", name: SITE.name }, publisher: { "@type": "Organization", name: SITE.name } }],
    content: `
      <section class="page-hero"><div class="container page-hero-grid"><div><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Start here</span></nav><p class="eyebrow">Your first successful week</p><h1>Start here before you teach a single cue.</h1><p>Set up rewards, learn how to mark the right moment, and run a five-minute session your dog actually enjoys.</p></div><div class="page-hero-note"><strong>Start small</strong><p>Three minutes, one skill, and an easy ending beat a long session every time.</p></div></div></section>
      <section class="section"><div class="container">${sectionIntro("The essentials", "Four things to decide before training", "These small setup choices prevent most early frustration.", true)}<div class="numbered-grid"><article class="numbered-card reveal"><span>01</span><h2>Choose rewards</h2><p>Try tiny pieces of chicken, cheese, or a favorite treat. Keep a second option for easy practice and higher-value rewards for distractions.</p></article><article class="numbered-card reveal"><span>02</span><h2>Charge a marker</h2><p>Say “Yes” once, then immediately give a treat. Repeat ten times. Your marker will soon mean “that exact moment earned a reward.”</p></article><article class="numbered-card reveal"><span>03</span><h2>Quiet the room</h2><p>Close doors, move food bowls, and put other pets behind a gate if needed. New learners need an environment where success is likely.</p></article><article class="numbered-card reveal"><span>04</span><h2>Plan the ending</h2><p>Finish after one easy win, not after the first failure. Put the treats away calmly and let your dog rest.</p></article></div></div></section>
      <section class="section section-cream"><div class="container">${sectionIntro("Simple actions", "Try one tiny action today", "Pick one card, repeat it three times, and stop while your dog still looks interested.", true)}<div class="action-grid">${actionCards}</div><p class="action-note"><strong>Keep it accurate:</strong> guide with rewards, never push or hold your dog in position, and use one action per session.</p></div></section>
      <section class="section"><div class="container session-grid"><div class="session-copy"><p class="eyebrow">The session formula</p><h2>Warm up. Teach. Finish with a win.</h2><p>Use a timer if it helps you stop before attention fades. Your dog’s interest is part of the training plan.</p><div class="mini-rule"><strong>Rule of thumb</strong><span>Move on when your dog succeeds about 8 out of 10 tries.</span></div></div><ol class="timeline"><li><span>1 min</span><div><h3>Easy warm-up</h3><p>Repeat a skill your dog already knows. Deliver quick, cheerful rewards.</p></div></li><li><span>3 min</span><div><h3>One new criterion</h3><p>Add only one small challenge: a little more time, distance, or distraction.</p></div></li><li><span>1 min</span><div><h3>Easy finish</h3><p>Return to a guaranteed win, use your release cue, and end.</p></div></li></ol></div></section>
      <section class="section"><div class="container gear-grid"><div><p class="eyebrow">Keep it simple</p><h2>A starter kit that fits in one drawer</h2><p>You do not need a shelf of gadgets. Start with gear that is comfortable and lets you reward quickly.</p></div><ul class="gear-list"><li><span>01</span><div><strong>4–6 foot leash</strong><p>Easy to manage indoors and outdoors. Skip the retractable leash while teaching.</p></div></li><li><span>02</span><div><strong>Flat collar or fitted harness</strong><p>Choose the option your dog wears comfortably without pressure points.</p></div></li><li><span>03</span><div><strong>Pea-sized treats</strong><p>Soft enough to eat quickly. Count part of them within the daily food allowance.</p></div></li><li><span>04</span><div><strong>Treat pouch</strong><p>Keeps your hands free and makes reward delivery fast enough to explain the behavior.</p></div></li><li><span>05</span><div><strong>Mat or bed</strong><p>A predictable settle spot for calm practice and future relaxation work.</p></div></li></ul></div></section>
      <section class="section section-mint"><div class="container">${sectionIntro("Your first week", "A gentle plan for week one", "Keep the training area quiet and change only one thing at a time.", true)}<div class="table-wrap"><table class="training-table"><thead><tr><th>Day</th><th>Focus</th><th>5-minute assignment</th></tr></thead><tbody>${dayRows}</tbody></table></div><p class="table-note">Use the first two minutes of every session for a quick warm-up. If your dog needs more than a week, repeat the week without adding difficulty.</p></div></section>
      <section class="section"><div class="container narrow-layout"><div class="callout callout-green"><span class="callout-icon" aria-hidden="true">!</span><div><h2>When to pause and ask for help</h2><p>Stop training and contact a veterinarian or qualified force-free behavior professional if you see pain, sudden behavior changes, severe fear, repeated growling or snapping, bite injuries, or a dog who is not recovering between sessions.</p></div></div><div class="button-row button-row-center"><a class="button" href="training-plan.html">Continue to the 4-week plan ${iconArrow()}</a></div></div></section>`
  });
}

function trainingPlanPage() {
  const totalDays = plan.reduce((sum, week) => sum + week.days.length, 0);
  const weekMarkup = plan.map((week) => `<section class="plan-week reveal" aria-labelledby="week-${week.week}-title"><div class="plan-week-head"><div><p class="eyebrow">Week ${week.week}</p><h2 id="week-${week.week}-title">${esc(week.title)}</h2></div><p>${esc(week.goal)}</p></div><div class="plan-days">${week.days.map((day) => `<label class="plan-day" for="${esc(day.id)}"><input type="checkbox" id="${esc(day.id)}" data-plan-day /><span class="custom-check" aria-hidden="true"></span><span class="plan-day-copy"><span class="plan-day-meta">${esc(day.label)} · ${esc(day.focus)}</span><strong>${esc(day.task)}</strong></span></label>`).join("")}</div></section>`).join("");
  const planSchema = { "@context": "https://schema.org", "@type": "Course", name: "Four-Week At-Home Dog Training Plan", description: "A positive reinforcement home training plan for small and medium dogs.", provider: { "@type": "Organization", name: SITE.name }, educationalLevel: "Beginner", teaches: skills.map((skill) => skill.title), hasCourseInstance: { "@type": "CourseInstance", courseMode: "online", courseWorkload: "PT5M" } };

  return layout({
    file: "training-plan.html",
    title: "Four-Week Training Plan",
    description: "A free four-week, five-minutes-a-day positive dog training plan for small and medium dogs, with progress tracking and clear daily assignments.",
    bodyClass: "plan-page",
    structuredData: [planSchema],
    content: `
      <section class="page-hero page-hero-plan"><div class="container page-hero-grid"><div><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Training plan</span></nav><p class="eyebrow">Four weeks · 5 days each</p><h1>The small-dog home training plan.</h1><p>No account, no sign-up. One short session a day, one skill at a time, and a clear route from first attention games to real-life practice.</p></div><div class="plan-progress-card"><div class="progress-topline"><span>Your progress</span><strong id="plan-count">0 of ${totalDays}</strong></div><div class="progress-track" role="progressbar" aria-label="Training plan progress" aria-valuemin="0" aria-valuemax="${totalDays}" aria-valuenow="0"><span id="plan-progress"></span></div><p id="plan-status" aria-live="polite">Check off a day after a successful short session.</p><button class="text-button" type="button" id="reset-plan">Reset local progress</button></div></div></section>
      <section class="section"><div class="container plan-intro-grid"><div><p class="eyebrow">How to use it</p><h2>Repeat, shorten, or slow down whenever your dog needs it.</h2></div><div class="plan-rules"><div><span>1</span><p>Use 3–5 minute sessions and one focus per day.</p></div><div><span>2</span><p>Aim for 8 out of 10 easy successes before making the task harder.</p></div><div><span>3</span><p>Add only one challenge at a time: duration, distance, or distraction.</p></div><div><span>4</span><p>End before frustration. Repeat a week when life or learning gets noisy.</p></div></div></div><div class="container toolbar"><p><strong>Tip:</strong> Your checkmarks stay in this browser on this device.</p><button class="button button-secondary button-small" type="button" data-print>Print the plan</button></div></section>
      <section class="section section-cream"><div class="container plan-list">${weekMarkup}</div></section>
      <section class="section"><div class="container narrow-layout"><div class="callout"><span class="callout-icon" aria-hidden="true">→</span><div><h2>Need more detail on one skill?</h2><p>Open the matching guide for setup instructions, success criteria, and troubleshooting.</p><a class="text-link" href="guides.html">Browse all guides ${iconArrow()}</a></div></div></div></section>`
  });
}

function guidesPage() {
  return layout({
    file: "guides.html",
    title: "Dog Training Guides",
    description: "Browse 13 complete positive dog training guides for attention, positions, recall, loose-leash walking, stay, settle, potty training, leave it, off, drop it, door waiting, hand targeting, crate comfort, and gentle treat taking.",
    structuredData: [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Small and Medium Dog Training Guides", description: "Step-by-step home training guides using positive reinforcement.", hasPart: guides.map((guide) => ({ "@type": "Article", name: guide.title, url: `${SITE.domain}/guides/${guide.slug}.html` })) }],
    content: `
      <section class="page-hero page-hero-guides"><div class="container page-hero-grid"><div><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Guides</span></nav><p class="eyebrow">The training library</p><h1>One skill. Clear steps. A better everyday life.</h1><p>Start with foundations, then add life skills when your dog can succeed in a quiet room.</p></div><div class="library-count"><strong>${guides.length}</strong><span>practical guides</span></div></div></section>
      <section class="section"><div class="container"><div class="filter-bar" role="group" aria-label="Filter training guides"><button type="button" class="filter-button is-active" data-filter="all" aria-pressed="true">All guides</button><button type="button" class="filter-button" data-filter="foundations" aria-pressed="false">Foundations</button><button type="button" class="filter-button" data-filter="life skills" aria-pressed="false">Life skills</button><button type="button" class="filter-button" data-filter="puppy" aria-pressed="false">Puppy</button></div><div class="guide-grid" id="guide-grid">${guides.map(guideCard).join("")}</div><p class="filter-empty" id="filter-empty" hidden>No guides match that filter yet.</p></div></section>
      <section class="section section-green"><div class="container route-grid"><div><p class="eyebrow eyebrow-light">Recommended route</p><h2>Follow the learning sequence, not the alphabet.</h2><p>Attention and reward value come first. Positions and recall make daily cooperation easier. Leash, settle, and leave it build on that foundation.</p></div><ol class="route-list"><li><span>1</span><div><strong>Attention</strong><p>Name, eye contact, and a charged marker</p></div></li><li><span>2</span><div><strong>Positions</strong><p>Sit and down without hand dependency</p></div></li><li><span>3</span><div><strong>Cooperation</strong><p>Come, stay, loose leash, and leave it</p></div></li><li><span>4</span><div><strong>Real life</strong><p>Settle, duration, distance, and distraction</p></div></li></ol></div></section>`
  });
}

function guidePage(guide, index) {
  const previous = guides[(index - 1 + guides.length) % guides.length];
  const next = guides[(index + 1) % guides.length];
  const file = `guides/${guide.slug}.html`;
  const visual = guideVisuals[guide.slug];
  const visualMarkup = visual
    ? `<div class="guide-visual-grid${visual.images.length === 1 ? " guide-visual-single" : ""}">${visual.images.map((item) => `<figure class="guide-visual-card"><img src="../${esc(item.src)}" alt="${esc(item.alt)}" loading="lazy" /><figcaption>${esc(item.caption)}</figcaption></figure>`).join("")}</div>`
    : "";
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: guide.title,
    description: guide.summary,
    totalTime: guide.duration.includes("All") ? "P1D" : guide.duration.replace("–", "-").replace(" min", "M").replace(/^([0-9]+)-([0-9]+)M$/, "PT$1M"),
    supply: guide.setup,
    step: guide.steps.map((step, stepIndex) => ({ "@type": "HowToStep", position: stepIndex + 1, name: step.title, text: step.text })),
    publisher: { "@type": "Organization", name: SITE.name }
  };

  return layout({
    file,
    title: guide.title,
    description: guide.summary,
    bodyClass: "guide-page",
    structuredData: [schema],
    content: `
      <article>
        <header class="article-hero"><div class="container article-hero-inner"><div class="article-heading"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="../index.html">Home</a><span>/</span><a href="../guides.html">Guides</a><span>/</span><span>${esc(guide.kicker)}</span></nav><div class="article-kicker"><span class="icon-tile" aria-hidden="true">${esc(guide.icon)}</span><p class="eyebrow">${esc(guide.kicker)}</p></div><h1>${esc(guide.title)}</h1><p>${esc(guide.summary)}</p></div><div class="quick-facts"><div><span>Best for</span><strong>${esc(guide.category)}</strong></div><div><span>Session</span><strong>${esc(guide.duration)}</strong></div><div><span>Level</span><strong>${esc(guide.difficulty)}</strong></div></div></div></header>
        <div class="container article-layout">
          <div class="article-main">
            <section class="article-section article-goal"><p class="eyebrow">Goal</p><h2>What success looks like</h2><p>${esc(guide.goal)}</p></section>
            <section class="article-section guide-visual-section"><p class="eyebrow">Visual method</p><h2>See the sequence before you practice</h2><p>${esc(visual.intro)}</p>${visualMarkup}</section>
            <section class="article-section"><p class="eyebrow">Complete method</p><h2>One session, start to finish</h2><ol class="method-strip"><li><span>01</span><div><h3>Set up</h3><p>${esc(guide.setup[0])}</p></div></li><li><span>02</span><div><h3>Warm up</h3><p>Repeat one skill your dog already knows for 30 to 60 seconds.</p></div></li><li><span>03</span><div><h3>Teach</h3><p>${esc(guide.steps[0].text)}</p></div></li><li><span>04</span><div><h3>Reward</h3><p>Mark the exact behavior, then deliver the reward within one second.</p></div></li><li><span>05</span><div><h3>Repeat</h3><p>Do three to five easy repetitions. If two cues are missed, make the task easier.</p></div></li><li><span>06</span><div><h3>Advance</h3><p>${esc(guide.success)}</p></div></li><li><span>07</span><div><h3>Finish</h3><p>Use your release cue, reward one easy win, and end while your dog is still engaged.</p></div></li></ol></section><section class="article-section"><p class="eyebrow">Before you begin</p><h2>Set up for an easy win</h2><ul class="check-list">${guide.setup.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></section>
            <section class="article-section"><p class="eyebrow">Step by step</p><h2>How to teach it</h2><ol class="step-list">${guide.steps.map((step, stepIndex) => `<li><span>${String(stepIndex + 1).padStart(2, "0")}</span><div><h3>${esc(step.title)}</h3><p>${esc(step.text)}</p></div></li>`).join("")}</ol></section>
            <section class="article-section success-block"><span class="success-icon" aria-hidden="true">✓</span><div><p class="eyebrow">Success checkpoint</p><h2>You are ready to add difficulty when…</h2><p>${esc(guide.success)}</p></div></section>
            <section class="article-section"><p class="eyebrow">When progress stalls</p><h2>Common problems and fixes</h2><div class="troubleshooting-list">${guide.troubleshooting.map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`).join("")}</div></section>
            <section class="pro-tip"><p class="eyebrow">Trainer note</p><p>${esc(guide.proTip)}</p></section>
            <nav class="article-pagination" aria-label="Guide navigation"><a href="${esc(previous.slug)}.html"><span>Previous</span><strong>${esc(previous.title)}</strong></a><a href="${esc(next.slug)}.html"><span>Next</span><strong>${esc(next.title)}</strong></a></nav>
          </div>
          <aside class="article-aside">
            <div class="aside-card"><p class="eyebrow">The short version</p><h2>Keep this nearby</h2><dl><div><dt>Session length</dt><dd>${esc(guide.duration)}</dd></div><div><dt>Repetitions</dt><dd>3–5, then reset</dd></div><div><dt>Advance at</dt><dd>80% success</dd></div><div><dt>Reward</dt><dd>After the behavior</dd></div></dl></div>
            <div class="aside-card aside-card-green"><p class="eyebrow eyebrow-light">Safety first</p><h2>Do not push through fear or pain.</h2><p>Use a safer setup or seek qualified help if your dog freezes, panics, guards an item, growls, snaps, or cannot recover between sessions.</p><a href="../about.html">Read our approach</a></div>
          </aside>
        </div>
      </article>`
  });
}

function aboutPage() {
  return layout({
    file: "about.html",
    title: "Our Approach",
    description: "How PawPath Home evaluates dog training advice: positive reinforcement, humane methods, practical pacing, transparent limits, and qualified professional support.",
    structuredData: [{ "@context": "https://schema.org", "@type": "AboutPage", name: "Our Approach", description: "PawPath Home uses positive reinforcement and humane training principles." }],
    content: `
      <section class="page-hero page-hero-about"><div class="container narrow-layout"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>About</span></nav><p class="eyebrow">Our approach</p><h1>We teach skills, not fear.</h1><p>Good training should make the next decision easier for your dog. It should also make daily life calmer, clearer, and more connected for both of you.</p></div></section>
      <section class="section"><div class="container manifesto-grid"><div class="manifesto-title"><p class="eyebrow">Our standard</p><h2>Reward-based. Size-aware. Real-life focused.</h2></div><div class="manifesto-copy"><p>We use positive reinforcement and humane, minimally aversive teaching. Our guides break skills into steps that can be practiced in a small home, usually in five minutes or less.</p><p>We avoid dominance myths, pain, intimidation, flooding, and punishment-first advice. A dog does not need to be physically overpowered to learn sit, come, settle, or walk politely.</p></div></div></section>
      <section class="section section-cream"><div class="container">${sectionIntro("Editorial standards", "How we evaluate a training recommendation", "Every guide should pass these five questions.", true)}<div class="standard-grid"><article><span>01</span><h2>Does it protect welfare?</h2><p>The method should reduce fear, pain, and confusion while creating a practical result.</p></article><article><span>02</span><h2>Does it teach a behavior?</h2><p>Advice should explain what the dog can do instead, not only what to stop doing.</p></article><article><span>03</span><h2>Is the next step realistic?</h2><p>Guidance should include setup, timing, difficulty levels, and a way to make success easier.</p></article><article><span>04</span><h2>Does size and context matter?</h2><p>Small dogs are not toys, and medium dogs are not simply “large dog training in miniature.”</p></article><article><span>05</span><h2>Are the limits clear?</h2><p>Medical, safety, and complex behavior concerns belong with qualified professionals, not a generic web guide.</p></article></div></div></section>
      <section class="section"><div class="container split-layout split-layout-reverse"><div class="about-illustration" aria-hidden="true"><div class="about-circle"><span>5</span><strong>minute</strong><small>sessions</small></div><div class="about-rule"><span></span><span></span><span></span></div></div><div><p class="eyebrow">What we do not do</p><h2>We skip advice that trades trust for speed.</h2><ul class="cross-list"><li>No alpha rolls, scruffing, or dominance rituals</li><li>No shock, prong, choke, or startle collars</li><li>No yelling, leash jerks, or fear-based “respect”</li><li>No flooding a frightened dog to force exposure</li><li>No promises that every issue can be solved with a generic plan</li></ul></div></div></section>
      <section class="section section-green"><div class="container sources-layout"><div><p class="eyebrow eyebrow-light">Sources & further reading</p><h2>Learn from established humane-training resources.</h2><p>PawPath Home is an educational project. For individualized care, work with a veterinarian and a qualified force-free trainer or board-certified behavior professional.</p></div><div class="source-links"><a href="https://avsab.org/resources/position-statements/" target="_blank" rel="noopener noreferrer"><span>AVSAB</span> Position statements on humane training and behavior <b>↗</b></a><a href="https://fearfreepets.com/" target="_blank" rel="noopener noreferrer"><span>Fear Free Pets</span> Reducing fear, anxiety, and stress <b>↗</b></a><a href="https://www.akc.org/expert-advice/training/" target="_blank" rel="noopener noreferrer"><span>AKC</span> Positive dog training and expert advice <b>↗</b></a><a href="https://www.aspca.org/pet-care/dog-care/dog-training" target="_blank" rel="noopener noreferrer"><span>ASPCA</span> Dog training and behavior resources <b>↗</b></a></div></div></section>
      <section class="section"><div class="container narrow-layout"><div class="callout callout-coral"><span class="callout-icon" aria-hidden="true">+</span><div><h2>Need behavior or medical help now?</h2><p>Contact your veterinarian first for sudden behavior changes, pain, or illness concerns. For bite injuries or immediate danger, prioritize safety and contact local emergency or animal-control services as appropriate.</p></div></div></div></section>`
  });
}

function privacyPage() {
  return layout({
    file: "privacy.html",
    title: "Privacy",
    description: "PawPath Home privacy details: no accounts, and local browser storage for training progress.",
    content: `
      <section class="page-hero page-hero-privacy"><div class="container narrow-layout"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><span>Privacy</span></nav><p class="eyebrow">Privacy</p><h1>Keep training progress on your own device.</h1><p>This static educational site does not require an account.</p></div></section>
      <section class="section"><div class="container legal-copy"><h2>Information stored in your browser</h2><p>The four-week training plan stores your checked days in localStorage so the progress remains available when you return on the same browser and device. It is not sent to PawPath Home. You can clear it with the reset button on the training plan or by clearing site data in your browser.</p></div></section>`
  });
}

function notFoundPage() {
  return layout({
    file: "404.html",
    title: "Page Not Found",
    description: "The page could not be found. Return to the PawPath Home training library.",
    content: `<section class="not-found"><div class="container narrow-layout"><span class="not-found-icon" aria-hidden="true">↝</span><p class="eyebrow">404 · Lost the trail</p><h1>This page is not here.</h1><p>Your dog can keep practicing while we find a better path. Return home or browse the training library.</p><div class="button-row button-row-center"><a class="button" href="index.html">Back home</a><a class="button button-secondary" href="guides.html">Browse guides</a></div></div></section>`
  });
}

async function writePage(file, html) {
  const target = path.join(rootDir, file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

const pages = [
  ["index.html", homePage()],
  ["start-here.html", startHerePage()],
  ["training-plan.html", trainingPlanPage()],
  ["guides.html", guidesPage()],
  ...guides.map((guide, index) => [`guides/${guide.slug}.html`, guidePage(guide, index)]),
  ["about.html", aboutPage()],
  ["privacy.html", privacyPage()],
  ["404.html", notFoundPage()]
];

for (const [file, html] of pages) await writePage(file, html);

const sitemapFiles = ["index.html", "start-here.html", "training-plan.html", "guides.html", ...guides.map((guide) => `guides/${guide.slug}.html`), "about.html", "privacy.html"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapFiles.map((file) => `  <url><loc>${absoluteUrl(file)}</loc><changefreq>${file === "index.html" ? "weekly" : "monthly"}</changefreq><priority>${file === "index.html" ? "1.0" : "0.8"}</priority></url>`).join("\n")}
</urlset>
`;
await writePage("sitemap.xml", sitemap);
console.log(`Built ${pages.length} pages plus sitemap.xml.`);

const { cp } = await import("node:fs/promises");
await mkdir(path.join(rootDir, "assets"), { recursive: true });
await cp(path.join(rootDir, "src", "assets"), path.join(rootDir, "assets"), { recursive: true, force: true });
await cp(path.join(rootDir, "src", "styles", "styles.css"), path.join(rootDir, "assets", "styles.css"), { force: true });
await cp(path.join(rootDir, "src", "scripts", "site.js"), path.join(rootDir, "assets", "site.js"), { force: true });
for (const file of ["robots.txt", "site.webmanifest"]) {
  await cp(path.join(rootDir, "public", file), path.join(rootDir, file), { force: true });
}
console.log("Copied assets and public files.");








