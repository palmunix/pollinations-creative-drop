#!/usr/bin/env node
// Assemble a Creative Drop page from generated assets.
// Usage: node scripts/assemble.mjs --dir out --title "..." --tagline "..." \
//          --hero hero.png --audio sting.mp3 --video motion.mp4
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const templatePath = join(root, "showcase.html");

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith("--")) continue;
    const key = argv[i].slice(2);
    const value = argv[i + 1];
    if (value === undefined || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    out[key] = value;
    i++;
  }
  return out;
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function mediaBlock({ label, tag, src, type }) {
  return `<figure class="media">
      <div class="label">${esc(label)}</div>
      <${tag} controls src="${esc(src)}"${type ? ` type="${esc(type)}"` : ""}></${tag}>
    </figure>`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.dir) throw new Error("Required: --dir <output directory>");
  if (!args.hero) throw new Error("Required: --hero <image filename>");
  if (!existsSync(join(args.dir, args.hero))) {
    throw new Error(`Hero file not found: ${join(args.dir, args.hero)}`);
  }

  const audioBlock = args.audio && existsSync(join(args.dir, args.audio))
    ? mediaBlock({ label: "Narration", tag: "audio", src: args.audio, type: "audio/mpeg" })
    : "";
  const videoBlock = args.video && existsSync(join(args.dir, args.video))
    ? mediaBlock({ label: "Motion", tag: "video", src: args.video, type: "video/mp4" })
    : "";

  const html = readFileSync(templatePath, "utf8")
    .replaceAll("__TITLE__", esc(args.title || "Untitled drop"))
    .replaceAll("__TAGLINE__", esc(args.tagline || ""))
    .replaceAll("__HERO_SRC__", esc(args.hero))
    .replaceAll("__AUDIO_BLOCK__", audioBlock)
    .replaceAll("__VIDEO_BLOCK__", videoBlock)
    .replaceAll("__MODEL_LINE__", args.models ? esc(`Models: ${args.models}`) : "");

  const target = join(args.dir, "index.html");
  writeFileSync(target, html, "utf8");
  console.log(`Wrote ${target}`);
  if (!videoBlock) console.log("No video included (optional, paid-only).");
}

try {
  main();
} catch (error) {
  console.error(`assemble.mjs: ${error.message}`);
  process.exit(1);
}
