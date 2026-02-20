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

const heroShowcase = document.getElementById('heroShowcase');
if (heroShowcase && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  const cardMain = heroShowcase.querySelector('.card-main');
  const cardSecond = heroShowcase.querySelector('.card-second');
  const cardThird = heroShowcase.querySelector('.card-third');
  const glowA = heroShowcase.querySelector('.glow-a');
  const glowB = heroShowcase.querySelector('.glow-b');

  heroShowcase.addEventListener('pointerenter', () => {
    heroShowcase.classList.add('active');
  });

  heroShowcase.addEventListener('pointermove', (event) => {
    const rect = heroShowcase.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    heroShowcase.style.setProperty('--tilt-x', `${(-ny * 9).toFixed(2)}deg`);
    heroShowcase.style.setProperty('--tilt-y', `${(nx * 12).toFixed(2)}deg`);

    if (cardMain) {
      cardMain.style.transform = `translate3d(${(nx * 20).toFixed(1)}px, ${(ny * 16).toFixed(1)}px, 60px)`;
    }
    if (cardSecond) {
      cardSecond.style.transform = `translate3d(${(nx * -16).toFixed(1)}px, ${(ny * 14).toFixed(1)}px, 22px) rotate(-6deg)`;
    }
    if (cardThird) {
      cardThird.style.transform = `translate3d(${(nx * 14).toFixed(1)}px, ${(ny * -14).toFixed(1)}px, 10px) rotate(8deg)`;
    }
    if (glowA) {
      glowA.style.transform = `translate(${(nx * 28).toFixed(1)}px, ${(ny * 20).toFixed(1)}px)`;
    }
    if (glowB) {
      glowB.style.transform = `translate(${(nx * -24).toFixed(1)}px, ${(ny * -18).toFixed(1)}px)`;
    }
  });

  heroShowcase.addEventListener('pointerleave', () => {
    heroShowcase.classList.remove('active');
    heroShowcase.style.setProperty('--tilt-x', '0deg');
    heroShowcase.style.setProperty('--tilt-y', '0deg');
    if (cardMain) cardMain.style.transform = '';
    if (cardSecond) cardSecond.style.transform = '';
    if (cardThird) cardThird.style.transform = '';
    if (glowA) glowA.style.transform = '';
    if (glowB) glowB.style.transform = '';
  });
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
