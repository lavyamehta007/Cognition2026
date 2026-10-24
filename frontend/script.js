const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.textContent = isOpen ? "×" : "☰";
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.textContent = "☰";
  });
});

const architectureButton = document.querySelector("#architecture-button");
const architecturePanel = document.querySelector("#architecture-panel");

architectureButton.addEventListener("click", () => {
  const willOpen = architecturePanel.hidden;
  architecturePanel.hidden = !willOpen;
  architectureButton.innerHTML = willOpen
    ? 'Hide architecture <span>↗</span>'
    : 'Explore the architecture <span>↗</span>';
  if (willOpen) {
    architecturePanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
});

// Subtle pointer parallax for the hero artwork. Disabled on touch/reduced-motion devices.
const orb = document.querySelector(".orb-stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (orb && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
  document.querySelector(".hero").addEventListener("pointermove", (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    orb.style.setProperty("--pointer-x", `${x * 10}px`);
    orb.style.setProperty("--pointer-y", `${y * 10}px`);
    orb.style.translate = `${x * 8}px ${y * 8}px`;
  });
  document.querySelector(".hero").addEventListener("pointerleave", () => {
    orb.style.translate = "0 0";
  });
}
