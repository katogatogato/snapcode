type LanguageId =
  | "javascript"
  | "typescript"
  | "python"
  | "ruby"
  | "go"
  | "rust"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "php"
  | "swift"
  | "kotlin"
  | "scala"
  | "html"
  | "css"
  | "sql"
  | "bash"
  | "json"
  | "yaml"
  | "markdown"
  | "plaintext";

interface LanguageInfo {
  id: LanguageId;
  name: string;
  prismId: string;
}

const PLAINTEXT_LANG: LanguageInfo = {
  id: "plaintext",
  name: "Plain Text",
  prismId: "plaintext",
};

const LANGUAGES: LanguageInfo[] = [
  { id: "javascript", name: "JavaScript", prismId: "javascript" },
  { id: "typescript", name: "TypeScript", prismId: "typescript" },
  { id: "python", name: "Python", prismId: "python" },
  { id: "ruby", name: "Ruby", prismId: "ruby" },
  { id: "go", name: "Go", prismId: "go" },
  { id: "rust", name: "Rust", prismId: "rust" },
  { id: "java", name: "Java", prismId: "java" },
  { id: "c", name: "C", prismId: "c" },
  { id: "cpp", name: "C++", prismId: "cpp" },
  { id: "csharp", name: "C#", prismId: "csharp" },
  { id: "php", name: "PHP", prismId: "php" },
  { id: "swift", name: "Swift", prismId: "swift" },
  { id: "kotlin", name: "Kotlin", prismId: "kotlin" },
  { id: "scala", name: "Scala", prismId: "scala" },
  { id: "html", name: "HTML", prismId: "markup" },
  { id: "css", name: "CSS", prismId: "css" },
  { id: "sql", name: "SQL", prismId: "sql" },
  { id: "bash", name: "Bash", prismId: "bash" },
  { id: "json", name: "JSON", prismId: "json" },
  { id: "yaml", name: "YAML", prismId: "yaml" },
  { id: "markdown", name: "Markdown", prismId: "markdown" },
  PLAINTEXT_LANG,
];

function findLanguageById(id: string): LanguageInfo {
  for (const lang of LANGUAGES) {
    if (lang.id === id) return lang;
  }
  return PLAINTEXT_LANG;
}

interface PatternRule {
  language: LanguageId;
  patterns: RegExp[];
}

const DETECTION_RULES: PatternRule[] = [
  {
    language: "python",
    patterns: [
      /\bdef\s+\w+\s*\(/,
      /\bimport\s+\w+\s*$/,
      /\bfrom\s+\w+\s+import\b/,
      /\bclass\s+\w+.*:/,
      /\bif\s+__name__\s*==\s*['"]__main__['"]/,
      /\bprint\s*\(/,
      /\bself\.\w+/,
      /\belif\b/,
      /^\s*@\w+/m,
    ],
  },
  {
    language: "javascript",
    patterns: [
      /\b(const|let|var)\s+\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /\brequire\s*\(\s*['"]/,
      /\bmodule\.exports\b/,
      /=>\s*\{/,
      /\bconsole\.log\b/,
      /\basync\s+function\b/,
      /\bdocument\.\w+/,
    ],
  },
  {
    language: "typescript",
    patterns: [
      /:\s*(string|number|boolean|void|any|unknown|never)\b/,
      /\binterface\s+\w+/,
      /\btype\s+\w+\s*=/,
      /<\w+>/,
      /\bas\s+\w+/,
      /\bimport\s+.*\s+from\s+['"]/,
    ],
  },
  {
    language: "ruby",
    patterns: [
      /\bdef\s+\w+/,
      /\brequire\s+['"]/,
      /\bclass\s+\w+\s*</,
      /\battr_(accessor|reader|writer)\b/,
      /\bputs\s+/,
      /\bdo\s*\|/,
      /\bend\b/,
    ],
  },
  {
    language: "go",
    patterns: [
      /\bfunc\s+\w+\s*\(/,
      /\bpackage\s+\w+/,
      /\bimport\s+\(/,
      /\bfmt\.Print/,
      /\b:=\s*/,
      /\bgo\s+\w+\(/,
      /\bchan\s+/,
    ],
  },
  {
    language: "rust",
    patterns: [
      /\bfn\s+\w+\s*\(/,
      /\blet\s+mut\s+/,
      /\bimpl\s+\w+/,
      /\buse\s+\w+::/,
      /\bpub\s+fn\b/,
      /\bmatch\s+\w+\s*\{/,
      /\bOption</,
      /\bResult</,
    ],
  },
  {
    language: "java",
    patterns: [
      /\bpublic\s+class\s+\w+/,
      /\bSystem\.out\.print/,
      /\bprivate\s+\w+\s+\w+/,
      /\bimport\s+java\./,
      /\bnew\s+\w+\s*\(/,
      /@\w+\s*\n\s*public/,
    ],
  },
  {
    language: "c",
    patterns: [
      /#include\s*<\w+\.h>/,
      /\bprintf\s*\(/,
      /\bint\s+main\s*\(/,
      /\bvoid\s+\w+\s*\(/,
      /\bmalloc\s*\(/,
      /\bfree\s*\(/,
      /\bsizeof\s*\(/,
    ],
  },
  {
    language: "cpp",
    patterns: [
      /#include\s*<\w+>/,
      /\bstd::\w+/,
      /\bcout\s*<</,
      /\bcin\s*>>/,
      /\btemplate\s*</,
      /\bnamespace\s+\w+/,
      /\bclass\s+\w+\s*\{/,
    ],
  },
  {
    language: "csharp",
    patterns: [
      /\busing\s+System/,
      /\bnamespace\s+\w+/,
      /\bpublic\s+class\s+\w+/,
      /\bConsole\.Write/,
      /\bvar\s+\w+\s*=/,
      /\basync\s+Task\b/,
    ],
  },
  {
    language: "php",
    patterns: [
      /<\?php/,
      /\$\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /\becho\s+/,
      /\b->\w+/,
      /\barray\s*\(/,
    ],
  },
  {
    language: "swift",
    patterns: [
      /\bvar\s+\w+:\s*\w+/,
      /\blet\s+\w+:\s*\w+/,
      /\bfunc\s+\w+\s*\(/,
      /\bguard\s+let\b/,
      /\bprint\s*\(/,
      /\bimport\s+\w+/,
    ],
  },
  {
    language: "kotlin",
    patterns: [
      /\bfun\s+\w+\s*\(/,
      /\bval\s+\w+/,
      /\bvar\s+\w+/,
      /\bwhen\s*\(/,
      /\bdata\s+class\b/,
      /\bcompanion\s+object\b/,
    ],
  },
  {
    language: "scala",
    patterns: [
      /\bobject\s+\w+/,
      /\bdef\s+\w+\s*\(/,
      /\bval\s+\w+/,
      /\bvar\s+\w+/,
      /\btrait\s+\w+/,
      /\bcase\s+class\b/,
    ],
  },
  {
    language: "sql",
    patterns: [
      /\bSELECT\s+/i,
      /\bFROM\s+/i,
      /\bWHERE\s+/i,
      /\bINSERT\s+INTO\b/i,
      /\bCREATE\s+TABLE\b/i,
      /\bJOIN\s+/i,
    ],
  },
  {
    language: "bash",
    patterns: [
      /^#!/,
      /\$\{\w+\}/,
      /\becho\s+/,
      /\bif\s+\[/,
      /\bfi\b/,
      /\bdone\b/,
      /\bsudo\s+/,
    ],
  },
  {
    language: "html",
    patterns: [
      /<!DOCTYPE\s+html/i,
      /<html/,
      /<div/,
      /<head>/,
      /<body>/,
      /<\/\w+>/,
    ],
  },
  {
    language: "css",
    patterns: [
      /\w+\s*\{\s*[\w-]+\s*:/,
      /@media\s/,
      /\.\w+\s*\{/,
      /#\w+\s*\{/,
      /:\s*(hover|focus|active|before|after)\s*\{/,
    ],
  },
  {
    language: "json",
    patterns: [/^\s*\{/, /^\s*\[/, /"\w+"\s*:/, /^\s*\}/],
  },
  {
    language: "yaml",
    patterns: [/^\w+:/m, /^\s+-\s+/m, /^\s{2}\w+:/m, /---\s*$/],
  },
  {
    language: "markdown",
    patterns: [
      /^#+\s+/m,
      /\[.*\]\(.*\)/,
      /^>\s+/m,
      /^---$/m,
      /\*\*.*\*\*/,
    ],
  },
];

function detectLanguage(code: string): LanguageInfo {
  let bestLang: LanguageId = "plaintext";
  let bestScore = 0;

  for (const rule of DETECTION_RULES) {
    let score = 0;
    for (const pattern of rule.patterns) {
      if (pattern.test(code)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestLang = rule.language;
    }
  }

  if (bestScore < 2) {
    return PLAINTEXT_LANG;
  }

  return findLanguageById(bestLang);
}
