Drop the built installer here. The landing page's Download button links to:

  /downloads/SnippetSpot_0.1.1_x64-setup.exe

Build it from C:\snippetshot with:

  npm run tauri build

The installer appears at:
  C:\snippetshot\src-tauri\target\release\bundle\nsis\SnippetSpot_0.1.1_x64-setup.exe

Keep the file name in sync with the URL in:
  - public/index.html (Download button)
  - netlify/functions/latest-release.json (updater manifest URL)
