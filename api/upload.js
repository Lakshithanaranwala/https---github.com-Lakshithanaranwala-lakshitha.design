const DEFAULT_ASSETS_DIR = 'assets/case study images';

const parseDataUrl = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
};

const extensionForMime = (mime) => {
  if (!mime) return 'png';
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  return 'png';
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';
  const designAssetsDir = process.env.GITHUB_DESIGN_ASSETS_DIR || 'assets/design work';
  let assetsDir = process.env.GITHUB_ASSETS_DIR || DEFAULT_ASSETS_DIR;

  if (!token || !owner || !repo) {
    res.status(500).json({ error: 'Missing GitHub configuration.' });
    return;
  }

  let payload = null;
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    payload = null;
  }

  if (!payload) {
    res.status(400).json({ error: 'Invalid request body.' });
    return;
  }

  const { dataUrl, filename, target } = payload || {};
  if (target === 'design') {
    assetsDir = designAssetsDir;
  }
  const parsed = parseDataUrl(dataUrl);
  if (!parsed) {
    res.status(400).json({ error: 'Invalid data URL.' });
    return;
  }

  const ext = extensionForMime(parsed.mime);
  const baseName = (filename || `case-${Date.now()}`).replace(/[^a-z0-9-_]/gi, '-');
  const attemptNames = [`${baseName}.${ext}`, `${baseName}-${Math.random().toString(36).slice(2, 7)}.${ext}`];

  let lastError = null;
  let lastPath = '';
  for (const name of attemptNames) {
    const path = `${assetsDir}/${name}`.replace(/\/+/g, '/');
    lastPath = path;
    try {
      const safePath = path
        .split('/')
        .map((segment) => encodeURIComponent(segment))
        .join('/');
      const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${safePath}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
        },
        body: JSON.stringify({
          message: `Add asset ${name}`,
          content: parsed.base64,
          branch,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        res.status(200).json({
          url: result?.content?.download_url || '',
          path,
        });
        return;
      }

      try {
        lastError = await response.json();
      } catch {
        const text = await response.text();
        lastError = { error: text || 'Upload failed.' };
      }
      lastError = {
        status: response.status,
        statusText: response.statusText,
        details: lastError,
        context: { owner, repo, branch, path },
      };
      if (response.status === 422) {
        continue;
      }
      break;
    } catch (err) {
      lastError = { error: err?.message || 'Upload failed.' };
      break;
    }
  }

  res.status(500).json({ error: 'Upload failed.', details: lastError, context: { owner, repo, branch, path: lastPath } });
};
