// Personal Portfolio — script
const THEME_KEY = "portfolio-theme";

// ---------- Theme ----------
const themeToggle = document.getElementById("themeToggle");
function applyTheme(dark) {
  document.body.classList.toggle("dark", dark);
  themeToggle.textContent = dark ? "☀️" : "🌙";
}
applyTheme(localStorage.getItem(THEME_KEY) === "dark");
themeToggle.addEventListener("click", () => {
  const dark = !document.body.classList.contains("dark");
  applyTheme(dark);
  localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
});

// ---------- Mobile menu ----------
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.querySelector(".nav-links");
menuToggle.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

// ---------- Smooth scroll + active link ----------
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const target = document.querySelector(a.getAttribute("href"));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
  });
});

// ---------- Typing effect for role ----------
const roles = ["responsive web apps.", "clean UI components.", "interactive experiences.", "full-stack solutions."];
const typedRole = document.getElementById("typedRole");
let ri = 0, ci = 0, deleting = false;
function typeLoop() {
  const word = roles[ri];
  if (!deleting) {
    typedRole.textContent = word.slice(0, ci + 1);
    ci++;
    if (ci === word.length) { deleting = true; setTimeout(typeLoop, 1400); return; }
  } else {
    typedRole.textContent = word.slice(0, ci - 1);
    ci--;
    if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(typeLoop, deleting ? 45 : 80);
}
typeLoop();

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll("section, .project-card, .stat, .skill");
revealEls.forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// ---------- Back to top ----------
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("show", window.scrollY > 400);
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------- Contact form ----------
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const subject = document.getElementById("cSubject").value.trim();
  const message = document.getElementById("cMessage").value.trim();
  if (!name || !email || !message) {
    statusEl.textContent = "Please fill all required fields.";
    statusEl.className = "form-status err";
    return;
  }
  // Open mail client with prefilled message (no backend needed)
  const mailto = `mailto:you@example.com?subject=${encodeURIComponent(subject || "Portfolio contact from " + name)}&body=${encodeURIComponent("Name: " + name + "\nEmail: " + email + "\n\n" + message)}`;
  window.location.href = mailto;
  statusEl.textContent = "Opening your email client… (or wire up Formspree for direct send)";
  statusEl.className = "form-status ok";
  form.reset();
});

// ---------- Active nav highlight ----------
const sections = document.querySelectorAll("section[id]");
const navAs = document.querySelectorAll(".nav-links a");
window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navAs.forEach(a => {
    a.style.color = a.getAttribute("href") === "#" + current ? "var(--accent)" : "";
  });
});