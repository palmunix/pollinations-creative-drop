[![Made with pollinations.ai](https://raw.githubusercontent.com/pollinations/pollinations/main/packages/ui/src/brand/badge-made-with.svg)](https://pollinations.ai/?ref=badge)

# pollinations-creative-drop

An [Agent Skills](https://agentskills.io) skill that turns a one-line brief into a coherent multimedia drop — key visual, narration, optional motion clip and a shareable HTML card — built entirely on Pollinations models.

This repository **is** the skill directory: `SKILL.md` sits at the root, and the directory name matches the frontmatter `name`.

## Files

| File | Purpose |
| --- | --- |
| `SKILL.md` | Metadata and the full agent workflow |
| `api-recipes.md` | Raw HTTP recipes and model-selection rules |
| `auth-balance-and-pay.md` | Key types, preflight checks and BYOP flow |
| `preflight.sh` | Verifies CLI, login, balance and healthy free models |
| `assemble.mjs` | Builds the shareable page from generated assets |
| `showcase.html` | Page template used by `assemble.mjs` |

## Use it

Install this directory into any Agent Skills-compatible agent (for Claude Code: `.claude/skills/pollinations-creative-drop`), then say:

> Make a creative drop for a lighthouse that sells dreams. Nostalgic, luminous, hand-painted. Square.

The agent runs `preflight.sh` (the user authenticates with `polli auth login`), writes a shared art direction, generates the assets and assembles `out/index.html`. The example in this repo's screenshots was made with `tongyi-mai/z-image-turbo` and `openai/tts-1`.

## Validate

```bash
bash -n preflight.sh
node --check assemble.mjs
# Optional, if installed: skills-ref validate .
```

## Quest #20020 submission

Built for quest [#20020](https://github.com/pollinations/pollinations/issues/20020) — "An agent skill that makes something creative with Pollinations". Submitted through the [app submission form](https://github.com/pollinations/pollinations/issues/new?template=app-submission.yml) with `#20020` in the **Quest** field and the **App URL left empty**, as the quest requires.

License: MIT.
