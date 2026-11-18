(() => {
  const root = document.documentElement;
  const menuToggle = document.querySelector(".menu-toggle");
  const navPanel = document.querySelector(".nav-panel");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const themeToggle = document.querySelector(".theme-toggle");
  const backToTop = document.querySelector(".back-to-top");
  const form = document.querySelector("#contact-form");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getSavedTheme = () => {
    try {
      return localStorage.getItem("portfolio-theme");
    } catch (error) {
      return null;
    }
  };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    document.querySelector('meta[name="theme-color"]').content = theme === "dark" ? "#111421" : "#f7f8fc";
  };

  const savedTheme = getSavedTheme();
  setTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("portfolio-theme", nextTheme);
    } catch (error) {
      // Theme selection still works when storage is unavailable.
    }
  });

  const closeMenu = () => {
    navPanel.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    navPanel.classList.toggle("open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });
  navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  document.addEventListener("click", (event) => {
    if (navPanel.classList.contains("open") && !navPanel.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveLink(visible.target.id);
    }, { rootMargin: "-25% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5] });
    sections.forEach((section) => sectionObserver.observe(section));

    if (!reducedMotion) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
    } else {
      document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
    }
  } else {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("is-visible"));
  }

  const updateScrollControls = () => {
    backToTop.classList.toggle("visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", updateScrollControls, { passive: true });
  updateScrollControls();
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  });

  const fieldRules = {
    name: (value) => value.trim() ? "" : "Please enter your name.",
    email: (value) => {
      if (!value.trim()) return "Please enter your email address.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? "" : "Please enter a valid email address.";
    },
    message: (value) => value.trim() ? "" : "Please enter a message."
  };

  const showFieldError = (field) => {
    const message = fieldRules[field.name](field.value);
    const errorElement = document.querySelector(`#${field.name}-error`);
    errorElement.textContent = message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
    return !message;
  };

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => showFieldError(field));
    field.addEventListener("input", () => {
      if (field.hasAttribute("aria-invalid")) showFieldError(field);
      document.querySelector("#form-status").textContent = "";
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const fields = [...form.querySelectorAll("input, textarea")];
    const isValid = fields.map(showFieldError).every(Boolean);
    const status = document.querySelector("#form-status");
    if (!isValid) {
      status.textContent = "";
      fields.find((field) => field.getAttribute("aria-invalid") === "true").focus();
      return;
    }
    status.textContent = "Thanks! Your message is validated. This demo form does not send messages yet—please email me directly.";
    form.reset();
    fields.forEach((field) => {
      field.removeAttribute("aria-invalid");
      document.querySelector(`#${field.name}-error`).textContent = "";
    });
  });

  document.querySelector("#current-year").textContent = String(new Date().getFullYear());
})();
