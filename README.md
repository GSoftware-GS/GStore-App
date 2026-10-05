# GStore-App

A small hub of browser tools built with plain HTML, CSS and JavaScript. No framework and no build step. Each tool is a single page that does its work in the browser, so the files you open are not uploaded anywhere.

## Tools

| Folder | Tool | What it does |
| --- | --- | --- |
| `Programa_1` | Color Palette Extractor | Pulls a colour palette out of an image |
| `Programa_2` | CSS Gradient Generator | Builds a CSS gradient visually and copies the code |
| `Programa_3` | Markdown Live Previewer | Renders Markdown as you type |
| `Programa_4` | QR Code Generator | Lives in its own repo: [SnapQR](https://github.com/GSoftware-GS/SnapQR) |
| `Programa_5` | Password Generator | Generates passwords locally with `crypto.getRandomValues` |
| `Programa_6` | Pomodoro Focus Timer | Timer with a task list and basic stats |
| `Programa_7` | JSON Formatter | Parses and formats JSON |
| `Programa_8` | PDF Merger and Editor | Merges PDFs and adds watermarks |
| `Programa_9` | Image Text Extractor | Reads text from images with Tesseract.js |

The root `index.html` is the hub page that links to every tool.

## Run it locally

The hub loads its script as an ES module, so it needs a local server. Opening the file directly will not work.

```bash
git clone https://github.com/GSoftware-GS/GStore-App.git
cd GStore-App
python -m http.server 8000
```

Then open `http://localhost:8000`.

## What talks to the network

Your files stay in the page. These are the only requests the project makes:

- Fonts from Google Fonts on every page.
- `marked`, `pdf-lib` and `Tesseract.js` from a CDN in the Markdown, PDF and text extractor tools.
- An alarm sound from Mixkit in the Pomodoro timer.
- The hub keeps one public vote counter per tool in Firebase Realtime Database with anonymous sign-in. If Firebase is not available it falls back to `localStorage`.

## Known gaps

- `Programa_4` is a git link without a `.gitmodules` file, so the folder is empty after cloning. Use the SnapQR repo instead.
- Folder names are generic. Renaming them to match each tool is pending.
- No license file yet.

## Author

[gsdeveloper](https://github.com/GSoftware-GS)
