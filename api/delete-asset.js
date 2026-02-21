const DEFAULT_BRANCH = 'main';

const safeJoinPath = (path) =>
  path
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

const githubRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${options.token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  return response;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || DEFAULT_BRANCH;
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

  const path = payload?.path;
  if (!path) {
    res.status(400).json({ error: 'Missing path.' });
    return;
  }

  const safePath = safeJoinPath(path.replace(/\/+/g, '/'));
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${safePath}`;

  try {
    const getResponse = await githubRequest(baseUrl, { token, method: 'GET' });
    if (getResponse.status === 404) {
      res.status(200).json({ ok: true, message: 'File already missing.' });
      return;
    }
    const getPayload = await getResponse.json();
    if (!getResponse.ok) {
      res.status(500).json({ error: 'Lookup failed.', details: getPayload });
      return;
    }

    const sha = getPayload.sha;
    const deleteResponse = await githubRequest(baseUrl, {
      token,
      method: 'DELETE',
      body: JSON.stringify({
        message: `Remove asset ${path}`,
        sha,
        branch,
      }),
    });
    const deletePayload = await deleteResponse.json();
    if (!deleteResponse.ok) {
      res.status(500).json({ error: 'Delete failed.', details: deletePayload });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Delete failed.', details: err?.message || 'Unknown error' });
  }
};
