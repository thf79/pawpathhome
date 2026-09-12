const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

function closeNav() {
  if (!navToggle || !siteNav) return;
  navToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

if (header) {
  const setHeaderState = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!open));
    siteNav.classList.toggle("is-open", !open);
    document.body.classList.toggle("nav-open", !open);
  });
  siteNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });
}

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 4, 3) * 55}ms`;
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const filterButtons = document.querySelectorAll("[data-filter]");
const guideCards = document.querySelectorAll("#guide-grid [data-category]");
const filterEmpty = document.querySelector("#filter-empty");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    let visible = 0;
    filterButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    guideCards.forEach((card) => {
      const show = filter === "all" || card.dataset.category === filter;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });
    if (filterEmpty) filterEmpty.hidden = visible !== 0;
  });
});

const planKey = "pawpath-plan-progress-v1";
const planInputs = [...document.querySelectorAll("[data-plan-day]")];
const planCount = document.querySelector("#plan-count");
const planProgress = document.querySelector("#plan-progress");
const planTrack = document.querySelector(".progress-track");
const planStatus = document.querySelector("#plan-status");

function readPlan() {
  try {
    const value = JSON.parse(localStorage.getItem(planKey) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writePlan(ids) {
  try {
    localStorage.setItem(planKey, JSON.stringify(ids));
  } catch {
    // Progress remains in memory when storage is unavailable.
  }
}

function updatePlan() {
  if (!planInputs.length) return;
  const done = planInputs.filter((input) => input.checked).length;
  const total = planInputs.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  if (planCount) planCount.textContent = `${done} of ${total}`;
  if (planProgress) planProgress.style.width = `${percent}%`;
  if (planTrack) planTrack.setAttribute("aria-valuenow", String(done));
  if (planStatus) {
    planStatus.textContent =
      done === 0
        ? "Check off a day after a successful short session."
        : done === total
          ? "Plan complete. Keep revisiting the skills in real life."
          : `${percent}% complete. Repeat any week that still feels hard.`;
  }
}

if (planInputs.length) {
  const saved = new Set(readPlan());
  planInputs.forEach((input) => {
    input.checked = saved.has(input.id);
    input.addEventListener("change", () => {
      const ids = planInputs.filter((item) => item.checked).map((item) => item.id);
      writePlan(ids);
      updatePlan();
    });
  });
  updatePlan();
}

const resetPlanButton = document.querySelector("#reset-plan");
if (resetPlanButton && planInputs.length) {
  resetPlanButton.addEventListener("click", () => {
    if (!window.confirm("Reset all locally saved plan progress?")) return;
    planInputs.forEach((input) => (input.checked = false));
    writePlan([]);
    updatePlan();
  });
}

document.querySelectorAll("[data-print]").forEach((button) => {
  button.addEventListener("click", () => window.print());
});
