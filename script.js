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

const glassBox3d = document.getElementById('glassBox3d');
if (glassBox3d && !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
  const balls = Array.from(glassBox3d.querySelectorAll('.glass-ball'));
  const motionMap = [
    { x: 22, y: 12, z: 16 },
    { x: 16, y: 18, z: 10 },
    { x: 20, y: 10, z: 18 },
    { x: 14, y: 16, z: 12 },
    { x: 24, y: 8, z: 20 },
    { x: 12, y: 14, z: 9 },
    { x: 18, y: 20, z: 8 },
    { x: 13, y: 17, z: 7 },
    { x: 19, y: 12, z: 14 },
  ];

  const applyBallMotion = (nx, ny) => {
    balls.forEach((ball, index) => {
      const m = motionMap[index % motionMap.length];
      const dx = nx * m.x;
      const dy = ny * m.y;
      const lift = (Math.abs(nx) + Math.abs(ny)) * m.z * 0.4;
      ball.style.setProperty('--dx', `${dx.toFixed(2)}px`);
      ball.style.setProperty('--dy', `${dy.toFixed(2)}px`);
      ball.style.setProperty('--lift', `${lift.toFixed(2)}px`);
    });
  };

  glassBox3d.addEventListener('pointerenter', () => {
    glassBox3d.classList.add('active');
  });

  glassBox3d.addEventListener('pointermove', (event) => {
    const rect = glassBox3d.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width - 0.5;
    const ny = (event.clientY - rect.top) / rect.height - 0.5;

    glassBox3d.style.setProperty('--ry', `${(18 + nx * 22).toFixed(2)}deg`);
    glassBox3d.style.setProperty('--rx', `${(-12 - ny * 20).toFixed(2)}deg`);
    applyBallMotion(nx, ny);
  });

  glassBox3d.addEventListener('pointerleave', () => {
    glassBox3d.classList.remove('active');
    glassBox3d.style.setProperty('--ry', '18deg');
    glassBox3d.style.setProperty('--rx', '-12deg');
    applyBallMotion(0, 0);
  });
}

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
