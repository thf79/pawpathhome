# PawPath Home

Original English-language static website for positive, at-home basic training with small and medium dogs.

## Preview locally

```powershell
npm run preview
```

Then open `http://localhost:4173`.

## Rebuild generated pages

```powershell
npm run build
npm run check
```

The generated HTML lives in the project root and inside `guides/`. Edit content and templates in `scripts/`, styles in `src/styles/`, browser behavior in `src/scripts/`, and assets in `src/assets/`.

## Before publishing

1. The live GitHub Pages URL is configured as `https://thf79.github.io/pawpathhome/` in `scripts/site-data.mjs` and `public/robots.txt`. Update both if the repository path or custom domain changes.
2. Review the privacy page against the final hosting, analytics, and form setup.
3. Have the educational copy reviewed by a qualified force-free dog trainer or veterinarian if it will be presented as professional advice.

## Architecture

- Fully static HTML, CSS, and browser JavaScript.
- No backend, database, API, CMS, server-side authentication, or newsletter integration.
- No build dependency is required to host the generated files.
- Browser-only interactions use localStorage for optional training-plan progress.
- The local Node server in scripts/serve.mjs is for preview only and is not needed in production.

## Account policy

The website intentionally has no login, registration, user account, database, or newsletter form. Training-plan progress is stored only in the visitor's browser via localStorage.



