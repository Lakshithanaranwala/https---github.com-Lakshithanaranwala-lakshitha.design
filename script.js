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
applyTheme(savedTheme || 'dark');

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  });
}

const menuBtn = document.querySelector('.menu-btn');
const navLinks = document.querySelector('.nav-links');
const siteHeader = document.querySelector('.site-header');

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

if (siteHeader) {
  const handleIslandState = () => {
    siteHeader.classList.toggle('island-scrolled', window.scrollY > 14);
  };
  handleIslandState();
  window.addEventListener('scroll', handleIslandState, { passive: true });
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

const yearNode = document.getElementById('year');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const CASE_STORAGE_KEY = 'caseStudyContentV1';
const CASE_LIST_KEY = 'caseStudyListV1';
const CASE_LOCK_PASSWORD = 'LakshithaCS';
const CASE_DATA_ENDPOINT = '/api/case-data';
const DESIGN_STORAGE_KEY = 'designWorkDataV1';
const DESIGN_DATA_ENDPOINT = '/api/design-data';

const BASE_CASES = [
  {
    id: 'onboarding',
    label: 'Onboarding Redesign',
    path: 'case-study-onboarding.html',
    displayImage: 'assets/case-ui.svg',
    tag: 'Fintech Mobile App',
    title: 'Onboarding Redesign for Better Activation',
    summary: 'Simplified account setup with progressive disclosure, resulting in faster first-time value.',
    role: 'Lead UI/UX Designer',
    tools: 'Figma, FigJam, Miro',
    duration: '8 Weeks',
  },
  {
    id: 'analytics',
    label: 'Analytics Platform IA',
    path: 'case-study-analytics.html',
    displayImage: 'assets/case-ui.svg',
    tag: 'SaaS Dashboard',
    title: 'Information Architecture for Analytics Platform',
    summary: 'Reworked navigation hierarchy and filters to reduce cognitive load for power users.',
    role: 'Product Designer',
    tools: 'Figma, Miro, GA',
    duration: '10 Weeks',
  },
  {
    id: 'healthcare',
    label: 'Healthcare Patient Journey',
    path: 'case-study-healthcare.html',
    displayImage: 'assets/case-ui.svg',
    tag: 'Healthcare Web Portal',
    title: 'Accessibility-First Patient Journey',
    summary: 'Improved readability, contrast, and flow to help patients complete appointments with confidence.',
    role: 'UI/UX Designer',
    tools: 'Figma, WCAG Checks',
    duration: '6 Weeks',
  },
  {
    id: 'skyone',
    label: 'Sky one: All in one',
    path: 'case-study-skyone.html',
    displayImage: 'assets/case-ui.svg',
    tag: 'Sky one: All in one',
    title: 'Unified Product Experience Case Study',
    summary: 'Consolidated key workflows into one cohesive interface to reduce context switching and improve task flow.',
    role: 'Product Designer',
    tools: 'Figma, FigJam, Miro',
    duration: 'TBD',
  },
];

const getStoredCaseData = () => {
  try {
    const raw = localStorage.getItem(CASE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const getStoredCaseList = () => {
  try {
    const raw = localStorage.getItem(CASE_LIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadRemoteCaseData = async () => {
  try {
    const response = await fetch(CASE_DATA_ENDPOINT, { method: 'GET' });
    if (!response.ok) return false;
    const payload = await response.json();
    if (payload?.caseData && typeof payload.caseData === 'object') {
      localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(payload.caseData));
    }
    if (Array.isArray(payload?.caseList)) {
      localStorage.setItem(CASE_LIST_KEY, JSON.stringify(payload.caseList));
    }
    return true;
  } catch {
    return false;
  }
};

const getStoredDesignData = () => {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
};

const loadRemoteDesignData = async () => {
  try {
    const response = await fetch(DESIGN_DATA_ENDPOINT, { method: 'GET' });
    if (!response.ok) return false;
    const payload = await response.json();
    if (payload?.items) {
      localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(payload));
    }
    return true;
  } catch {
    return false;
  }
};

const initDesignCarousel = () => {
  const track = document.getElementById('designTrack');
  if (!track) return;
  const prevBtn = document.getElementById('designPrev');
  const nextBtn = document.getElementById('designNext');
  const emptyNode = document.getElementById('designEmpty');

  const data = getStoredDesignData();
  const items = data.items || [];
  if (!items.length) {
    if (emptyNode) emptyNode.classList.remove('hidden');
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  if (emptyNode) emptyNode.classList.add('hidden');
  track.innerHTML = items
    .map((item, idx) => {
      const label = item.label || `Design ${idx + 1}`;
      return `<figure class="design-card" data-index="${idx}"><img src="${item.src}" alt="${label}" /></figure>`;
    })
    .join('');

  let active = 0;
  const cards = Array.from(track.querySelectorAll('.design-card'));
  const update = () => {
    cards.forEach((card, idx) => {
      const offset = idx - active;
      const abs = Math.abs(offset);
      const translateX = offset * 260;
      const translateZ = Math.max(0, 180 - abs * 60);
      const rotateY = offset * -16;
      const scale = 1 - abs * 0.08;
      const opacity = abs > 3 ? 0 : 1 - abs * 0.18;
      card.style.transform = `translate(-50%, -50%) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = String(100 - abs);
    });
  };

  const next = () => {
    active = (active + 1) % cards.length;
    update();
  };
  const prev = () => {
    active = (active - 1 + cards.length) % cards.length;
    update();
  };

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  update();
};

const getAllCases = ({ includeArchived = false } = {}) => {
  const baseMap = new Map(BASE_CASES.map((item) => [item.id, item]));
  const storedList = getStoredCaseList();
  storedList.forEach((item) => {
    if (!item || !item.id) return;
    if (!baseMap.has(item.id)) {
      baseMap.set(item.id, {
        id: item.id,
        label: item.label || 'Case Study',
        path: item.path || `case-study-custom.html?case=${encodeURIComponent(item.id)}`,
        displayImage: 'assets/case-ui.svg',
        tag: item.label || 'Case Study',
        title: item.label || 'Case Study',
        summary: 'Open the full case study for details.',
        role: 'Product Designer',
        tools: 'Figma',
        duration: 'TBD',
        archived: !!item.archived,
      });
    } else {
      const existing = baseMap.get(item.id);
      baseMap.set(item.id, {
        ...existing,
        ...item,
        path: item.path || existing.path,
      });
    }
  });
  const cases = Array.from(baseMap.values());
  return includeArchived ? cases : cases.filter((item) => !item.archived);
};

const initStudyCarousel = () => {
  const carousel = document.getElementById('studyCarousel');
  const track = document.getElementById('studyTrack');
  const prevBtn = document.getElementById('studyPrev');
  const nextBtn = document.getElementById('studyNext');
  if (!carousel || !track || !prevBtn || !nextBtn) return;

  const storedData = getStoredCaseData();
  const cases = getAllCases();

  track.innerHTML = cases
    .map((item) => {
      const data = storedData[item.id] || {};
      const title = data.title || item.title || item.label;
      const summaryRaw = data.overview?.text || data.problem || item.summary || 'Open the full case study for details.';
      const summary = summaryRaw.replace(/<[^>]*>/g, '').trim();
      const role = data.overview?.role || item.role || 'Product Designer';
      const tools = data.overview?.tools || item.tools || 'Figma';
      const duration = data.overview?.duration || item.duration || 'TBD';
      const tag = data.badge || item.tag || item.label || 'Case Study';
      const href = item.path || `case-study-custom.html?case=${encodeURIComponent(item.id)}`;
      const displayImage = data.displayImage || data.heroImage || item.displayImage || 'assets/case-ui.svg';
      const lockIcon = item.locked
        ? '<span class="tag-lock" aria-label="Locked case study" title="Locked">🔒</span>'
        : '';

      return `
        <article class="study-card">
          <figure class="study-card-media">
            <img src="${displayImage}" alt="${title} display image" loading="lazy" />
          </figure>
          <div class="study-card-content">
            <span class="tag">${tag}${lockIcon}</span>
            <h3>${title}</h3>
            <p>${summary}</p>
            <ul class="study-card-meta">
              <li>Role: ${role}</li>
              <li>Tools: ${tools}</li>
              <li>Duration: ${duration}</li>
            </ul>
          </div>
          <div class="study-card-footer">
            <a href="${href}" aria-label="Read full case study for ${title}">Read Full Case Study</a>
          </div>
        </article>
      `;
    })
    .join('');

  let index = 0;
  let perView = 3;
  let maxIndex = 0;

  const getPerView = () => {
    if (window.innerWidth <= 760) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  };

  const update = () => {
    const cards = track.querySelectorAll('.study-card');
    perView = getPerView();
    maxIndex = Math.max(0, cards.length - perView);
    if (index > maxIndex) index = maxIndex;
    const lead = cards[0];
    const step = lead ? lead.getBoundingClientRect().width + 16 : 0;
    track.style.transform = `translateX(${-index * step}px)`;
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= maxIndex;
  };

  prevBtn.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    update();
  });

  nextBtn.addEventListener('click', () => {
    index = Math.min(maxIndex, index + 1);
    update();
  });

  window.addEventListener('resize', update);
  update();
};

const setText = (selector, value, scope = document) => {
  const node = scope.querySelector(selector);
  if (node && typeof value === 'string') node.textContent = value;
};

const setHTML = (selector, value, scope = document) => {
  const node = scope.querySelector(selector);
  if (node && typeof value === 'string') node.innerHTML = value;
};

const initCaseLockGate = () => {
  const caseLayoutNode = document.querySelector('.case-layout');
  const qsCaseId = new URLSearchParams(window.location.search).get('case');
  const caseId = document.body.dataset.caseId || qsCaseId;
  if (!caseLayoutNode || !caseId) return;

  const caseEntry = getAllCases({ includeArchived: true }).find((item) => item.id === caseId);
  if (!caseEntry?.locked) return;

  const unlockKey = `caseStudyUnlocked:${caseId}`;
  if (sessionStorage.getItem(unlockKey) === 'true') return;

  const main = document.querySelector('main');
  const footer = document.querySelector('footer');
  if (main) main.style.display = 'none';
  if (footer) footer.style.display = 'none';

  const gate = document.createElement('section');
  gate.className = 'case-password-gate';
  gate.innerHTML = `
    <form class="case-password-card">
      <p class="eyebrow">Protected Case Study</p>
      <h1>Enter Password</h1>
      <p>This case study is locked. Enter password to continue.</p>
      <div class="case-password-row">
        <input type="password" id="caseLockInput" placeholder="Password" required />
        <button class="btn primary" type="submit">Open</button>
      </div>
      <p class="case-password-error" id="caseLockError"></p>
    </form>
  `;
  document.body.appendChild(gate);

  const form = gate.querySelector('form');
  const input = gate.querySelector('#caseLockInput');
  const errorNode = gate.querySelector('#caseLockError');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (input.value === CASE_LOCK_PASSWORD) {
      sessionStorage.setItem(unlockKey, 'true');
      if (main) main.style.display = '';
      if (footer) footer.style.display = '';
      gate.remove();
      return;
    }
    errorNode.textContent = 'Incorrect password. Try again.';
    input.value = '';
    input.focus();
  });
};

const setImage = (imgNode, src) => {
  if (!imgNode) return;
  const figure = imgNode.closest('figure');
  if (src) {
    imgNode.src = src;
    if (figure) figure.style.display = '';
  } else {
    imgNode.removeAttribute('src');
    if (figure) figure.style.display = 'none';
  }
};

const applyCaseStudyContent = () => {
  const caseLayoutNode = document.querySelector('.case-layout');
  const qsCaseId = new URLSearchParams(window.location.search).get('case');
  const caseId = document.body.dataset.caseId || qsCaseId;
  if (!caseLayoutNode || !caseId) return;

  const allCases = getStoredCaseData();
  const data = allCases[caseId];
  if (!data) return;

  setText('.cs-hero-copy h1', data.title);
  setHTML('.cs-overview-text', data.overview?.text);
  setText('.cs-overview-grid article:nth-child(1) p', data.overview?.role);
  setText('.cs-overview-grid article:nth-child(2) p', data.overview?.tools);
  setText('.cs-overview-grid article:nth-child(3) p', data.overview?.duration);
  setHTML('.cs-problem p', data.problem);

  const heroImage = document.querySelector('.cs-hero-media img');
  setImage(heroImage, data.heroImage);

  const subsections = document.querySelectorAll('.cs-subsection');
  if (subsections.length >= 4) {
    const discoverImages = subsections[0].querySelectorAll('.cs-two-col img');
    setImage(discoverImages[0], data.process?.discover?.images?.[0]);
    setImage(discoverImages[1], data.process?.discover?.images?.[1]);
    setHTML('p', data.process?.discover?.text, subsections[0]);

    const defineImage = subsections[1].querySelector('.cs-single-image img');
    setImage(defineImage, data.process?.define?.image);
    setHTML('p', data.process?.define?.text, subsections[1]);

    const designItems = subsections[2].querySelectorAll('.cs-ui-grid figure');
    designItems.forEach((figure, index) => {
      const item = data.process?.design?.items?.[index];
      if (!item) return;
      const img = figure.querySelector('img');
      const caption = figure.querySelector('figcaption');
      setImage(img, item.image);
      if (caption && typeof item.text === 'string') caption.innerHTML = item.text;
    });

    setHTML('p', data.process?.deliver?.text, subsections[3]);
  }

  const solutionImages = document.querySelectorAll('.cs-section:last-of-type .cs-two-col img');
  setImage(solutionImages[0], data.solution?.images?.[0]);
  setImage(solutionImages[1], data.solution?.images?.[1]);
  setHTML('.cs-highlight', data.solution?.text);
};

const initCaseDataAndRender = async () => {
  await loadRemoteCaseData();
  await loadRemoteDesignData();
  applyCaseStudyContent();
  initCaseLockGate();
  initStudyCarousel();
  initDesignCarousel();
};

initCaseDataAndRender();

const caseLayout = document.querySelector('.case-layout');
if (caseLayout) {
  const zoomableImages = caseLayout.querySelectorAll(
    '.cs-two-col img, .cs-single-image img, .cs-ui-grid img, .cs-hero-media img'
  );

  if (zoomableImages.length) {
    const lightbox = document.createElement('div');
    lightbox.className = 'image-lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <div class="image-lightbox-backdrop"></div>
      <div class="image-lightbox-content">
        <button class="lightbox-close" aria-label="Close image view">&times;</button>
        <img alt="" />
      </div>
    `;
    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector('img');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const backdrop = lightbox.querySelector('.image-lightbox-backdrop');

    const closeLightbox = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxImage.removeAttribute('src');
      document.body.style.overflow = '';
    };

    const openLightbox = (img) => {
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt || 'Expanded case study image';
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    zoomableImages.forEach((img) => {
      img.addEventListener('click', () => openLightbox(img));
    });

    closeBtn.addEventListener('click', closeLightbox);
    backdrop.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }
}
