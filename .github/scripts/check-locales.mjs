// Checks every locales/ file against en.json. Usage, from the repo root: node .github/scripts/check-locales.mjs
import { readFileSync, readdirSync, existsSync, appendFileSync } from "node:fs";

const REFERENCE = "en";
const PROJECTS = [
  { dir: ".", langsIn: "scripts.js", cards: true },
  { dir: "FreeTheMemes", langsIn: "src/i18n.js" },
  { dir: "GridOfGreed", langsIn: "src/i18n.js" },
  { dir: "Mimiri", langsIn: "src/i18n.js" },
  { dir: "BitByBit", langsIn: "src/i18n.js" },
];

const errors = [];
const warnings = [];
const report = (list, file, message) => list.push({ file, message });
const path = (dir, file) => (dir === "." ? file : `${dir}/${file}`);
const vars = (text) => (String(text).match(/\{[^}]+\}/g) ?? []).sort().join(" ");

// LANGS = { fr: "Français", en: "English" } → ["fr", "en"]
function readLangs(file) {
  const block = readFileSync(file, "utf8").match(/LANGS\s*=\s*\{([^}]*)\}/)?.[1] ?? "";
  return [...block.matchAll(/["']?([\w-]+)["']?\s*:/g)].map((m) => m[1]);
}

function readJson(file) {
  try {
    const data = JSON.parse(readFileSync(file, "utf8").replace(/^\uFEFF/, "")); // BOM (Notepad)
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("expected an object of \"key\": \"text\"");
    return data;
  } catch (e) {
    report(errors, file, `invalid JSON: ${e.message}`);
    return null;
  }
}

for (const project of PROJECTS) {
  const langsFile = path(project.dir, project.langsIn);
  const langs = readLangs(langsFile);
  const localesDir = path(project.dir, "locales");
  const files = readdirSync(localesDir).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));

  for (const code of files.filter((c) => !langs.includes(c))) {
    report(errors, `${localesDir}/${code}.json`, `"${code}" is missing from LANGS in ${langsFile}`);
  }
  for (const code of langs.filter((c) => !files.includes(c))) {
    report(errors, langsFile, `LANGS lists "${code}" but ${localesDir}/${code}.json doesn't exist`);
  }

  const ref = readJson(`${localesDir}/${REFERENCE}.json`);
  if (!ref) continue;
  for (const code of files.filter((c) => c !== REFERENCE)) {
    const file = `${localesDir}/${code}.json`;
    const messages = readJson(file);
    if (!messages) continue;
    for (const key of Object.keys(ref)) {
      if (!(key in messages)) report(errors, file, `missing key "${key}" (English: "${ref[key]}")`);
      else if (typeof messages[key] !== "string" || !messages[key].trim()) report(errors, file, `"${key}" is empty`);
      else if (vars(messages[key]) !== vars(ref[key])) {
        report(errors, file, `"${key}" must keep the same {variables} as English: ${vars(ref[key]) || "(none)"}`);
      }
    }
    for (const key of Object.keys(messages).filter((k) => !(k in ref))) {
      report(errors, file, `unknown key "${key}" (not in ${REFERENCE}.json: typo or removed text?)`);
    }
  }

  // Card texts fall back to English: warn only.
  if (project.cards) {
    for (const file of readdirSync(project.dir).filter((f) => /^card_.*\.json$/.test(f))) {
      const walk = (value, where) => {
        if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${where}[${i}]`));
        if (!value || typeof value !== "object") return;
        if (REFERENCE in value) {
          for (const code of langs.filter((c) => !(c in value))) report(warnings, file, `${where}: no "${code}" text`);
          return;
        }
        for (const [k, v] of Object.entries(value)) walk(v, where ? `${where}.${k}` : k);
      };
      const card = readJson(file);
      if (card) walk(card, "");
    }
  }
}

if (process.env.GITHUB_ACTIONS) {
  for (const { file, message } of errors) console.log(`::error file=${file}::${message}`);
  for (const { file, message } of warnings) console.log(`::warning file=${file}::${message}`);
}

const lines = errors.length
  ? [`### ❌ ${errors.length} problem(s) in the language files`, "", ...errors.map((e) => `- \`${e.file}\`: ${e.message}`)]
  : ["### ✅ All language files are complete"];
if (warnings.length) {
  lines.push("", `${warnings.length} text(s) will show in English for now (fine, but you can translate them):`, "",
    ...warnings.map((w) => `- \`${w.file}\`: ${w.message}`));
}
if (process.env.GITHUB_STEP_SUMMARY && existsSync(process.env.GITHUB_STEP_SUMMARY)) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
}
if (!process.env.GITHUB_ACTIONS) console.log(lines.join("\n"));
process.exit(errors.length ? 1 : 0);
