const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.toggle-label');

const applyTheme = (theme) => {
  root.setAttribute('data-theme', theme);
  if (!themeToggle) return;

  const isDark = theme === 'dark';
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  if (themeLabel) {
    themeLabel.textContent = isDark ? 'Light' : 'Dark';
  }
};

const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyTheme(savedTheme || (systemPrefersDark ? 'dark' : 'light'));

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(isOpen));
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

const revealNodes = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
  }
);

revealNodes.forEach((node) => observer.observe(node));

const heroTitleWrap = document.querySelector('.hero-title-wrap');

if (heroTitleWrap && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  let rafId = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const tick = () => {
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;

    heroTitleWrap.style.setProperty('--mx', `${currentX}px`);
    heroTitleWrap.style.setProperty('--my', `${currentY}px`);

    if (Math.abs(targetX - currentX) > 0.08 || Math.abs(targetY - currentY) > 0.08) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  };

  const queueTick = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const updateTargetFromEvent = (event) => {
    const rect = heroTitleWrap.getBoundingClientRect();
    targetX = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
    targetY = Math.max(0, Math.min(event.clientY - rect.top, rect.height));
  };

  const handleEnter = (event) => {
    updateTargetFromEvent(event);
    currentX = targetX;
    currentY = targetY;
    heroTitleWrap.classList.add('active');
    queueTick();
  };

  const handleMove = (event) => {
    updateTargetFromEvent(event);
    queueTick();
  };

  const handleLeave = () => {
    heroTitleWrap.classList.remove('active');
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  heroTitleWrap.addEventListener('pointerenter', handleEnter);
  heroTitleWrap.addEventListener('pointermove', handleMove);
  heroTitleWrap.addEventListener('pointerleave', handleLeave);
  heroTitleWrap.addEventListener('mouseenter', handleEnter);
  heroTitleWrap.addEventListener('mousemove', handleMove);
  heroTitleWrap.addEventListener('mouseleave', handleLeave);
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
