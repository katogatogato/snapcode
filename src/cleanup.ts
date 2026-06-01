function fixCommonArtifacts(text: string): string {
  let result = text;
  result = result.replace(/[\u2018\u2019]/g, "'");
  result = result.replace(/[\u201C\u201D]/g, '"');
  result = result.replace(/[\u2013\u2014]/g, "-");
  result = result.replace(/\u2026/g, "...");
  result = result.replace(/[\u00A0]/g, " ");
  result = result.replace(/\uFB01/g, "fi");
  result = result.replace(/\uFB02/g, "fl");
  return result;
}

function fixLetterNumberConfusion(text: string): string {
  const lines = text.split("\n");
  const fixed = lines.map((line) => {
    let l = line;
    l = l.replace(/(\d)O(?=\d)/g, "$1" + "0");
    l = l.replace(/(\d)O(?=[xXbB])/g, "$1" + "0");
    l = l.replace(/O(?=\.?\d)/g, "0");
    l = l.replace(/(\d)l(?=\d)/g, "$1" + "1");
    l = l.replace(/(\d)S(?=\d)/g, "$1" + "5");
    l = l.replace(/(\d)B(?=\d)/g, "$1" + "8");
    return l;
  });
  return fixed.join("\n");
}

function normalizeIndentation(text: string): string {
  const lines = text.split("\n");
  const indentCounts = new Map<string, number>();

  for (const line of lines) {
    const leadingMatch = line.match(/^(\s+)/);
    if (leadingMatch) {
      const indent = leadingMatch[1];
      if (indent.length > 0) {
        indentCounts.set(indent, (indentCounts.get(indent) || 0) + 1);
      }
    }
  }

  let smallestUnit = "  ";
  let found = false;

  const sortedIndents = Array.from(indentCounts.keys()).sort(
    (a, b) => a.length - b.length
  );

  for (const indent of sortedIndents) {
    if (indent.length > 0 && indent.length <= 4) {
      smallestUnit = indent;
      found = true;
      break;
    }
  }

  if (!found && sortedIndents.length > 0) {
    smallestUnit = sortedIndents[0];
  }

  const normalized = lines.map((line) => {
    if (line.trim().length === 0) return "";
    const leadingMatch = line.match(/^(\s*)/);
    if (!leadingMatch || leadingMatch[1].length === 0) return line;

    const leading = leadingMatch[1];
    const level = Math.round(leading.length / smallestUnit.length) || 1;
    const newIndent = smallestUnit.repeat(level);
    return newIndent + line.trimStart();
  });

  return normalized.join("\n");
}

function removeStrayCharacters(text: string): string {
  let result = text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");

  result = result.replace(/\n{4,}/g, "\n\n");
  result = result.replace(/^\n+/, "").replace(/\n+$/, "");
  return result;
}

function fixCommonOperators(text: string): string {
  let result = text;
  result = result.replace(/=\s*=\s*=/g, "===");
  result = result.replace(/!\s*=\s*=/g, "!==");
  result = result.replace(/<\s*=\s*>/g, "<=>");
  result = result.replace(/-\s*>\s*\(/g, "->(");
  result = result.replace(/=\s*>\s*\(/g, "=>(");
  result = result.replace(/:\s*:\s*/g, "::");
  result = result.replace(/=\s*>/g, "=>");
  result = result.replace(/!\s*=/g, "!=");
  result = result.replace(/<\s*=/g, "<=");
  result = result.replace(/>\s*=/g, ">=");
  result = result.replace(/\+\s*\+/g, "++");
  result = result.replace(/-\s*-/g, "--");
  result = result.replace(/&\s*&/g, "&&");
  result = result.replace(/\|\s*\|/g, "||");
  return result;
}

function cleanupCode(rawText: string): string {
  let text = rawText;
  text = fixCommonArtifacts(text);
  text = fixCommonOperators(text);
  text = fixLetterNumberConfusion(text);
  text = normalizeIndentation(text);
  text = removeStrayCharacters(text);
  return text;
}
