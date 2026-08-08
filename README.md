# SnippetSpot Netlify site

Marketing site + serverless backend for the SnippetSpot Windows app.

## Layout

```
C:\snippetshot-netlify\
├── netlify.toml               # publish dir, functions dir, /latest.json redirect
├── public\
│   ├── index.html             # Landing page (Tailwind CDN, no build step)
│   ├── favicon.svg
│   └── downloads\             # Put built installers here
│       └── README.txt
└── netlify\functions\
    ├── register.mjs           # Receives the app's install ping -> Netlify Blobs
    ├── latest.mjs             # Serves the updater manifest (tauri-plugin-updater)
    └── latest-release.json    # Manifest data — update on every release
```

## Local development

```sh
npm install
npx netlify dev
```

- Site: http://localhost:8888
- Functions:
  - POST http://localhost:8888/.netlify/functions/register
  - GET  http://localhost:8888/latest.json (redirect to the `latest` function)

## Deploy

```sh
npx netlify deploy --prod
```

Requires the `@netlify/blobs` dependency (already in package.json) and
Blobs enabled on the site for `register` to persist.

## Releasing a new app version

1. Build the installer: `npm run tauri build` in `C:\snippetshot`.
2. Copy `SnippetSpot_<version>_x64-setup.exe` into `public\downloads\`.
3. Update `netlify\functions\latest-release.json`:
   - `version`, `notes`, `pub_date`
   - `platforms.windows-x86_64.url` to the new file
   - `platforms.windows-x86_64.signature` to the minisign signature from the
     updater build (from `tauri build` when `createUpdaterArtifacts` is on,
     or `tauri signer sign`).
4. Deploy.
