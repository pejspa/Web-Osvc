const yearEl = document.getElementById("year");
const root = document.documentElement;
const themeToggle = document.getElementById("theme-toggle");
const themeOptions = themeToggle
  ? Array.from(themeToggle.querySelectorAll("[data-theme-choice]"))
  : [];
const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const THEME_KEY = "theme-preference";
const themeOrder = ["system", "dark", "light"];

let themePreference = "system";

const resolveTheme = (preference) => {
  if (preference === "system") {
    return themeQuery.matches ? "dark" : "light";
  }

  return preference;
};

const renderThemeLabel = (preference, resolved) => {
  if (!themeToggle) {
    return;
  }

  const preferenceLabel =
    preference === "system"
      ? "automaticky podle systému"
      : preference === "dark"
        ? "tmavý"
        : "světlý";
  const resolvedLabel = resolved === "dark" ? "tmavý" : "světlý";

  themeToggle.dataset.mode = preference;
  themeToggle.dataset.resolved = resolved;
  themeToggle.setAttribute("aria-label", `Vzhled: ${preferenceLabel}, aktivně ${resolvedLabel}.`);
  themeToggle.setAttribute(
    "title",
    preference === "system"
      ? `Motiv: automaticky (${resolvedLabel})`
      : `Motiv: ${preferenceLabel}`
  );

  themeOptions.forEach((option) => {
    const optionMode = option.dataset.themeChoice;
    const isActive = optionMode === preference;

    option.setAttribute("aria-checked", String(isActive));
    option.setAttribute("tabindex", isActive ? "0" : "-1");
  });
};

const applyThemePreference = (preference, persist) => {
  themePreference = preference;

  const resolved = resolveTheme(preference);
  root.classList.toggle("theme-dark", resolved === "dark");

  renderThemeLabel(preference, resolved);

  if (!persist) {
    return;
  }

  if (preference === "system") {
    try {
      localStorage.removeItem(THEME_KEY);
    } catch (_) {}
    return;
  }

  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch (_) {}
};

if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

try {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "light" || storedTheme === "dark") {
    applyThemePreference(storedTheme, false);
  } else {
    applyThemePreference("system", false);
  }
} catch (_) {
  applyThemePreference("system", false);
}

if (themeToggle) {
  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const nextPreference = option.dataset.themeChoice;
      if (!nextPreference) {
        return;
      }

      applyThemePreference(nextPreference, true);
    });
  });

  themeToggle.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();

    const currentIndex = themeOrder.indexOf(themePreference);
    const delta = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + delta + themeOrder.length) % themeOrder.length;
    const nextPreference = themeOrder[nextIndex];

    applyThemePreference(nextPreference, true);
    themeOptions[nextIndex]?.focus();
  });
}

const syncSystemTheme = () => {
  if (themePreference === "system") {
    applyThemePreference("system", false);
  }
};

if (typeof themeQuery.addEventListener === "function") {
  themeQuery.addEventListener("change", syncSystemTheme);
} else if (typeof themeQuery.addListener === "function") {
  themeQuery.addListener(syncSystemTheme);
}

const revealNodes = document.querySelectorAll(".reveal");

revealNodes.forEach((node, index) => {
  node.style.transitionDelay = `${Math.min(index * 90, 420)}ms`;
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealNodes.forEach((node) => observer.observe(node));
