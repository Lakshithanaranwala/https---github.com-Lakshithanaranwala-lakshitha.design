const DEFAULT_DATA_PATH = 'data/design-work.json';

const getConfig = () => ({
  token: process.env.GITHUB_TOKEN,
  owner: process.env.GITHUB_OWNER,
  repo: process.env.GITHUB_REPO,
  branch: process.env.GITHUB_BRANCH || 'main',
  dataPath: process.env.GITHUB_DESIGN_PATH || DEFAULT_DATA_PATH,
});

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
  const { token, owner, repo, branch, dataPath } = getConfig();
  if (!token || !owner || !repo) {
    res.status(500).json({ error: 'Missing GitHub configuration.' });
    return;
  }

  const path = dataPath.replace(/\/+/g, '/');
  const safePath = safeJoinPath(path);
  const baseUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${safePath}`;

  if (req.method === 'GET') {
    try {
      const response = await githubRequest(baseUrl, { token, method: 'GET' });
      if (response.status === 404) {
        res.status(200).json({ items: [] });
        return;
      }
      const payload = await response.json();
      if (!response.ok) {
        res.status(500).json({ error: 'Load failed.', details: payload });
        return;
      }
      const decoded = Buffer.from(payload.content || '', 'base64').toString('utf8');
      const parsed = decoded ? JSON.parse(decoded) : { items: [] };
      res.status(200).json(parsed);
      return;
    } catch (err) {
      res.status(500).json({ error: 'Load failed.', details: err?.message || 'Unknown error' });
      return;
    }
  }

  if (req.method === 'POST') {
    let body = null;
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch {
      body = null;
    }

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid payload.' });
      return;
    }

    let sha = null;
    try {
      const getResponse = await githubRequest(baseUrl, { token, method: 'GET' });
      if (getResponse.ok) {
        const getPayload = await getResponse.json();
        sha = getPayload.sha || null;
      }
    } catch {
      sha = null;
    }

    const content = Buffer.from(JSON.stringify(body, null, 2)).toString('base64');
    try {
      const putResponse = await githubRequest(baseUrl, {
        token,
        method: 'PUT',
        body: JSON.stringify({
          message: 'Update design work data',
          content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      });
      const putPayload = await putResponse.json();
      if (!putResponse.ok) {
        res.status(500).json({ error: 'Save failed.', details: putPayload });
        return;
      }
      res.status(200).json({ ok: true, path });
      return;
    } catch (err) {
      res.status(500).json({ error: 'Save failed.', details: err?.message || 'Unknown error' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
