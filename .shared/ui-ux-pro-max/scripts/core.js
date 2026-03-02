#!/usr/bin/env node
/**
 * UI/UX Pro Max Core - BM25 search engine for UI/UX style guides
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============ CONFIGURATION ============
const DATA_DIR = join(__dirname, "..", "data");
const MAX_RESULTS = 3;

const CSV_CONFIG = {
  style: {
    file: "styles.csv",
    search_cols: ["Style Category", "Keywords", "Best For", "Type"],
    output_cols: [
      "Style Category",
      "Type",
      "Keywords",
      "Primary Colors",
      "Effects & Animation",
      "Best For",
      "Performance",
      "Accessibility",
      "Framework Compatibility",
      "Complexity",
    ],
  },
  prompt: {
    file: "prompts.csv",
    search_cols: [
      "Style Category",
      "AI Prompt Keywords (Copy-Paste Ready)",
      "CSS/Technical Keywords",
    ],
    output_cols: [
      "Style Category",
      "AI Prompt Keywords (Copy-Paste Ready)",
      "CSS/Technical Keywords",
      "Implementation Checklist",
    ],
  },
  color: {
    file: "colors.csv",
    search_cols: ["Product Type", "Keywords", "Notes"],
    output_cols: [
      "Product Type",
      "Keywords",
      "Primary (Hex)",
      "Secondary (Hex)",
      "CTA (Hex)",
      "Background (Hex)",
      "Text (Hex)",
      "Border (Hex)",
      "Notes",
    ],
  },
  chart: {
    file: "charts.csv",
    search_cols: [
      "Data Type",
      "Keywords",
      "Best Chart Type",
      "Accessibility Notes",
    ],
    output_cols: [
      "Data Type",
      "Keywords",
      "Best Chart Type",
      "Secondary Options",
      "Color Guidance",
      "Accessibility Notes",
      "Library Recommendation",
      "Interactive Level",
    ],
  },
  landing: {
    file: "landing.csv",
    search_cols: [
      "Pattern Name",
      "Keywords",
      "Conversion Optimization",
      "Section Order",
    ],
    output_cols: [
      "Pattern Name",
      "Keywords",
      "Section Order",
      "Primary CTA Placement",
      "Color Strategy",
      "Conversion Optimization",
    ],
  },
  product: {
    file: "products.csv",
    search_cols: [
      "Product Type",
      "Keywords",
      "Primary Style Recommendation",
      "Key Considerations",
    ],
    output_cols: [
      "Product Type",
      "Keywords",
      "Primary Style Recommendation",
      "Secondary Styles",
      "Landing Page Pattern",
      "Dashboard Style (if applicable)",
      "Color Palette Focus",
    ],
  },
  ux: {
    file: "ux-guidelines.csv",
    search_cols: ["Category", "Issue", "Description", "Platform"],
    output_cols: [
      "Category",
      "Issue",
      "Platform",
      "Description",
      "Do",
      "Don't",
      "Code Example Good",
      "Code Example Bad",
      "Severity",
    ],
  },
  typography: {
    file: "typography.csv",
    search_cols: [
      "Font Pairing Name",
      "Category",
      "Mood/Style Keywords",
      "Best For",
      "Heading Font",
      "Body Font",
    ],
    output_cols: [
      "Font Pairing Name",
      "Category",
      "Heading Font",
      "Body Font",
      "Mood/Style Keywords",
      "Best For",
      "Google Fonts URL",
      "CSS Import",
      "Tailwind Config",
      "Notes",
    ],
  },
  icons: {
    file: "icons.csv",
    search_cols: ["Category", "Icon Name", "Keywords", "Best For"],
    output_cols: [
      "Category",
      "Icon Name",
      "Keywords",
      "Library",
      "Import Code",
      "Usage",
      "Best For",
      "Style",
    ],
  },
};

const STACK_CONFIG = {
  "html-tailwind": { file: "stacks/html-tailwind.csv" },
  react: { file: "stacks/react.csv" },
  nextjs: { file: "stacks/nextjs.csv" },
  vue: { file: "stacks/vue.csv" },
  nuxtjs: { file: "stacks/nuxtjs.csv" },
  "nuxt-ui": { file: "stacks/nuxt-ui.csv" },
  svelte: { file: "stacks/svelte.csv" },
  swiftui: { file: "stacks/swiftui.csv" },
  "react-native": { file: "stacks/react-native.csv" },
  flutter: { file: "stacks/flutter.csv" },
  shadcn: { file: "stacks/shadcn.csv" },
};

const _STACK_COLS = {
  search_cols: ["Category", "Guideline", "Description", "Do", "Don't"],
  output_cols: [
    "Category",
    "Guideline",
    "Description",
    "Do",
    "Don't",
    "Code Good",
    "Code Bad",
    "Severity",
    "Docs URL",
  ],
};

const AVAILABLE_STACKS = Object.keys(STACK_CONFIG);

// ============ CSV PARSER ============
function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += c;
    }
  }
  result.push(current.trimEnd());
  return result;
}

function parseCSV(text) {
  const lines = [];
  let currentLine = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      currentLine += c;
    } else if ((c === "\n" || (c === "\r" && text[i + 1] !== "\n")) && !inQuotes) {
      if (currentLine.trim()) lines.push(currentLine);
      currentLine = "";
      if (c === "\r") i++;
    } else if (c !== "\r") {
      currentLine += c;
    }
  }
  if (currentLine.trim()) lines.push(currentLine);

  if (lines.length === 0) return [];
  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

// ============ BM25 IMPLEMENTATION ============
class BM25 {
  constructor(k1 = 1.5, b = 0.75) {
    this.k1 = k1;
    this.b = b;
    this.corpus = [];
    this.docLengths = [];
    this.avgdl = 0;
    this.idf = {};
    this.docFreqs = {};
    this.N = 0;
  }

  tokenize(text) {
    const cleaned = String(text).toLowerCase().replace(/[^\w\s]/g, " ");
    return cleaned.split(/\s+/).filter((w) => w.length > 2);
  }

  fit(documents) {
    this.corpus = documents.map((doc) => this.tokenize(doc));
    this.N = this.corpus.length;
    if (this.N === 0) return;

    this.docLengths = this.corpus.map((doc) => doc.length);
    this.avgdl =
      this.docLengths.reduce((a, b) => a + b, 0) / this.N;

    for (const doc of this.corpus) {
      const seen = new Set();
      for (const word of doc) {
        if (!seen.has(word)) {
          this.docFreqs[word] = (this.docFreqs[word] ?? 0) + 1;
          seen.add(word);
        }
      }
    }

    for (const [word, freq] of Object.entries(this.docFreqs)) {
      this.idf[word] =
        Math.log((this.N - freq + 0.5) / (freq + 0.5) + 1);
    }
  }

  score(query) {
    const queryTokens = this.tokenize(query);
    const scores = [];

    for (let idx = 0; idx < this.corpus.length; idx++) {
      const doc = this.corpus[idx];
      const docLen = this.docLengths[idx];
      const termFreqs = {};
      for (const word of doc) {
        termFreqs[word] = (termFreqs[word] ?? 0) + 1;
      }

      let score = 0;
      for (const token of queryTokens) {
        if (this.idf[token] !== undefined) {
          const tf = termFreqs[token] ?? 0;
          const idf = this.idf[token];
          const numerator = tf * (this.k1 + 1);
          const denominator =
            tf +
            this.k1 *
              (1 - this.b + (this.b * docLen) / this.avgdl);
          score += (idf * numerator) / denominator;
        }
      }
      scores.push([idx, score]);
    }

    return scores.sort((a, b) => b[1] - a[1]);
  }
}

// ============ SEARCH FUNCTIONS ============
function loadCSV(filepath) {
  const text = readFileSync(filepath, "utf-8");
  return parseCSV(text);
}

function searchCSV(filepath, searchCols, outputCols, query, maxResults) {
  try {
    const data = loadCSV(filepath);
    const documents = data.map((row) =>
      searchCols.map((col) => String(row[col] ?? "")).join(" ")
    );

    const bm25 = new BM25();
    bm25.fit(documents);
    const ranked = bm25.score(query);

    const results = [];
    for (let i = 0; i < Math.min(ranked.length, maxResults); i++) {
      const [idx, score] = ranked[i];
      if (score > 0) {
        const row = data[idx];
        const out = {};
        for (const col of outputCols) {
          if (col in row) out[col] = row[col];
        }
        results.push(out);
      }
    }
    return results;
  } catch {
    return [];
  }
}

function detectDomain(query) {
  const queryLower = query.toLowerCase();
  const domainKeywords = {
    color: ["color", "palette", "hex", "#", "rgb"],
    chart: [
      "chart",
      "graph",
      "visualization",
      "trend",
      "bar",
      "pie",
      "scatter",
      "heatmap",
      "funnel",
    ],
    landing: [
      "landing",
      "page",
      "cta",
      "conversion",
      "hero",
      "testimonial",
      "pricing",
      "section",
    ],
    product: [
      "saas",
      "ecommerce",
      "e-commerce",
      "fintech",
      "healthcare",
      "gaming",
      "portfolio",
      "crypto",
      "dashboard",
    ],
    prompt: [
      "prompt",
      "css",
      "implementation",
      "variable",
      "checklist",
      "tailwind",
    ],
    style: [
      "style",
      "design",
      "ui",
      "minimalism",
      "glassmorphism",
      "neumorphism",
      "brutalism",
      "dark mode",
      "flat",
      "aurora",
    ],
    ux: [
      "ux",
      "usability",
      "accessibility",
      "wcag",
      "touch",
      "scroll",
      "animation",
      "keyboard",
      "navigation",
      "mobile",
    ],
    typography: [
      "font",
      "typography",
      "heading",
      "serif",
      "sans",
    ],
    icons: [
      "icon",
      "icons",
      "lucide",
      "heroicons",
      "symbol",
      "glyph",
      "pictogram",
      "svg icon",
    ],
  };

  let bestDomain = "style";
  let bestScore = 0;
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    const score = keywords.filter((kw) => queryLower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestDomain = domain;
    }
  }
  return bestDomain;
}

function search(query, domain = null, maxResults = MAX_RESULTS) {
  const resolvedDomain = domain ?? detectDomain(query);
  const config = CSV_CONFIG[resolvedDomain] ?? CSV_CONFIG.style;
  const filepath = join(DATA_DIR, config.file);

  if (!existsSync(filepath)) {
    return { error: `File not found: ${filepath}`, domain: resolvedDomain };
  }

  const results = searchCSV(
    filepath,
    config.search_cols,
    config.output_cols,
    query,
    maxResults
  );
  return {
    domain: resolvedDomain,
    query,
    file: config.file,
    count: results.length,
    results,
  };
}

function searchStack(query, stack, maxResults = MAX_RESULTS) {
  if (!STACK_CONFIG[stack]) {
    return {
      error: `Unknown stack: ${stack}. Available: ${AVAILABLE_STACKS.join(", ")}`,
    };
  }

  const filepath = join(DATA_DIR, STACK_CONFIG[stack].file);

  if (!existsSync(filepath)) {
    return {
      error: `Stack file not found: ${filepath}`,
      stack,
    };
  }

  const results = searchCSV(
    filepath,
    _STACK_COLS.search_cols,
    _STACK_COLS.output_cols,
    query,
    maxResults
  );
  return {
    domain: "stack",
    stack,
    query,
    file: STACK_CONFIG[stack].file,
    count: results.length,
    results,
  };
}

export {
  CSV_CONFIG,
  AVAILABLE_STACKS,
  MAX_RESULTS,
  search,
  searchStack,
};
