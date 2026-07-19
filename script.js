// =========================================================
// Config
// =========================================================
// Point this at your Flask backend if you deploy app.py.
// Leave as-is to fall back to a mailto: link automatically.
const CONTACT_ENDPOINT = "/contact";

// =========================================================
// Year in footer
// =========================================================
document.getElementById("year").textContent = new Date().getFullYear();

// =========================================================
// Scroll progress bar
// =========================================================
const progressBar = document.getElementById("progressBar");

function updateProgressBar(){
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = `${pct}%`;
}
window.addEventListener("scroll", updateProgressBar, { passive: true });
updateProgressBar();

// =========================================================
// Custom animated cursor (dot + lagging ring)
// =========================================================
const isFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const cursorDot = document.getElementById("cursorDot");
const cursorRing = document.getElementById("cursorRing");

if (isFinePointer && cursorDot && cursorRing) {
  document.body.classList.add("has-fine-pointer");

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });

  // smooth lagging ring via lerp, runs every frame
  function animateRing(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // grow the ring over clickable elements, thin it over text
  const hoverTargets = "a, button, .tilt-card, input, textarea, .tab";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) {
      cursorRing.classList.add("is-active");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) {
      cursorRing.classList.remove("is-active");
    }
  });

  document.addEventListener("mousedown", () => cursorRing.style.opacity = "1");
  document.addEventListener("mouseup", () => cursorRing.style.opacity = "");

  // hide cursor elements when the pointer leaves the window
  document.addEventListener("mouseleave", () => {
    cursorDot.style.opacity = "0";
    cursorRing.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    cursorDot.style.opacity = "1";
    cursorRing.style.opacity = "";
  });
}

// =========================================================
// Mascot buddy: floats freely and follows the cursor around the
// whole page, with eyes that look toward the actual pointer position
// =========================================================
const mascotBubble = document.getElementById("mascotBubble");
const mascotFloat = document.getElementById("mascotFloat");
const mascotFloatInner = document.getElementById("mascotFloatInner");
const pupilL = document.getElementById("mascotPupilL");
const pupilR = document.getElementById("mascotPupilR");

const mascotTips = [
  "Hi! I'm Robo 👋",
  "I'll follow you with my eyes wherever you go 👀",
  "Psst — don't forget to add real project links.",
  "Try the contact form, it actually works.",
  "CSE grads make the best robots.",
  "Tip: swap my colors in style.css → --accent",
  "You've got this. Ship the portfolio!"
];
let tipIndex = 0;
let bubbleTimeout;

function showMascotBubble(nearEl, text){
  if (!mascotBubble || !nearEl) return;
  const rect = nearEl.getBoundingClientRect();
  mascotBubble.textContent = text;
  mascotBubble.style.left = `${Math.min(rect.right + 10, window.innerWidth - 236)}px`;
  mascotBubble.style.top = `${Math.max(rect.top - 8, 12)}px`;
  mascotBubble.classList.add("is-visible");
  clearTimeout(bubbleTimeout);
  bubbleTimeout = setTimeout(() => mascotBubble.classList.remove("is-visible"), 3200);
}

if (isFinePointer && mascotFloat) {
  const CONTENT_MAX = 1120; // matches --max in style.css
  const GUTTER_PADDING = 24;
  const MIN_GUTTER = 170; // don't show Robo if the side gap is narrower than this

  let mascotSize = 132;
  let currentSide = "right"; // which gutter he's currently sitting in
  let visible = true;

  // assign alternating sides to each top-level section so Robo swaps
  // gutters as you scroll from one to the next
  const sections = Array.from(document.querySelectorAll("main > section"));
  sections.forEach((sec, i) => { sec.dataset.mascotSide = i % 2 === 0 ? "right" : "left"; });

  function gutterWidth(){
    return Math.max(0, (window.innerWidth - CONTENT_MAX) / 2);
  }

  function applyPosition(){
    const gw = gutterWidth();
    visible = gw >= MIN_GUTTER;
    mascotFloat.style.display = visible ? "" : "none";
    if (!visible) return;

    mascotSize = gw >= 260 ? 132 : gw >= 210 ? 108 : 84;
    mascotFloat.style.width = `${mascotSize}px`;
    mascotFloat.style.height = `${mascotSize}px`;

    const x = currentSide === "right"
      ? window.innerWidth - mascotSize - GUTTER_PADDING
      : GUTTER_PADDING;
    mascotFloat.style.transform = `translate(${x}px, -50%)`;
  }

  let crossingTimeout;
  function crossToSide(side){
    if (side === currentSide || !visible) { currentSide = side; return; }

    const oldSide = currentSide;
    currentSide = side;

    // exit fully off-screen on the side he's currently resting on
    const exitX = oldSide === "right" ? window.innerWidth + mascotSize : -mascotSize * 2;
    // then re-enter from the opposite edge and slide in to the new gutter
    const enterX = side === "right" ? window.innerWidth + mascotSize : -mascotSize * 2;
    const restX = side === "right"
      ? window.innerWidth - mascotSize - GUTTER_PADDING
      : GUTTER_PADDING;

    clearTimeout(crossingTimeout);

    // phase 1: slide out past the edge
    mascotFloat.style.transition = "transform .42s cubic-bezier(.4,0,1,1)";
    mascotFloat.style.transform = `translate(${exitX}px, -50%)`;

    crossingTimeout = setTimeout(() => {
      // phase 2: jump to just past the opposite edge, no animation
      mascotFloat.style.transition = "none";
      mascotFloat.style.transform = `translate(${enterX}px, -50%)`;
      void mascotFloat.offsetWidth; // force reflow so the next change animates

      // phase 3: slide in to the resting position in the new gutter
      mascotFloat.style.transition = "transform .55s cubic-bezier(.22,1,.36,1)";
      mascotFloat.style.transform = `translate(${restX}px, -50%)`;

      // hand control back to the default (stylesheet) transition once settled
      clearTimeout(crossingTimeout);
      crossingTimeout = setTimeout(() => { mascotFloat.style.transition = ""; }, 570);
    }, 430);
  }

  // track which section is most in view, and flip sides to match it
  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          const side = entry.target.dataset.mascotSide;
          if (side) crossToSide(side);
        }
      });
    }, { threshold: [0.4, 0.6] });

    sections.forEach(sec => sectionObserver.observe(sec));
  }

  window.addEventListener("resize", applyPosition, { passive: true });
  applyPosition();
  mascotFloat.classList.add("is-ready");

  // smoothed cursor position so head/eye movement glides rather than snaps
  let targetX = window.innerWidth * 0.75;
  let targetY = window.innerHeight * 0.5;
  let smoothX = targetX, smoothY = targetY;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  function animateMascot(){
    smoothX += (targetX - smoothX) * 0.15;
    smoothY += (targetY - smoothY) * 0.15;

    if (visible) {
      const rect = mascotFloat.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = smoothX - cx;
      const dy = smoothY - cy;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);

      // head turns gently toward the cursor, capped to a believable range
      const headTilt = Math.max(-16, Math.min(16, Math.cos(angle) * Math.min(dist / 60, 1) * 16));
      mascotFloatInner.style.transform = `rotate(${headTilt}deg)`;

      // pupils look toward the cursor within the eye socket
      const eyeDist = Math.min(3, dist / 90);
      const ex = Math.cos(angle) * eyeDist;
      const ey = Math.sin(angle) * eyeDist;
      if (pupilL) pupilL.style.transform = `translate(${ex}px, ${ey}px)`;
      if (pupilR) pupilR.style.transform = `translate(${ex}px, ${ey}px)`;
    }

    requestAnimationFrame(animateMascot);
  }
  requestAnimationFrame(animateMascot);

  mascotFloat.addEventListener("mousedown", () => mascotFloat.classList.add("is-active"));
  mascotFloat.addEventListener("mouseup", () => mascotFloat.classList.remove("is-active"));

  mascotFloat.addEventListener("click", () => {
    showMascotBubble(mascotFloat, mascotTips[tipIndex % mascotTips.length]);
    tipIndex++;
  });

  // greet once, shortly after the page loads
  setTimeout(() => showMascotBubble(mascotFloat, mascotTips[0]), 1400);
  tipIndex = 1;
}

// =========================================================
// Mobile nav toggle
// =========================================================
const nav = document.getElementById("nav");
const menuToggle = document.getElementById("menuToggle");

menuToggle?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

// =========================================================
// Hero "typing" code effect
// =========================================================
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const codeLines = [
  { text: "const developer = {", cls: "code-key" },
  { text: "  name: \"Abdur Rahman\",", cls: "code-string" },
  { text: "  role: \"CSE student\",", cls: "code-string" },
  { text: "  skills: [\"Python\", \"JS\", \"HTML\", \"CSS\", \"C++\"],", cls: "code-string" },
  { text: "  hobbies: \"Cricket, Tea, Tutoring\",", cls: "code-string" },
  { text: "  hireable: true", cls: "code-key" },
  { text: "};" }
];

function renderCodeHighlighted(line){
  // very light manual "syntax highlight" using CSS var colors
  return line
    .replace(/(".*?")/g, '<span style="color:var(--code-string)">$1</span>')
    .replace(/\b(const|true|false)\b/g, '<span style="color:var(--code-key)">$1</span>');
}

async function typeCode(){
  const el = document.getElementById("typedCode");
  if (!el) return;

  if (prefersReducedMotion) {
    el.innerHTML = codeLines.map(l => renderCodeHighlighted(l.text)).join("\n");
    return;
  }

  for (const line of codeLines) {
    let current = "";
    for (const char of line.text) {
      current += char;
      el.innerHTML = getPreviousLines() + renderCodeHighlighted(current);
      await sleep(14);
    }
    el.innerHTML += "\n";
    finishedLines.push(line.text);
  }

  function getPreviousLines(){
    return finishedLines.length ? finishedLines.map(renderCodeHighlighted).join("\n") + "\n" : "";
  }
}

const finishedLines = [];
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

// kick off typing once hero is in view (or immediately if already visible)
typeCode();

// =========================================================
// Scroll reveal for sections
// =========================================================
const revealTargets = document.querySelectorAll(
  ".section-title, .about-grid, .skills-grid .skill-card, .projects-grid .project-card, .timeline-item, .contact-grid"
);
revealTargets.forEach(el => el.classList.add("reveal"));

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add("is-visible"));
}

// =========================================================
// Tilt + spotlight on cards (project cards, skill cards, editor card, contact links)
// =========================================================
if (isFinePointer && !prefersReducedMotion) {
  // union of every element that needs either effect, so elements with
  // BOTH classes (e.g. contact links) get one combined transform instead
  // of two listeners fighting over el.style.transform
  const interactiveEls = new Set([
    ...document.querySelectorAll(".tilt-card"),
    ...document.querySelectorAll(".magnetic")
  ]);

  interactiveEls.forEach(el => {
    const doTilt = el.classList.contains("tilt-card");
    const doMagnet = el.classList.contains("magnetic");

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const parts = [];

      if (doTilt) {
        el.style.setProperty("--mx", `${x}px`);
        el.style.setProperty("--my", `${y}px`);
        const rotateX = ((y / rect.height) - 0.5) * -6;
        const rotateY = ((x / rect.width) - 0.5) * 6;
        parts.push(`perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`);
      }

      if (doMagnet) {
        const cx = x - rect.width / 2;
        const cy = y - rect.height / 2;
        parts.push(`translate(${cx * 0.2}px, ${cy * 0.3}px)`);
      }

      el.style.transform = parts.join(" ");
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
}

// =========================================================
// Active nav link on scroll
// =========================================================
const sections = document.querySelectorAll("main section[id]");
const tabs = document.querySelectorAll(".tab");

function setActiveTab(){
  let current = "";
  sections.forEach(section => {
    const top = section.offsetTop - 120;
    if (window.scrollY >= top) current = section.id;
  });
  tabs.forEach(tab => {
    tab.style.color = "";
    tab.style.borderColor = "";
    if (tab.getAttribute("href") === `#${current}`) {
      tab.style.color = "var(--ink)";
      tab.style.borderColor = "var(--accent)";
    }
  });
}
window.addEventListener("scroll", setActiveTab, { passive: true });
setActiveTab();

// =========================================================
// Contact form submission
// =========================================================
const form = document.getElementById("contactForm");
const submitBtn = document.getElementById("submitBtn");
const status = document.getElementById("formStatus");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    message: document.getElementById("message").value.trim()
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending...";
  status.textContent = "";

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Request failed");

    status.textContent = "200 OK — message sent. I'll reply soon!";
    status.style.color = "var(--green)";
    form.reset();
  } catch (err) {
    // Fallback: no backend running, open the user's email client instead.
    status.textContent = "Backend not reachable — opening your email client instead.";
    status.style.color = "var(--accent-2)";
    const subject = encodeURIComponent(`Portfolio contact from ${payload.name}`);
    const body = encodeURIComponent(`${payload.message}\n\n— ${payload.name} (${payload.email})`);
    window.location.href = `mailto:abdurrahman017370@gmail.com?subject=${subject}&body=${body}`;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Send message";
  }
});
