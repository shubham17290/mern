// GitHub Pages landing — interactions
// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (href && href.length > 1) {
      const target = document.querySelector(href);
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: "smooth" }); }
    }
  });
});

// Scroll reveal
const revealEls = document.querySelectorAll(".project-card, .feature, .tech-item, .section-head");
revealEls.forEach(el => el.classList.add("reveal"));
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Stagger project cards
document.querySelectorAll(".project-card").forEach((c, i) => {
  c.style.transitionDelay = `${i * 0.08}s`;
  const color = c.dataset.color;
  if (color) c.style.setProperty("--card-color", color);
});