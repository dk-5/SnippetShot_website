# SnippetSpot — Session Context (as of 2026-08-08)

Handoff notes for the next working session. Two codebases:

| Path | What it is |
| --- | --- |
| `C:\snippetshot` | The Tauri 2 desktop app (Rust + React). Git repo. |
| `C:\snippetshot-netlify` | This project — marketing site + Netlify Functions. Not yet a git repo. |

---

## 1. The app — what's shipped

SnippetSpot is a Windows-only, local-first search bar (Alt+Space) for apps, snippets
and vault credentials. Stack: Tauri 2 (Rust), React 19 + TypeScript, Tailwind v4, Vite,
SQLite (`tauri-plugin-sql`).

Core features (v1 + v2):
- Fuzzy snippet search (`@leeoniya/ufuzzy`) with favorites/usage ranking, paste
  via `SendInput` (clipboard-save mode or keystroke type mode).
- Secure vault (credentials + API keys) encrypted with Windows DPAPI.
- Clipboard history watcher with secret/self-write filtering.
- Automatic timestamped backups, import/export (JSON/CSV/Markdown).
- Global hotkey via a `WH_KEYBOARD_LL` hook, acrylic popup, tray.

## 2. Licensing work (Phase 1 + Phase 2 — just completed & tested)

A 14-day trial plus offline Ed25519-signed license keys. No payment services —
those come in Phase 3 (Stripe).

### How it works
- `src-tauri\src\license.rs` — trial timer, key verification, status, gating.
- Key format: `SS1-` + base64url(no padding) of `64-byte Ed25519 signature || payload JSON`.
  Payload: `{"email","tier","issuedAt","expiresAt"}` (camelCase). Signature is
  over the payload bytes only.
- Public key is embedded as `LICENSE_PUBLIC_KEY` in `license.rs`.
- Gating: `license::ensure_allowed(&app)` is called by paste, vault, clipboard
  and app-launch commands; returns `Err` when trial expired and not licensed.
- Commands: `get_license_status`, `try_activate(key)`, `deactivate_license`.
- `trial_status()` returns `licensed` (valid stored key) / `expired` (stored key
  present but invalid/lapsed) / `trial`.

### Dev tooling — `C:\snippetshot\scripts\keygen.mjs`
```sh
node scripts/keygen.mjs gen                         # create keypair (dev-only)
node scripts/keygen.mjs issue buyer@email.com --permanent
node scripts/keygen.mjs issue buyer@email.com --days 365
node scripts/keygen.mjs check <key>                 # verify vs embedded pubkey
```
- Private key + seed live in `C:\snippetshot\scripts\license-keys\` — **gitignored**,
  never shipped. If lost, new keypairs are unusable for old keys.
- Public key hex already pasted into `license.rs`.
- Node writes: `private.pem`, `private.seed`, `public.hex`.

### Frontend
- Manager → Settings → License panel: shows Licensed (email + expiry) with
  Deactivate, or trial/expired status with a key input + Activate.
- Popup locked screen (when trial ended): inline key input + Activate + Manage.
- **Staleness fix (important):** both windows now re-check the license on every
  show/focus — popup re-fetches in its `onPopupShown` handler, manager re-fetches
  in a `getCurrentWindow().onFocusChanged` listener. Do not regress this.

### Testing / build state (all green)
- `cargo test` → 35 passed (incl. 6 license tests; the E2E test verifies the
  embedded public key against the dev private seed).
- `cargo check` clean. `npm run build` clean. `vitest run` → 69 passed.
- NSIS installer builds at
  `C:\snippetshot\src-tauri\target\release\bundle\nsis\SnippetSpot_0.1.1_x64-setup.exe`.
- App version is **0.1.1** everywhere except `package.json` (still `0.1.0` — bump
  on next release).

## 3. Gotchas / caveats

- **Settings store overrides manual edits.** `settings.json` lives in
  `%APPDATA%\com.snippetspot.app\`. It is read into memory at startup and
  written back on save/exit. To hand-edit (e.g. force trial expiry for testing),
  fully quit the app (kill `snippetspot.exe`) first.
- **Updater signing.** `tauri.conf.json` has `createUpdaterArtifacts: true` and a
  Netlify endpoint. The private updater key `src-tauri\snippetspot.key` is
  password-protected — we do not have the password. For unsigned test builds we
  temporarily set `createUpdaterArtifacts: false`, build, then revert. A real
  release needs the password (or a new keypair + updated `pubkey` in config).
- **Netlify is not deployed yet.** The app pings
  `https://snippetshot.netlify.app/.netlify/functions/register` on launch
  (fails silently). Updater endpoint `https://snippetshot.netlify.app/latest.json`
  is also not live. No `netlify/` project existed until this session.
- **Registration ping = minimal telemetry** (install_id, version, licensed) that
  the app sends on startup; it contradicts the "no telemetry" marketing claim.
  Decision pending: keep, remove, or keep but anonymize.

## 4. The Netlify project (this directory)

- `netlify.toml` — publish `public/`, functions `netlify/functions/`, and a
  redirect `/latest.json` → the `latest` function.
- `public\index.html` — dark single-page landing (Tailwind CDN), brand accent
  `#7c7cf0`, Download button → `/downloads/SnippetSpot_0.1.1_x64-setup.exe`.
- `public\downloads\` — empty; drop the built installer here before deploy.
- `netlify\functions\register.mjs` — receives `{install_id, version, licensed}`
  and upserts a record per install into Netlify Blobs (`registrations` store).
- `netlify\functions\latest.mjs` — serves `latest-release.json` (Tauri updater
  v1 manifest). Update that file on each release; `signature` is empty until we
  can sign.
- **Not yet deployed.** Steps: `npm install`, `npx netlify deploy --prod`,
  enable Netlify Blobs, upload installer, fill signature.

## 5. Roadmap

- **Phase 3 (later):** Stripe purchase → on payment, issue a signed key for the
  buyer's email and email it (new function, e.g. `issue-key`); optionally an
  in-app "Buy" button. The app needs no changes — it only verifies keys offline.
- **Deploy Netlify**, upload installer, make `latest.json` real.
- Decide fate of the registration ping (telemetry stance).
- Bump `package.json` version to match 0.1.1.
- Git: nothing has been committed in `C:\snippetshot` for the license work yet
  (user plans to commit later).
