const ADMIN_PASSWORD = 'Lakshitha123@';
const CASE_STORAGE_KEY = 'caseStudyContentV1';
const CASE_LIST_KEY = 'caseStudyListV1';
const ADMIN_AUTH_KEY = 'caseStudyAdminUnlocked';

const BASE_CASES = [
  { id: 'onboarding', label: 'Onboarding Redesign', path: 'case-study-onboarding.html', archived: false, locked: false },
  { id: 'analytics', label: 'Analytics Platform IA', path: 'case-study-analytics.html', archived: false, locked: false },
  { id: 'healthcare', label: 'Healthcare Patient Journey', path: 'case-study-healthcare.html', archived: false, locked: false },
  { id: 'skyone', label: 'Sky one: All in one', path: 'case-study-skyone.html', archived: false, locked: false },
];

const DEFAULT_IMAGE = {
  hero: 'assets/case-bg.svg',
  discover: 'assets/case-discover.svg',
  define: 'assets/case-define.svg',
  ui: 'assets/case-ui.svg',
  solution: 'assets/case-solution.svg',
};

const makeDefaultCaseData = (title = 'New Case Study') => ({
  title,
  badge: title,
  heroImage: DEFAULT_IMAGE.hero,
  overview: {
    text: 'Add a short overview paragraph for this case study.',
    role: 'Product Designer',
    tools: 'Figma',
    duration: 'TBD',
  },
  problem: 'Add problem statement from admin.',
  process: {
    discover: { images: [DEFAULT_IMAGE.discover, DEFAULT_IMAGE.discover], text: 'Add discover insights from admin.' },
    define: { image: DEFAULT_IMAGE.define, text: 'Add define insights from admin.' },
    design: {
      items: Array.from({ length: 6 }, (_, i) => ({ image: DEFAULT_IMAGE.ui, text: `Design screen ${i + 1} description.` })),
    },
    deliver: { text: 'Add deliver details from admin.' },
  },
  solution: { images: [DEFAULT_IMAGE.solution, DEFAULT_IMAGE.solution], text: 'Add solution highlight from admin.' },
});

const DEFAULTS = {
  onboarding: makeDefaultCaseData('Onboarding Redesign for Better Activation'),
  analytics: makeDefaultCaseData('Information Architecture for Analytics Platform'),
  healthcare: makeDefaultCaseData('Accessibility-First Patient Journey'),
  skyone: makeDefaultCaseData('Sky one: All in one'),
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const clone = (obj) => JSON.parse(JSON.stringify(obj));

const loginView = $('#loginView');
const adminApp = $('#adminApp');
const loginForm = $('#adminLoginForm');
const loginError = $('#adminLoginError');
const caseListNode = $('#caseList');
const createCaseForm = $('#createCaseForm');
const newCaseTitle = $('#newCaseTitle');
const createCaseMsg = $('#createCaseMsg');
const editorEmpty = $('#editorEmpty');
const editorView = $('#editorView');
const editorCaseTitle = $('#editorCaseTitle');
const openCaseLink = $('#openCaseLink');
const editorForm = $('#editorForm');
const saveMessage = $('#saveMessage');
const resetCaseBtn = $('#resetCaseBtn');
const archiveCaseBtn = $('#archiveCaseBtn');
const lockCaseBtn = $('#lockCaseBtn');
const designItemsEditor = $('#designItemsEditor');
const adminLogoutBtn = $('#adminLogoutBtn');

let currentCaseId = null;

const getStore = () => {
  try {
    return JSON.parse(localStorage.getItem(CASE_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
};

const setStore = (data) => {
  try {
    localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

const getCaseList = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(CASE_LIST_KEY) || 'null');
    if (!Array.isArray(stored)) return clone(BASE_CASES);
    const map = new Map(stored.map((c) => [c.id, c]));
    BASE_CASES.forEach((base) => {
      if (!map.has(base.id)) {
        map.set(base.id, base);
      } else {
        map.set(base.id, { ...base, ...map.get(base.id) });
      }
    });
    return Array.from(map.values());
  } catch {
    return clone(BASE_CASES);
  }
};

const setCaseList = (list) => localStorage.setItem(CASE_LIST_KEY, JSON.stringify(list));

const getCaseById = (id) => getCaseList().find((c) => c.id === id) || null;
const getCasePath = (caseObj) => caseObj.path || `case-study-custom.html?case=${encodeURIComponent(caseObj.id)}`;

const updateCaseActionButtons = (caseObj) => {
  if (!caseObj) return;
  if (archiveCaseBtn) archiveCaseBtn.textContent = caseObj.archived ? 'Unarchive' : 'Archive';
  if (lockCaseBtn) lockCaseBtn.textContent = caseObj.locked ? 'Unlock' : 'Lock';
};

const getCaseData = (caseId) => {
  const store = getStore();
  if (store[caseId]) return clone(store[caseId]);
  if (DEFAULTS[caseId]) return clone(DEFAULTS[caseId]);
  const caseEntry = getCaseById(caseId);
  return makeDefaultCaseData(caseEntry?.label || 'New Case Study');
};

const setInputValue = (id, value) => {
  const input = document.getElementById(id);
  if (input?.isContentEditable) {
    input.innerHTML = value || '';
  } else if (input) {
    input.value = value || '';
  }
  const preview = document.getElementById(`preview_${id.replace('field_', '')}`);
  if (!preview) return;
  if (value) {
    preview.src = value;
    preview.style.display = '';
  } else {
    preview.removeAttribute('src');
    preview.style.display = 'none';
  }
};

const getFieldValue = (id) => {
  const input = document.getElementById(id);
  if (!input) return '';
  if (input.isContentEditable) return input.innerHTML.trim();
  return input.value;
};

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const compressImageFile = async (file) => {
  const source = await readAsDataUrl(file);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxW = 1600;
      const maxH = 1600;
      let { width, height } = img;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => resolve(source);
    img.src = source;
  });
};

const buildDesignEditors = () => {
  designItemsEditor.innerHTML = Array.from({ length: 6 }, (_, idx) => {
    const i = idx + 1;
    return `
      <div style="border:1px solid var(--border);padding:0.7rem;border-radius:10px;margin-top:0.6rem;">
        <label for="field_designImage${i}">Design Image ${i}</label>
        <div class="img-row">
          <input id="field_designImage${i}" type="text" />
          <input id="upload_designImage${i}" type="file" accept="image/*" />
          <button class="btn ghost delete-image" data-target="field_designImage${i}" type="button">Delete</button>
        </div>
        <img id="preview_designImage${i}" class="img-preview" alt="Design image ${i} preview" />
        <label for="field_designText${i}">Design Text ${i}</label>
        <div class="rte-toolbar" data-target="field_designText${i}">
          <button class="btn ghost rte-btn" type="button" data-cmd="bold">Bold</button>
          <button class="btn ghost rte-btn" type="button" data-cmd="italic">Italic</button>
          <input class="rte-color" type="color" title="Text color" data-cmd="foreColor" value="#ffffff" />
          <input class="rte-color" type="color" title="Highlight" data-cmd="hiliteColor" value="#fff3a3" />
          <button class="btn ghost rte-btn" type="button" data-cmd="insertUnorderedList">Bullets</button>
        </div>
        <div id="field_designText${i}" class="rte-editor" contenteditable="true"></div>
      </div>
    `;
  }).join('');
};

const loadCaseIntoForm = (caseId) => {
  const data = getCaseData(caseId);
  const caseObj = getCaseById(caseId);
  editorCaseTitle.textContent = caseObj?.label || 'Case Study';
  openCaseLink.href = caseObj ? getCasePath(caseObj) : '#';
  updateCaseActionButtons(caseObj);

  setInputValue('field_title', data.title);
  setInputValue('field_badge', data.badge || caseObj?.tag || caseObj?.label || '');
  setInputValue('field_heroImage', data.heroImage);
  setInputValue('field_overviewText', data.overview.text);
  setInputValue('field_role', data.overview.role);
  setInputValue('field_tools', data.overview.tools);
  setInputValue('field_duration', data.overview.duration);
  setInputValue('field_problem', data.problem);

  setInputValue('field_discoverText', data.process.discover.text);
  setInputValue('field_discoverImage1', data.process.discover.images[0]);
  setInputValue('field_discoverImage2', data.process.discover.images[1]);
  setInputValue('field_defineText', data.process.define.text);
  setInputValue('field_defineImage', data.process.define.image);
  setInputValue('field_deliverText', data.process.deliver.text);

  data.process.design.items.forEach((item, idx) => {
    const i = idx + 1;
    setInputValue(`field_designImage${i}`, item.image);
    setInputValue(`field_designText${i}`, item.text);
  });

  setInputValue('field_solutionText', data.solution.text);
  setInputValue('field_solutionImage1', data.solution.images[0]);
  setInputValue('field_solutionImage2', data.solution.images[1]);
};

const collectFormData = () => ({
  title: getFieldValue('field_title'),
  badge: getFieldValue('field_badge'),
  heroImage: getFieldValue('field_heroImage'),
  overview: {
    text: getFieldValue('field_overviewText'),
    role: getFieldValue('field_role'),
    tools: getFieldValue('field_tools'),
    duration: getFieldValue('field_duration'),
  },
  problem: getFieldValue('field_problem'),
  process: {
    discover: {
      text: getFieldValue('field_discoverText'),
      images: [getFieldValue('field_discoverImage1'), getFieldValue('field_discoverImage2')],
    },
    define: {
      text: getFieldValue('field_defineText'),
      image: getFieldValue('field_defineImage'),
    },
    design: {
      items: Array.from({ length: 6 }, (_, idx) => {
        const i = idx + 1;
        return { image: getFieldValue(`field_designImage${i}`), text: getFieldValue(`field_designText${i}`) };
      }),
    },
    deliver: { text: getFieldValue('field_deliverText') },
  },
  solution: {
    text: getFieldValue('field_solutionText'),
    images: [getFieldValue('field_solutionImage1'), getFieldValue('field_solutionImage2')],
  },
});

const activateTab = (tabId) => {
  $$('.tab-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.tab === tabId));
  $$('.tab-panel').forEach((panel) => panel.classList.toggle('active', panel.dataset.panel === tabId));
};

const openCaseEditor = (caseId) => {
  currentCaseId = caseId;
  editorEmpty.classList.add('hidden');
  editorView.classList.remove('hidden');
  activateTab('title');
  loadCaseIntoForm(caseId);
  saveMessage.textContent = '';
};

const setupUploadControls = () => {
  $$('input[type="file"]').forEach((fileInput) => {
    fileInput.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const targetId = fileInput.id.replace('upload_', 'field_');
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;
      const dataUrl = await compressImageFile(file);
      targetInput.value = dataUrl;
      setInputValue(targetId, dataUrl);
      event.target.value = '';
    });
  });

  $$('.delete-image').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.target;
      setInputValue(id, '');
    });
  });

  $$('.admin-form input[type="text"]').forEach((input) => {
    if (!input.id.startsWith('field_') || !input.id.toLowerCase().includes('image')) return;
    input.addEventListener('input', () => setInputValue(input.id, input.value));
  });
};

const initRichTextEditors = () => {
  let activeEditor = null;
  let savedRange = null;

  const saveSelection = () => {
    const selection = document.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    savedRange = selection.getRangeAt(0);
  };

  const restoreSelection = () => {
    const selection = document.getSelection();
    if (!selection) return;
    if (savedRange) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }
  };

  $$('.rte-editor').forEach((editor) => {
    editor.addEventListener('focus', () => {
      activeEditor = editor;
    });
    editor.addEventListener('mouseup', saveSelection);
    editor.addEventListener('keyup', saveSelection);
    editor.addEventListener('blur', saveSelection);
  });

  $$('.rte-toolbar').forEach((toolbar) => {
    toolbar.addEventListener('mousedown', (event) => {
      event.preventDefault();
    });

    toolbar.addEventListener('click', (event) => {
      const button = event.target.closest('[data-cmd]');
      if (!button || button.tagName === 'INPUT') return;
      const cmd = button.dataset.cmd;
      const targetId = toolbar.dataset.target;
      const editor = (targetId && document.getElementById(targetId)) || activeEditor;
      if (!editor) return;
      editor.focus();
      restoreSelection();
      document.execCommand(cmd, false, null);
    });

    toolbar.querySelectorAll('input[type="color"]').forEach((input) => {
      input.addEventListener('input', () => {
        const cmd = input.dataset.cmd;
        const targetId = toolbar.dataset.target;
        const editor = (targetId && document.getElementById(targetId)) || activeEditor;
        if (!editor) return;
        editor.focus();
        restoreSelection();
        const applied = document.execCommand(cmd, false, input.value);
        if (!applied && cmd === 'hiliteColor') {
          document.execCommand('backColor', false, input.value);
        }
      });
    });
  });
};

const renderCaseList = () => {
  const list = getCaseList();
  caseListNode.innerHTML = list
    .map((c) => {
      const flags = `${c.archived ? ' (Archived)' : ''}${c.locked ? ' (Locked)' : ''}`;
      return `<button class="btn ghost" type="button" data-case-id="${c.id}">${c.label}${flags}</button>`;
    })
    .join('');

  caseListNode.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => openCaseEditor(btn.dataset.caseId));
  });
};

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const createCaseStudy = (title) => {
  const cleanTitle = title.trim();
  const baseSlug = slugify(cleanTitle);
  if (!baseSlug) {
    createCaseMsg.textContent = 'Please enter a valid title.';
    return;
  }

  const list = getCaseList();
  let id = `custom-${baseSlug}`;
  let n = 2;
  while (list.some((c) => c.id === id)) {
    id = `custom-${baseSlug}-${n}`;
    n += 1;
  }

  const entry = {
    id,
    label: cleanTitle,
    path: `case-study-custom.html?case=${encodeURIComponent(id)}`,
    archived: false,
    locked: false,
  };

  list.push(entry);
  setCaseList(list);

  const store = getStore();
  store[id] = makeDefaultCaseData(cleanTitle);
  setStore(store);

  createCaseMsg.textContent = 'Case study created.';
  renderCaseList();
  openCaseEditor(id);
};

const unlockApp = () => {
  loginView.classList.add('hidden');
  adminApp.classList.remove('hidden');
  adminLogoutBtn.classList.remove('hidden');
  renderCaseList();
};

const logoutApp = () => {
  sessionStorage.removeItem(ADMIN_AUTH_KEY);
  adminApp.classList.add('hidden');
  loginView.classList.remove('hidden');
  adminLogoutBtn.classList.add('hidden');
  $('#adminPassword').value = '';
  loginError.textContent = '';
  createCaseMsg.textContent = '';
  currentCaseId = null;
  editorView.classList.add('hidden');
  editorEmpty.classList.remove('hidden');
};

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('#adminPassword');
  if (input.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_AUTH_KEY, 'true');
    unlockApp();
  } else {
    loginError.textContent = 'Incorrect password.';
  }
});

if (sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true') {
  unlockApp();
}

buildDesignEditors();
initRichTextEditors();
setupUploadControls();

$$('.tab-btn').forEach((btn) => btn.addEventListener('click', () => activateTab(btn.dataset.tab)));

createCaseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  createCaseStudy(newCaseTitle.value);
  newCaseTitle.value = '';
});

editorForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!currentCaseId) return;

  const store = getStore();
  store[currentCaseId] = collectFormData();
  const saved = setStore(store);
  if (!saved) {
    saveMessage.textContent = 'Save failed: image data is too large for browser storage. Upload smaller images.';
    return;
  }

  const newTitle = $('#field_title').value.trim();
  if (newTitle) {
    const list = getCaseList();
    const idx = list.findIndex((c) => c.id === currentCaseId);
    if (idx >= 0) {
      list[idx].label = newTitle;
      setCaseList(list);
      renderCaseList();
      editorCaseTitle.textContent = newTitle;
    }
  }

  saveMessage.textContent = 'Saved. Refresh/open the case page to view updates.';
});

resetCaseBtn.addEventListener('click', () => {
  if (!currentCaseId) return;
  const store = getStore();
  delete store[currentCaseId];
  setStore(store);
  loadCaseIntoForm(currentCaseId);
  saveMessage.textContent = 'Reset to defaults for this case.';
});

if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', logoutApp);

if (archiveCaseBtn) {
  archiveCaseBtn.addEventListener('click', () => {
    if (!currentCaseId) return;
    const list = getCaseList();
    const idx = list.findIndex((c) => c.id === currentCaseId);
    if (idx < 0) return;
    list[idx].archived = !list[idx].archived;
    setCaseList(list);
    updateCaseActionButtons(list[idx]);
    renderCaseList();
    saveMessage.textContent = list[idx].archived
      ? 'Case study archived. It will not show on homepage carousel.'
      : 'Case study unarchived. It will show on homepage carousel.';
  });
}

if (lockCaseBtn) {
  lockCaseBtn.addEventListener('click', () => {
    if (!currentCaseId) return;
    const list = getCaseList();
    const idx = list.findIndex((c) => c.id === currentCaseId);
    if (idx < 0) return;
    list[idx].locked = !list[idx].locked;
    setCaseList(list);
    updateCaseActionButtons(list[idx]);
    renderCaseList();
    saveMessage.textContent = list[idx].locked
      ? 'Case study locked. Password will be required to open it.'
      : 'Case study unlocked.';
  });
}
