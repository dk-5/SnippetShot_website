Drop the built installer here. The landing page's Download button links to:

  /downloads/SnippetSpot_0.1.4_x64-setup.exe

Build it from C:\snippetshot with:

  npm run tauri build

The installer appears at:
  C:\snippetshot\src-tauri\target\release\bundle\nsis\SnippetSpot_0.1.4_x64-setup.exe

Keep the file name in sync with the URL in:
  - public/index.html (Download button)
  - netlify/functions/latest-release.json (updater manifest URL)

The updater signature goes into latest-release.json's "signature" field
(base64 content of the .sig file next to the installer).
