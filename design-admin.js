const ADMIN_AUTH_KEY = 'caseStudyAdminUnlocked';
const DESIGN_STORAGE_KEY = 'designWorkDataV1';
const DESIGN_DATA_ENDPOINT = '/api/design-data';

const $ = (sel) => document.querySelector(sel);

const designUploadForm = $('#designUploadForm');
const designTitle = $('#designTitle');
const designImageUrl = $('#designImageUrl');
const designImageFile = $('#designImageFile');
const designPreview = $('#designPreview');
const designStatus = $('#designStatus');
const designGrid = $('#designGrid');
const designClearBtn = $('#designClearBtn');
const designBackBtn = $('#designBackBtn');
const designLogoutBtn = $('#designLogoutBtn');

const getLocalDesignData = () => {
  try {
    const raw = localStorage.getItem(DESIGN_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch {
    return { items: [] };
  }
};

const setLocalDesignData = (data) => {
  localStorage.setItem(DESIGN_STORAGE_KEY, JSON.stringify(data));
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
      const maxW = 1800;
      const maxH = 1800;
      let { width, height } = img;
      const ratio = Math.min(maxW / width, maxH / height, 1);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.84));
    };
    img.onerror = () => resolve(source);
    img.src = source;
  });
};

const uploadImageToGitHub = async (file, dataUrl) => {
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: file?.name || 'design-image',
        dataUrl,
        target: 'design',
      }),
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const err = payload?.error || `Upload failed (${response.status}).`;
      return { url: null, error: err, details: payload?.details };
    }
    return { url: payload?.url || null, error: null };
  } catch (err) {
    return { url: null, error: err?.message || 'Upload failed.' };
  }
};

const saveDesignDataRemote = async (data) => {
  try {
    const response = await fetch(DESIGN_DATA_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      return { ok: false, error: details?.error || 'Remote save failed.' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || 'Remote save failed.' };
  }
};

const loadDesignDataRemote = async () => {
  try {
    const response = await fetch(DESIGN_DATA_ENDPOINT, { method: 'GET' });
    if (!response.ok) return false;
    const payload = await response.json();
    if (payload?.items) {
      setLocalDesignData(payload);
    }
    return true;
  } catch {
    return false;
  }
};

const renderDesignGrid = () => {
  const data = getLocalDesignData();
  const items = data.items || [];
  if (!items.length) {
    designGrid.innerHTML = '<p class="admin-note">No design work uploaded yet.</p>';
    return;
  }
  designGrid.innerHTML = items
    .map(
      (item, index) => `
        <div class="design-card">
          <img src="${item.src}" alt="${item.label || 'Design work'}" />
          <p class="admin-note" style="margin-top:0.4rem;">${item.label || 'Design work'}</p>
          <button class="btn ghost" type="button" data-index="${index}">Remove</button>
        </div>
      `
    )
    .join('');

  designGrid.querySelectorAll('button[data-index]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const idx = Number(btn.dataset.index);
      const data = getLocalDesignData();
      data.items.splice(idx, 1);
      setLocalDesignData(data);
      renderDesignGrid();
      const result = await saveDesignDataRemote(data);
      if (designStatus) {
        designStatus.textContent = result.ok ? 'Removed and synced.' : `Removed locally. ${result.error}`;
      }
    });
  });
};

const resetPreview = () => {
  designImageUrl.value = '';
  designImageFile.value = '';
  designPreview.removeAttribute('src');
};

if (designImageUrl) {
  designImageUrl.addEventListener('input', () => {
    if (designImageUrl.value) {
      designPreview.src = designImageUrl.value;
    }
  });
}

if (designClearBtn) {
  designClearBtn.addEventListener('click', () => resetPreview());
}

if (designBackBtn) {
  designBackBtn.addEventListener('click', () => {
    window.location.href = 'admin.html';
  });
}

if (designLogoutBtn) {
  designLogoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    window.location.href = 'admin.html';
  });
}

if (designUploadForm) {
  designUploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (designStatus) designStatus.textContent = 'Uploading...';
    const label = designTitle.value.trim();
    let src = designImageUrl.value.trim();

    if (!src && designImageFile.files?.[0]) {
      const file = designImageFile.files[0];
      const dataUrl = await compressImageFile(file);
      const result = await uploadImageToGitHub(file, dataUrl);
      if (result?.url) {
        src = result.url;
      } else {
        src = dataUrl;
        if (designStatus) {
          designStatus.textContent = `Upload failed. ${result?.error || ''} Using local image.`;
        }
      }
    }

    if (!src) {
      if (designStatus) designStatus.textContent = 'Please provide an image URL or upload a file.';
      return;
    }

    const data = getLocalDesignData();
    data.items = data.items || [];
    data.items.unshift({ src, label });
    setLocalDesignData(data);
    renderDesignGrid();
    resetPreview();
    designTitle.value = '';
    if (designStatus) designStatus.textContent = 'Saved locally. Syncing...';
    const syncResult = await saveDesignDataRemote(data);
    if (designStatus) {
      designStatus.textContent = syncResult.ok ? 'Saved and synced to GitHub.' : `Saved locally. ${syncResult.error}`;
    }
  });
}

const initDesignAdmin = async () => {
  if (sessionStorage.getItem(ADMIN_AUTH_KEY) !== 'true') {
    window.location.href = 'admin.html';
    return;
  }
  await loadDesignDataRemote();
  renderDesignGrid();
};

initDesignAdmin();
