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

const futureObjectShell = document.querySelector('.future-object-shell');
if (futureObjectShell && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  futureObjectShell.addEventListener('pointermove', (event) => {
    const rect = futureObjectShell.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * 36 + 22;
    const rotateX = (0.5 - py) * 24 - 14;
    futureObjectShell.style.setProperty('--ry', `${rotateY.toFixed(2)}deg`);
    futureObjectShell.style.setProperty('--rx', `${rotateX.toFixed(2)}deg`);
  });

  futureObjectShell.addEventListener('pointerleave', () => {
    futureObjectShell.style.setProperty('--ry', '22deg');
    futureObjectShell.style.setProperty('--rx', '-14deg');
  });
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
