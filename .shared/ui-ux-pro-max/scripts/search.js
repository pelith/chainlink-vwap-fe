#!/usr/bin/env node
/**
 * UI/UX Pro Max Search - BM25 search engine for UI/UX style guides
 * Usage: node search.js "<query>" [--domain <domain>] [--stack <stack>] [--max-results 3]
 *
 * Domains: style, prompt, color, chart, landing, product, ux, typography, icons
 * Stacks: html-tailwind, react, nextjs, vue, nuxtjs, nuxt-ui, svelte, swiftui, react-native, flutter, shadcn
 */

import {
  CSV_CONFIG,
  AVAILABLE_STACKS,
  MAX_RESULTS,
  search,
  searchStack,
} from "./core.js";

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    query: "",
    domain: null,
    stack: null,
    maxResults: MAX_RESULTS,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--domain" || arg === "-d") {
      result.domain = args[++i] ?? null;
    } else if (arg === "--stack" || arg === "-s") {
      result.stack = args[++i] ?? null;
    } else if (arg === "--max-results" || arg === "-n") {
      result.maxResults = parseInt(args[++i], 10) || MAX_RESULTS;
    } else if (arg === "--json") {
      result.json = true;
    } else if (!arg.startsWith("-")) {
      result.query = arg;
    }
  }
  return result;
}

function formatOutput(result) {
  if (result.error) {
    return `Error: ${result.error}`;
  }

  const output = [];
  if (result.stack) {
    output.push("## UI Pro Max Stack Guidelines");
    output.push(`**Stack:** ${result.stack} | **Query:** ${result.query}`);
  } else {
    output.push("## UI Pro Max Search Results");
    output.push(`**Domain:** ${result.domain} | **Query:** ${result.query}`);
  }
  output.push(
    `**Source:** ${result.file} | **Found:** ${result.count} results\n`
  );

  for (let i = 0; i < result.results.length; i++) {
    output.push(`### Result ${i + 1}`);
    for (const [key, value] of Object.entries(result.results[i])) {
      let valueStr = String(value);
      if (valueStr.length > 300) {
        valueStr = valueStr.slice(0, 300) + "...";
      }
      output.push(`- **${key}:** ${valueStr}`);
    }
    output.push("");
  }

  return output.join("\n");
}

const args = parseArgs();

if (!args.query) {
  console.error(
    "Usage: node search.js \"<query>\" [--domain <domain>] [--stack <stack>] [--max-results 3] [--json]"
  );
  console.error("Domains:", Object.keys(CSV_CONFIG).join(", "));
  console.error("Stacks:", AVAILABLE_STACKS.join(", "));
  process.exit(1);
}

let result;
if (args.stack) {
  result = searchStack(args.query, args.stack, args.maxResults);
} else {
  result = search(args.query, args.domain, args.maxResults);
}

if (args.json) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(formatOutput(result));
}
