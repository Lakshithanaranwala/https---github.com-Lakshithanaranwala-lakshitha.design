# UI/UX Portfolio Site

Simple, mobile-responsive portfolio template with:
- Hero section
- Case studies
- Process overview
- About section
- CV download/view buttons
- Contact section

## Files
- `index.html` - content and sections
- `styles.css` - visual system and responsive layout
- `script.js` - mobile nav + reveal animations
- `assets/cv.pdf` - placeholder CV (replace with your actual PDF)

## Customize quickly
1. Replace placeholder text and metrics in `index.html`.
2. Update email link in `index.html` (`mailto:youremail@example.com`).
3. Replace `assets/cv.pdf` with your real CV file (keep filename same).
4. Add links for each "Read Full Case Study" CTA.

## Admin
- Admin password: `Lakshitha123@`
- Case lock password: `LakshithaCS`

### GitHub uploads (Vercel)
To upload images from the CMS into your GitHub repo `assets/` folder, deploy on Vercel and set these env vars:
- `GITHUB_TOKEN` (fine-grained token with `Contents: read/write` on the repo)
- `GITHUB_OWNER` (repo owner)
- `GITHUB_REPO` (repo name)
- `GITHUB_BRANCH` (optional, default `main`)
- `GITHUB_ASSETS_DIR` (optional, default `assets/case study images`)

The CMS calls `/api/upload` and stores the returned GitHub URL. If the API is not configured, it falls back to storing a data URL locally.
