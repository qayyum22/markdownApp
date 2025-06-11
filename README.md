# MarkdownApp

MarkdownApp is a minimal Electron Markdown editor built with React, Vite and TailwindCSS.

## Development

Install dependencies and run the application:

```bash
npm install
npm start
```

## Building

Generate production packages for all platforms:

```bash
npm run build
```

## Features

- Live Markdown preview powered by `react-markdown` and `remark-gfm`
- Auto-save to the user data folder
- Recent file tracking
- Light/Dark theme toggle
- Splash screen on startup
- Upload `.md` files via drag-and-drop or by clicking the upload area in the editor panel

## Opening Markdown Files

1. Click the **Open File** button in the header and choose any `.md` file.
2. Alternatively, drag and drop a Markdown file onto the window to open it.

The editor automatically saves your work and keeps a list of recent files for quick access.

