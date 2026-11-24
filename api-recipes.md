# API recipes

All calls go to `https://gen.pollinations.ai`. OpenAI-compatible base: `https://gen.pollinations.ai/v1`.
Authenticate with `Authorization: Bearer <key>`. Get keys at https://enter.pollinations.ai/keys.

## Model selection (do this first)

```bash
# JSON: name, category, paid_only, health.status, supported_endpoints
curl -s "https://gen.pollinations.ai/v1/models?reliability=all" \
  -H "Authorization: Bearer $POLLINATIONS_KEY" \
  | jq '.data[] | select(.category=="image" and .paid_only==false and .health.status=="healthy") | {id,title}'
```

Rules:

- Prefer `health.status == "healthy"`, `paid_only == false`, and a supported endpoint that matches the recipe.
- Community models are `community/owner/model`; they can be cheaper but less reliable.
- Video and 3D categories are currently **paid-only**. Quest Pollen cannot pay for them.
- When authenticated, paid-only models are hidden from listings if the account has no paid balance — an empty list usually means "no paid balance", not "no models".

Useful starting points (verify against the live list before relying on them):
- text: `openai/gpt-5.4-nano` (fast, tool-capable)
- image: `black-forest-labs/flux.1-schnell`, `tongyi-mai/z-image-turbo`
- audio/TTS: `openai/tts-1`, `microsoft/mai-voice-2.1-flash`
- transcription: `openai/whisper-large-v3`
- video: any model from `polli models --type video --json` (paid-only)

## Text (chat completions)

```bash
curl -s -X POST "https://gen.pollinations.ai/v1/chat/completions" \
  -H "Authorization: Bearer $POLLINATIONS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-5.4-nano",
    "messages": [{"role":"user","content":"Give me three art directions for a lighthouse that sells dreams."}]
  }'
```

The simple text endpoint also works: `GET/POST https://gen.pollinations.ai/text/{prompt}?model=<id>`.

## Image

```bash
curl -s -X POST "https://gen.pollinations.ai/v1/images/generations" \
  -H "Authorization: Bearer $POLLINATIONS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "black-forest-labs/flux.1-schnell",
    "prompt": "nostalgic hand-painted lighthouse at dusk, warm ochre and deep teal, cinematic wide composition, no text",
    "size": "1024x1024",
    "response_format": "url"
  }'
```

- `response_format`: `url` (stored media URL, fetching it never regenerates) or `b64_json` (default).
- `n` is currently max 1. `seed` gives reproducible results.
- `image` / `reference_images` accept public URLs for image-to-image.
- `safe` accepts comma-separated flags such as `privacy,secrets`.

## Audio (speech)

```bash
curl -s -X POST "https://gen.pollinations.ai/v1/audio/speech" \
  -H "Authorization: Bearer $POLLINATIONS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/tts-1","input":"Some lighthouses sell dreams. This one sells sunsets.","voice":"nova"}' \
  --output sting.mp3
```

Transcription: `POST https://gen.pollinations.ai/v1/audio/transcriptions` with a multipart `file` field and a transcription model.

## Video (paid balance required)

```bash
curl -s -X POST "https://gen.pollinations.ai/v1/videos/generations" \
  -H "Authorization: Bearer $POLLINATIONS_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"<healthy-video-model>","prompt":"the lighthouse beam slowly sweeps across the sea","duration":5}'
```

Prefer `polli gen video "<prompt>" --image <public-url> --output clip.mp4` for image-to-video; a local path will be rejected. Flag support varies by model — verify the output with `file` or `ffprobe`.

## Balance

```bash
curl -s "https://gen.pollinations.ai/account/balance" \
  -H "Authorization: Bearer $POLLINATIONS_KEY"
```

`accountBalance.total` is Quest + paid; `accountBalance.tier` is Quest Pollen; `accountBalance.paid` is paid Pollen. Paid-only models spend `paid` alone.
