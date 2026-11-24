# Auth, balance and user-paid apps

## Key types

| Prefix | Where it goes | Notes |
| --- | --- | --- |
| `sk_` | Server / CLI / local scripts only | Personal secret key, configurable permissions and budget. Never in browser code. |
| `pk_` with redirect URIs | OAuth `client_id` | Connect User Wallets (BYOP). Users authorize; app gets a scoped `sk_`. |
| `pk_` with no app binding | Legacy direct spend | Rate-limited; do not mint new ones. |

Get keys at https://enter.pollinations.ai/keys. All API calls go to `https://gen.pollinations.ai`.

## Authenticate for a local skill run

```bash
polli auth login              # device flow, opens browser; creates profile/usage/keys scopes
polli auth status             # verify
polli whoami                  # verify identity
polli usage                   # balance and usage
```

For an agent-assisted login where the user cannot open a browser:

```bash
polli --json auth login --no-browser
```

Read **stderr** while it runs and show the user the verification URL and user code. On approval, stdout is `{"authenticated":true}`. Tokens stay in local credentials and never appear in that result.

Do not ask the user to paste a key into chat. Do not read `~/.pollinations/credentials.json`. If a key must be stored from an env var, the user runs this themselves:

```bash
printf '%s' "$POLLINATIONS_API_KEY" | polli auth login --with-token
```

## Quest Pollen vs paid Pollen

- Quest Pollen (`accountBalance.tier`) cannot pay for `paid_only: true` models — most video and 3D models.
- Paid Pollen (`accountBalance.paid`) can pay for everything.
- Check before generating: `polli usage` and the `paid_only` field from `polli models --type <category> --json`.
- Ask before spending paid balance on a user's account. If declined, deliver a reduced drop and say what was skipped.

## Connect User Wallets (BYOP) for user-facing apps

When the skill is embedded in an app where **visitors** generate media:

1. Register a publishable App Key (`pk_…`) with your redirect URIs at https://enter.pollinations.ai/keys.
2. Run the OAuth 2.1 authorization-code flow with PKCE (S256), or the device flow for CLI apps. Resolve endpoints from RFC 8414 metadata instead of hardcoding them.
3. The user approves a budget/expiry; your app receives a scoped `sk_` key bound to those limits.
4. Use that scoped key for generation requests. Users keep control of budgets and can revoke access.

Full guide: https://github.com/pollinations/pollinations/blob/main/BRING_YOUR_OWN_POLLEN.md

This matters for the quest: apps should let users spend from their own balance rather than requiring the developer to pay or shipping a developer key.
