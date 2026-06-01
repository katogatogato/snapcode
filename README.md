# SnapCode

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Pages](https://img.shields.io/badge/GitHub-Pages-blue?logo=github)](https://katogatogato.github.io/snapcode)

Extract clean, copy-pasteable code from screenshots — entirely in your browser.

No backend. No signup. No upload. Just paste and go.

## Features

- **Paste from clipboard** — Press `Cmd/Ctrl+V` with a screenshot on your clipboard
- **Drag & drop or file picker** — Drop an image or click to browse
- **Browser-side OCR** — Powered by [Tesseract.js](https://github.com/naptha/tesseract.js), all processing happens locally
- **Smart cleanup** — Automatically fixes common OCR artifacts, restores indentation, and cleans up formatting
- **Language detection** — Detects 20+ programming languages from syntax patterns
- **Syntax highlighting** — Beautiful code rendering via [Prism.js](https://prismjs.com/)
- **One-click copy** — Copy extracted code to your clipboard instantly
- **Download as file** — Save the extracted code with the right file extension
- **History** — Last 10 extractions saved locally with timestamps
- **Dark/light theme** — Respects your system preference, toggle manually

## Installation

### Option 1: Just open it

```bash
git clone https://github.com/katogatogato/snapcode.git
cd snapcode
npm install
npm run build
open public/index.html
```

### Option 2: Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to Settings → Pages → Source: `main` branch, `/public` folder
3. Your app is live at `https://<username>.github.io/snapcode/`

### Build

```bash
npm install
npm run build    # compiles TypeScript to dist/
npm run dev      # watch mode for development
```

## Usage

```
┌──────────────────────────────────────────────────────┐
│  📸 SnapCode                              [☀] [History] │
├──────────────────────────────────────────────────────┤
│                                                      │
│     ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐     │
│     │                                           │     │
│     │   📋 Paste screenshot or drop image here  │     │
│     │                                           │     │
│     │   Press [Cmd]+[V] to paste · Click to    │     │
│     │   browse · Drag & drop                    │     │
│     │                                           │     │
│     └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘     │
│                                                      │
│     ┌──────────────────────────────────────────┐     │
│     │ [JavaScript ▾]         [Copy] [↓] [Clear]│     │
│     ├──────────────────────────────────────────┤     │
│     │ 1 │ const greeting = "Hello, world!";    │     │
│     │ 2 │ console.log(greeting);               │     │
│     │ 3 │                                      │     │
│     └──────────────────────────────────────────┘     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

1. Take a screenshot of some code
2. Paste it with `Cmd/Ctrl+V` (or drag & drop / click to upload)
3. Wait for OCR to process (progress bar shows status)
4. Review the extracted code with syntax highlighting
5. Change the language if auto-detection was wrong
6. Copy or download the result

## How OCR Cleanup Works

Raw OCR output is noisy. SnapCode applies several cleanup passes:

1. **Smart quote conversion** — Curly quotes → straight quotes, em-dashes → hyphens
2. **Character confusion fix** — `O`↔`0`, `l`↔`1`, `S`↔`5`, `B`↔`8` in numeric contexts
3. **Operator restoration** — Rejoins split operators like `= >` → `=>`, `! =` → `!=`, `+ +` → `++`
4. **Indentation normalization** — Detects the indentation unit and normalizes mixed tabs/spaces
5. **Whitespace cleanup** — Trims trailing whitespace, collapses excessive blank lines

## Supported Language Detection

SnapCode can detect code in these languages by analyzing syntax patterns:

JavaScript, TypeScript, Python, Ruby, Go, Rust, Java, C, C++, C#, PHP, Swift, Kotlin, Scala, SQL, Bash, HTML, CSS, JSON, YAML, Markdown

If detection is uncertain, it defaults to plain text and you can manually select the language from the dropdown.

## Tech Stack

- **HTML/CSS/TypeScript** — No frameworks, no bundlers
- [Tesseract.js](https://github.com/naptha/tesseract.js) — Browser-side OCR engine
- [Prism.js](https://prismjs.com/) — Lightweight syntax highlighter
- **Clipboard API** — Native browser paste support

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch
3. Run `npm run build` to compile
4. Open a pull request

## License

[MIT](LICENSE) © katogatogato
