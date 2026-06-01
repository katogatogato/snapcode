/// <reference path="storage.ts" />
/// <reference path="detector.ts" />
/// <reference path="cleanup.ts" />
/// <reference path="ocr.ts" />

declare const Prism: {
  highlight: (code: string, grammar: unknown, lang: string) => string;
  languages: Record<string, unknown>;
};

// ============================================================
// App
// ============================================================

const THEME_KEY = "snapcode_theme";

interface AppState {
  currentCode: string;
  currentLanguage: LanguageId;
  isProcessing: boolean;
  history: HistoryEntry[];
  historyOpen: boolean;
}

const state: AppState = {
  currentCode: "",
  currentLanguage: "plaintext",
  isProcessing: false,
  history: loadHistory(),
  historyOpen: false,
};

function qs(selector: string): HTMLElement {
  return document.querySelector(selector) as HTMLElement;
}

function getDropZone(): HTMLElement {
  return qs("#drop-zone");
}
function getProgressBar(): HTMLElement {
  return qs("#progress-bar");
}
function getProgressLabel(): HTMLElement {
  return qs("#progress-label");
}
function getProgressContainer(): HTMLElement {
  return qs("#progress-container");
}
function getResultSection(): HTMLElement {
  return qs("#result-section");
}
function getCodeDisplay(): HTMLElement {
  return qs("#code-display");
}
function getLanguageSelect(): HTMLSelectElement {
  return qs("#language-select") as HTMLSelectElement;
}
function getCopyBtn(): HTMLButtonElement {
  return qs("#copy-btn") as HTMLButtonElement;
}
function getDownloadBtn(): HTMLButtonElement {
  return qs("#download-btn") as HTMLButtonElement;
}
function getClearBtn(): HTMLButtonElement {
  return qs("#clear-btn") as HTMLButtonElement;
}
function getHistoryToggle(): HTMLButtonElement {
  return qs("#history-toggle") as HTMLButtonElement;
}
function getHistoryPanel(): HTMLElement {
  return qs("#history-panel");
}
function getHistoryList(): HTMLElement {
  return qs("#history-list");
}
function getThemeToggle(): HTMLButtonElement {
  return qs("#theme-toggle") as HTMLButtonElement;
}
function getPreviewImg(): HTMLImageElement {
  return qs("#preview-img") as HTMLImageElement;
}
function getPreviewContainer(): HTMLElement {
  return qs("#preview-container");
}

function init(): void {
  initTheme();
  populateLanguageSelect();
  bindEvents();
  renderHistory();
}

function initTheme(): void {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light") {
    document.documentElement.setAttribute("data-theme", "light");
  } else if (stored === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    document.documentElement.setAttribute("data-theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
  }
  updateThemeIcon();
}

function toggleTheme(): void {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(THEME_KEY, next);
  updateThemeIcon();
}

function updateThemeIcon(): void {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const btn = getThemeToggle();
  btn.textContent = isDark ? "\u2600" : "\u263E";
  btn.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );
}

function populateLanguageSelect(): void {
  const select = getLanguageSelect();
  for (const lang of LANGUAGES) {
    const opt = document.createElement("option");
    opt.value = lang.id;
    opt.textContent = lang.name;
    select.appendChild(opt);
  }
  select.value = "plaintext";
}

function bindEvents(): void {
  getThemeToggle().addEventListener("click", toggleTheme);

  document.addEventListener("paste", handlePaste);

  const dz = getDropZone();
  dz.addEventListener("dragover", (e) => {
    e.preventDefault();
    dz.classList.add("drag-over");
  });
  dz.addEventListener("dragleave", () => {
    dz.classList.remove("drag-over");
  });
  dz.addEventListener("drop", handleDrop);

  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";
  fileInput.style.display = "none";
  document.body.appendChild(fileInput);
  dz.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    if (fileInput.files && fileInput.files[0]) {
      processImage(fileInput.files[0]);
    }
    fileInput.value = "";
  });

  getLanguageSelect().addEventListener("change", () => {
    state.currentLanguage = getLanguageSelect().value as LanguageId;
    renderCode();
  });

  getCopyBtn().addEventListener("click", handleCopy);
  getDownloadBtn().addEventListener("click", handleDownload);
  getClearBtn().addEventListener("click", handleClear);
  getHistoryToggle().addEventListener("click", toggleHistoryPanel);

  qs("#clear-history-btn").addEventListener("click", () => {
    clearAllHistory();
    state.history = [];
    renderHistory();
  });
}

function handlePaste(e: ClipboardEvent): void {
  if (state.isProcessing) return;
  const items = e.clipboardData?.items;
  if (!items) return;

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.startsWith("image/")) {
      e.preventDefault();
      const file = items[i].getAsFile();
      if (file) processImage(file);
      return;
    }
  }
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  getDropZone().classList.remove("drag-over");

  if (state.isProcessing) return;

  const file = e.dataTransfer?.files[0];
  if (file && file.type.startsWith("image/")) {
    processImage(file);
  }
}

async function processImage(file: File | Blob): Promise<void> {
  state.isProcessing = true;
  showProgress(true);
  updateProgress(0, "Starting OCR...");

  const url = URL.createObjectURL(file);
  getPreviewImg().src = url;
  getPreviewContainer().style.display = "block";

  try {
    const result = await extractText(file, (pct, status) => {
      updateProgress(pct, status);
    });

    updateProgress(95, "Cleaning up...");

    const cleaned = cleanupCode(result.text);
    const detected = detectLanguage(cleaned);

    state.currentCode = cleaned;
    state.currentLanguage = detected.id;
    getLanguageSelect().value = detected.id;

    addEntry(cleaned, detected.id);
    state.history = loadHistory();

    showProgress(false);
    renderCode();
    renderHistory();
    getResultSection().style.display = "block";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    updateProgress(0, `Error: ${message}`);
    setTimeout(() => showProgress(false), 3000);
  } finally {
    state.isProcessing = false;
  }
}

function showProgress(show: boolean): void {
  getProgressContainer().style.display = show ? "block" : "none";
}

function updateProgress(pct: number, status: string): void {
  getProgressBar().style.width = `${pct}%`;
  getProgressLabel().textContent = status;
}

function renderCode(): void {
  if (!state.currentCode) return;

  const lang = findLanguageById(state.currentLanguage);
  let highlighted: string;

  if (lang.prismId !== "plaintext" && Prism.languages[lang.prismId]) {
    highlighted = Prism.highlight(
      state.currentCode,
      Prism.languages[lang.prismId],
      lang.prismId
    );
  } else {
    highlighted = escapeHtml(state.currentCode);
  }

  const lines = state.currentCode.split("\n");
  const lineNumbers = lines.map((_, i) => i + 1).join("\n");

  const display = getCodeDisplay();
  display.innerHTML = "";

  const lineNumsEl = document.createElement("pre");
  lineNumsEl.className = "line-numbers";
  lineNumsEl.setAttribute("aria-hidden", "true");
  lineNumsEl.textContent = lineNumbers;

  const codeEl = document.createElement("code");
  codeEl.className = `language-${lang.prismId}`;
  codeEl.innerHTML = highlighted;

  display.appendChild(lineNumsEl);
  display.appendChild(codeEl);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function handleCopy(): Promise<void> {
  if (!state.currentCode) return;

  const btn = getCopyBtn();
  try {
    await navigator.clipboard.writeText(state.currentCode);
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = state.currentCode;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    btn.textContent = "Copied!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Copy";
      btn.classList.remove("copied");
    }, 2000);
  }
}

function handleDownload(): void {
  if (!state.currentCode) return;

  const lang = findLanguageById(state.currentLanguage);
  const extensions: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    ruby: "rb",
    go: "go",
    rust: "rs",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    scala: "scala",
    html: "html",
    css: "css",
    sql: "sql",
    bash: "sh",
    json: "json",
    yaml: "yml",
    markdown: "md",
    plaintext: "txt",
  };

  const ext = extensions[lang.id] || "txt";
  const blob = new Blob([state.currentCode], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `snapcode-${Date.now()}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleClear(): void {
  state.currentCode = "";
  state.currentLanguage = "plaintext";
  getLanguageSelect().value = "plaintext";
  getCodeDisplay().innerHTML = "";
  getResultSection().style.display = "none";
  getPreviewContainer().style.display = "none";
  URL.revokeObjectURL(getPreviewImg().src);
  getPreviewImg().src = "";
}

function toggleHistoryPanel(): void {
  state.historyOpen = !state.historyOpen;
  const panel = getHistoryPanel();
  if (state.historyOpen) {
    panel.classList.add("open");
  } else {
    panel.classList.remove("open");
  }
}

function renderHistory(): void {
  const list = getHistoryList();
  list.innerHTML = "";

  if (state.history.length === 0) {
    list.innerHTML = '<div class="history-empty">No extractions yet</div>';
    return;
  }

  for (const entry of state.history) {
    const item = document.createElement("div");
    item.className = "history-item";

    const info = document.createElement("div");
    info.className = "history-item-info";

    const time = document.createElement("span");
    time.className = "history-time";
    time.textContent = formatTime(entry.timestamp);

    const preview = document.createElement("span");
    preview.className = "history-preview";
    preview.textContent = entry.preview;

    const langLabel = document.createElement("span");
    langLabel.className = "history-lang";
    const langInfo = findLanguageById(entry.language as LanguageId);
    langLabel.textContent = langInfo.name;

    info.appendChild(time);
    info.appendChild(langLabel);
    info.appendChild(preview);

    const actions = document.createElement("div");
    actions.className = "history-actions";

    const loadBtn = document.createElement("button");
    loadBtn.className = "history-load-btn";
    loadBtn.textContent = "Load";
    loadBtn.addEventListener("click", () => loadFromHistory(entry));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "history-delete-btn";
    deleteBtn.textContent = "\u2715";
    deleteBtn.setAttribute("aria-label", "Remove from history");
    deleteBtn.addEventListener("click", () => {
      removeEntry(entry.id);
      state.history = loadHistory();
      renderHistory();
    });

    actions.appendChild(loadBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(info);
    item.appendChild(actions);
    list.appendChild(item);
  }
}

function loadFromHistory(entry: HistoryEntry): void {
  state.currentCode = entry.code;
  state.currentLanguage = entry.language as LanguageId;
  getLanguageSelect().value = entry.language;
  renderCode();
  getResultSection().style.display = "block";
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return d.toLocaleDateString();
}

document.addEventListener("DOMContentLoaded", init);
