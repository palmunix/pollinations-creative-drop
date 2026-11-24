---
name: pollinations-creative-drop
description: Turn a one-line brief into a coherent, shareable multimedia drop — a hero image, a short motion clip, a narration sting and a polished HTML card — made with Pollinations text, image, audio and video models through one API. Use when someone asks for a poster, moodboard, album cover, launch teaser, mascot, storyboard or visual concept, especially with Pollinations models or when one brief must become several matching assets.
license: MIT
compatibility: Requires Node.js 18+, network access to gen.pollinations.ai and a Pollinations account. Uses the polli CLI, falling back to npx @pollinations/cli.
metadata:
  author: pollinations-community
  version: "1.0"
  quest: "20020"
---

# Creative Drop

One brief in → a small set of assets that clearly belong together, plus one page to show them.

The trick is consistency: a single creative direction is written first, then reused verbatim as the seed for the image, the motion clip and the narration. Assets that drift apart are the failure mode this skill prevents.

## When to use

- "Make me a poster / cover / mascot / key visual for X."
- "Give me a teaser package for X" (image + clip + voice line).
- "I need a moodboard with a title and a spoken tagline."
- Any request where several media formats must share one art direction, and Pollinations is the engine.

Not for: plain chat answers, editing a user-supplied photo (use an image-edit endpoint instead), or apps where end users pay — see the BYOP note in step 6.

## Hard rules

1. **Never ask for, echo or store an API key.** Authenticate with `polli auth login` (device flow). If login is missing, tell the user to run it themselves; do not read their key files.
2. **Every request goes to `https://gen.pollinations.ai`** (base `https://gen.pollinations.ai/v1` for OpenAI-compatible calls). No other provider SDKs.
3. **Do not hardcode model names as a guarantee.** List live models with `polli models --type <category> --json`, prefer one with `health.status = healthy`, and fall back to the starting points in `api-recipes.md` only when listing fails.
4. **`paid_only: true` needs paid Pollen.** Quest Pollen cannot pay for it — video models are typically paid-only. Check `polli usage` and the model's `paid_only` flag, and ask before spending paid balance. If in doubt, deliver image + audio only and say what was skipped.
5. **Never put an `sk_` key in browser code.** If visitors should pay from their own balance, use Connect User Wallets (BYOP), described in `auth-balance-and-pay.md`.
6. Keep generated files in a dedicated output directory. Do not overwrite the user's existing files.

Examples below use `polli`. If it is not installed, use `npx --yes @pollinations/cli` in the same place.

## Step 1 — Lock the brief

Get or decide these five things, then state them back in one sentence:

| Field | Example |
| --- | --- |
| Subject | "a lighthouse that sells dreams" |
| Mood (3 adjectives) | "nostalgic, luminous, hand-painted" |
| Format | square `1024x1024`, wide `1536x1024`, or vertical `1024x1536` |
| Narration language | English |
| Motion | yes / no (paid-only warning applies) |

If the user says "surprise me", choose all five yourself and announce the choices. Do not re-ask later.

## Step 2 — Preflight

```bash
bash preflight.sh
```

It reports the CLI in use, authentication status, balance and a reminder to inspect `paid_only`. If it exits non-zero, stop and ask the user to log in with `polli auth login`. Never work around a failed login.

## Step 3 — Write the direction

Ask a text model for a compact creative direction that the other calls can copy verbatim:

```bash
polli gen text "Write a 3-line art direction for: <subject>. Mood: <adjectives>. \
Line 1: a single hero image prompt (subject, composition, light, style, palette, no text in image). \
Line 2: a 6-second motion prompt that continues that exact image. \
Line 3: a spoken tagline under 25 words in <language>. Return only the 3 lines." \
  > out/direction.txt
```

Read the file, sanity-check that the three prompts agree on subject, palette and style, and edit it if they drift. This file is the source of truth for the rest of the run.

## Step 4 — Generate the hero image

```bash
polli gen image "<line 1>" --model <healthy-image-model> --output out/hero.png
```

Use the format from step 1 when the CLI/API supports a size flag; otherwise pass `size` via the API recipe in `api-recipes.md`. Inspect the result (file exists, non-zero size). If the model is unavailable, pick the next healthy model from `polli models --type image --json` and retry once.

## Step 5 — Generate the narration sting

```bash
polli gen audio "<line 3>" --voice nova --output out/sting.mp3
```

Any clear voice works; `--voice nova` is a safe default. If the user wants the drop to be silent, skip this step and say so.

## Step 6 — Optional motion clip (paid-only)

Confirm the user accepts paid-balance spend, then:

```bash
polli upload out/hero.png          # prints a public URL; use it as --image
polli gen video "<line 2>" --image <public-url> --output out/motion.mp4
```

`--image` requires a public HTTPS URL, never a local path. Upload may be unavailable; if it fails, generate from text alone. Verify with `file out/motion.mp4` or `ffprobe`. If the user declined paid spend, skip cleanly — the drop is still complete without it.

For an app where **end users** pay, register a `pk_` App Key and run the BYOP consent flow so the user's own balance is used. See `auth-balance-and-pay.md`. Never ship your `sk_` key.

## Step 7 — Assemble and hand off

```bash
node assemble.mjs --dir out --title "<subject>" --tagline "<line 3>" \
  --hero hero.png --audio sting.mp3 --video motion.mp4
```

This writes `out/index.html`: a responsive card with the hero, audio player, optional video and Pollinations attribution. Preview it if a browser is available.

Report back with:

- the three decisions from step 1,
- the exact files created,
- model IDs used and whether any paid balance was spent,
- anything skipped and why.

## Failure playbook

| Symptom | Action |
| --- | --- |
| `auth status` fails | Ask user to run `polli auth login`; do not read or request keys. |
| `402` / "paid-only" | Check `polli usage`; ask before spending paid Pollen; otherwise drop video. |
| `401` / `403` | Wrong or revoked key; user re-logins. Do not retry in a loop. |
| `429` / rate limit | Back off, reduce number of variants, retry once later. |
| Community model 404 or dead | Pick another `healthy` model from the list, retry once. |
| `--image` rejected | Upload first; a local path cannot be used. |
| Empty/0-byte output | Delete it, retry once with a different healthy model, then report failure. |

## References

- `api-recipes.md` — raw HTTP recipes, model-selection rules, parameter tables.
- `auth-balance-and-pay.md` — key types, preflight checks, BYOP flow.
- `showcase.html` — the page template used by `scripts/assemble.mjs`.
