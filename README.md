# FlagLite SDK 🪄

**A 10‑kB TypeScript client that lets you _ship code once_ and _flip behaviour in 5 sec_.**

> Toggle a feature in 5 sec — no redeploy, no rollback.

---

## 🔗 Links

- **Dashboard:** <https://flaglite.co>

## ✨ Why FlagLite?

| 😱 Pain                              | 😌 With FlagLite SDK              |
| ------------------------------------ | --------------------------------- |
| Prod bug at 3 a.m. → 15 min redeploy | **Toggle OFF** & go back to sleep |
| “Roll out to 10 % first?”            | Dashboard slider 0 → 10 → 100 %   |
| Env‑var switching chaos              | `flags.boolean("key")` everywhere |

---

## 🚀 Install

| npm                   | yarn                     | pnpm                     |
| --------------------- | ------------------------ | ------------------------ |
| `npm i @flaglite/sdk` | `yarn add @flaglite/sdk` | `pnpm add @flaglite/sdk` |

---

## ⚡ Quick Start (3 lines)

```ts
import { FlagLiteClient } from "@flaglite/sdk";

const flags = new FlagLiteClient({
  projectPublicId: "5b54c…e437",
  apiKey: process.env.FLAGLITE_KEY!,
  // apiUrl: 'http://localhost:3000/api',   // ← local dev only
});
await flags.ready(); // wait for first fetch

if (flags.boolean("beta-ui")) renderNewUI();
```

---

## 🔥 Real‑world Examples

### 1 — Kill Switch

```ts
if (flags.boolean("stripe‑migration")) payWithStripe();
else payLegacy();

/* 🟥 03:17 AM Stripe outage — toggle OFF → traffic rolls back in 5 s */
```

### 2 — Gradual Roll‑out (25 %)

```ts
if (Math.random() * 100 < flags.percentage("smart‑pricing"))
  enableSmartPricing();
```

---

## 🛠️ API Reference

### Constructor Options

| Option            | Default                   | Description                                   |
| ----------------- | ------------------------- | --------------------------------------------- |
| `projectPublicId` | —                         | Project UUID slug                             |
| `apiKey`          | —                         | **Secret** server key (never ship to browser) |
| `apiUrl`          | `https://api.flaglite.co` | Override for self‑host / localhost            |
| `env`             | `"prod"`                  | `"stage"` / `"dev"`                           |
| `refreshInterval` | `30000` ms                | `0` = no polling                              |
| `onUpdate()`      | —                         | Called when cache refreshes                   |
| `onError(err)`    | —                         | Network / quota / HTTP errors                 |

### Methods

| Method & Signature                            | Return                                     |
| --------------------------------------------- | ------------------------------------------ |
| `ready()`                                     | `Promise<void>` — resolves after 1st fetch |
| `refresh()`                                   | Manually re‑fetch flags                    |
| `boolean(key)`                                | `boolean`                                  |
| `percentage(key)`                             | `number` (0‑100)                           |
| `set(key)`                                    | `string[]`                                 |
| `get(key)`                                    | `FlagValue \| undefined`                   |
| `get(key,'boolean' \| 'percentage' \| 'set')` | Typed single lookup                        |
| `stop()`                                      | Clears polling timer                       |

---

## ⚙️ Error Handling & Quota

```ts
new FlagLiteClient({
  …,
  onError(err) {
    if (err instanceof Error && err.message.includes('429')) {
      // ❌  account quota exceeded — degrade gracefully
    }
    console.error(err);
  },
});
```

- **Network / 5xx** — last cached values remain in memory, your app keeps running.
- **429 Quota** — server returns `{error:"Account quota exceeded."}`.

---

## 📦 Local smoke test

```bash
# .env
FLAGLITE_KEY=sk_local_…
PUBLIC_ID=5b54c…

node -e "import('@flaglite/sdk').then(async ({FlagLiteClient})=>{
  const f=new FlagLiteClient({
    projectPublicId:process.env.PUBLIC_ID!,
    apiKey:process.env.FLAGLITE_KEY!,
    apiUrl:'http://localhost:3000/api',
    refreshInterval:0
  });
  await f.ready();
  console.log('beta-ui =', f.boolean('beta-ui'));
  f.stop();
})"
```

---

## 🗺️ Typed helpers in IDE ✨

```ts
flags.boolean("beta-ui"); // boolean autocomplete
flags.percentage("rollout-X"); // number
flags.set("whitelist"); // string[]

flags.get("beta-ui", "boolean"); // FlagBoolean | undefined
```

---

## 🔮 Roadmap

---

MIT © FlagLite 2025
