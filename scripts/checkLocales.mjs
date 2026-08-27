#!/usr/bin/env node

import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const LOCALES_DIR = path.join(ROOT, "public", "locales");
const SRC_DIR = path.join(ROOT, "src");

let hasErrors = false;

function error(message) {
  hasErrors = true;
  console.error(`  ✗ ${message}`);
}

async function findLocaleModules(dir, baseDir = "") {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  let modules = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

    const [enExists, arExists] = await Promise.all([
      fileExists(path.join(fullPath, "enLocale.json")),
      fileExists(path.join(fullPath, "arLocale.json")),
    ]);

    if (enExists || arExists) {
      modules.push(relativePath);
    }

    modules = modules.concat(await findLocaleModules(fullPath, relativePath));
  }

  return modules;
}

async function fileExists(filePath) {
  try {
    return (await stat(filePath)).isFile();
  } catch {
    return false;
  }
}

function flattenKeys(obj, prefix = "") {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys.sort();
}

function resolveKey(obj, key) {
  let current = obj;

  for (const part of key.split(".")) {
    if (current === null || typeof current !== "object") return undefined;
    current = current[part];
  }

  return current;
}

function setDeep(target, modulePath, value) {
  const keys = modulePath.split("/");
  let current = target;

  for (let i = 0; i < keys.length - 1; i++) {
    if (typeof current[keys[i]] !== "object" || current[keys[i]] === null) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }

  const lastKey = keys[keys.length - 1];

  if (
    current[lastKey] &&
    typeof current[lastKey] === "object" &&
    value &&
    typeof value === "object"
  ) {
    current[lastKey] = { ...current[lastKey], ...value };
  } else {
    current[lastKey] = value;
  }
}

async function collectSourceFiles(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectSourceFiles(fullPath)));
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

const localeModules = await findLocaleModules(LOCALES_DIR);

if (localeModules.length === 0) {
  console.error(`No locale modules found in ${LOCALES_DIR}`);
  process.exit(1);
}

console.log(`Checking ${localeModules.length} locale modules...\n`);

const mergedEn = {};

for (const module of localeModules) {
  const enPath = path.join(LOCALES_DIR, module, "enLocale.json");
  const arPath = path.join(LOCALES_DIR, module, "arLocale.json");

  const [enExists, arExists] = await Promise.all([
    fileExists(enPath),
    fileExists(arPath),
  ]);

  if (!enExists) {
    error(`[${module}] missing enLocale.json`);
    continue;
  }

  if (!arExists) {
    error(`[${module}] missing arLocale.json`);
  }

  const enData = JSON.parse(await readFile(enPath, "utf-8"));
  setDeep(mergedEn, module, enData);

  if (!arExists) continue;

  const arData = JSON.parse(await readFile(arPath, "utf-8"));

  const enKeys = flattenKeys(enData);
  const arKeys = flattenKeys(arData);

  const missingInAr = enKeys.filter((key) => !arKeys.includes(key));
  const missingInEn = arKeys.filter((key) => !enKeys.includes(key));

  if (missingInAr.length > 0 || missingInEn.length > 0) {
    console.log(`[${module}]`);

    for (const key of missingInAr) {
      error(`missing in arLocale.json: ${key}`);
    }

    for (const key of missingInEn) {
      error(`missing in enLocale.json: ${key}`);
    }
  } else {
    console.log(`[${module}] ok (${enKeys.length} keys)`);
  }
}

console.log("\nChecking translation keys used in src/...\n");

const staticKeyPattern = /\bt\(\s*"([a-zA-Z0-9_.]+)"\s*\)/g;
const dynamicKeyPattern = /\bt\(\s*`([a-zA-Z0-9_.]+)\$\{/g;

const sourceFiles = await collectSourceFiles(SRC_DIR);
const usedStaticKeys = new Map();
const usedDynamicPrefixes = new Map();

for (const file of sourceFiles) {
  const content = await readFile(file, "utf-8");
  const relativePath = path.relative(ROOT, file);

  for (const match of content.matchAll(staticKeyPattern)) {
    const key = match[1];

    if (!usedStaticKeys.has(key)) {
      usedStaticKeys.set(key, []);
    }

    usedStaticKeys.get(key).push(relativePath);
  }

  for (const match of content.matchAll(dynamicKeyPattern)) {
    const prefix = match[1].replace(/\.+$/, "");

    if (!usedDynamicPrefixes.has(prefix)) {
      usedDynamicPrefixes.set(prefix, []);
    }

    usedDynamicPrefixes.get(prefix).push(relativePath);
  }
}

for (const [key, files] of usedStaticKeys) {
  const value = resolveKey(mergedEn, key);

  if (value === undefined) {
    for (const file of files) {
      error(`key not found in en locales: "${key}" (used in ${file})`);
    }
  } else if (typeof value !== "string") {
    for (const file of files) {
      error(`key points to an object, not a string: "${key}" (used in ${file})`);
    }
  }
}

for (const [prefix, files] of usedDynamicPrefixes) {
  const value = resolveKey(mergedEn, prefix);

  if (value === undefined) {
    for (const file of files) {
      error(
        `dynamic key prefix not found in en locales: "${prefix}.*" (used in ${file})`,
      );
    }
  } else if (typeof value !== "object" || value === null) {
    for (const file of files) {
      error(
        `dynamic key prefix is not an object: "${prefix}.*" (used in ${file})`,
      );
    }
  }
}

console.log(
  `Checked ${usedStaticKeys.size} static keys and ${usedDynamicPrefixes.size} dynamic prefixes.`,
);

if (hasErrors) {
  console.error("\nLocale check failed.");
  process.exit(1);
}

console.log("\nLocale check passed.");
