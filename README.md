<div align="center">

# Bonsay

### *A lightweight &amp; expressive logger for modern JavaScript runtimes.*

[![npm version](https://img.shields.io/npm/v/bonsay)](https://www.npmjs.com/package/bonsay)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A minimalistic yet powerful logger.
Inspired by the craft of **Bonsai** — precise, elegant, controlled —
and the simplicity of **Say** — clean, expressive logging.
</div>

---

## Features

* Ultra-lightweight, zero dependencies
* JSON logs (production)
* Pretty logs (development)
  * Inline view → `msg key=value`
  * Expanded view → `msg\n{ json }`
* Timestamp modes (ISO, epoch, or disabled)
* Custom timestamp formats (`YYYY-MM-DD HH:mm:ss`, etc.)
* Field redaction (`[REDACTED]`)
* Field exclusion (remove entirely from logs)
* Namespaces (e.g., `"api"`, `"db"`)
* Base fields injected into every log
* Works everywhere:

  * Node
  * Bun
  * Deno
  * Browsers
  * Cloudflare Workers
  * Any framework (Express, Fastify, Hono, Elysia, Fwoom…)

---

## Installation

```bash
npm install bonsay
# or
pnpm add bonsay
# or
yarn add bonsay
```

---

## Basic Usage

```ts
import { createLogger } from "bonsay";

const log = createLogger({ level: "debug" });

log.info("Server started");
log.debug("Debug details", { port: 3000 });
```

---

## JSON Mode

```ts
const log = createLogger({ pretty: false });
log.info("Started", { port: 3000 });
```

Outputs:

```json
{"msg":"Started","level":"info","port":3000,"time":"2025-02-10T13:00:00.000Z"}
```

---

## Pretty Modes

### **Expanded (default)**

```ts
createLogger({ pretty: true, prettyStyle: "expanded" });
```

```
INFO api User logged in
{
  "success": true,
  "id": 123
}
```

### **Inline**

```ts
createLogger({ pretty: true, prettyStyle: "inline" });
```

```
INFO api User logged in success=true id=123
```

---

## Custom Timestamp Format (Pretty Mode)

```ts
createLogger({
  pretty: true,
  timestampFormat: "YYYY-MMM-DD HH:mm:ss Z",
});
```

Output:

```
[2025-Feb-10 13:22:11 GMT+7] INFO api Starting service
```

**Supported tokens**:

| Token  | Meaning                      |
| ------ | ---------------------------- |
| `YYYY` | Year                         |
| `MMM`  | Month short name (Jan, Feb…) |
| `MM`   | Month number                 |
| `DD`   | Day                          |
| `HH`   | Hours                        |
| `mm`   | Minutes                      |
| `ss`   | Seconds                      |
| `Z`    | Timezone                     |

---


## Redact Sensitive Fields

```ts
createLogger({
  redactKeys: ["password", "token"]
});
```

---

## Exclude Fields Completely

```ts
createLogger({
  base: { service: "billing", instance: "i-aaa" },
  excludeKeys: ["instance"]
});
```

---

## Namespaces

```ts
const log = createLogger({ namespace: "api" });
const db = log.child({ namespace: "db" });

db.info("Connected");
```

---

## Express Integration

```ts
app.use((req, res, next) => {
  req.log = log.child({
    namespace: "req",
    reqId: Date.now().toString(36),
  });

  req.log.info("Incoming request", { method: req.method });

  res.on("finish", () => {
    req.log.info("Request completed", { status: res.statusCode });
  });

  next();
});
```

---

## Fwoom Integration (no plugin required)

```ts
const log = createLogger({ pretty: true });
app.log = log;

app.onRequest((ctx) => {
  ctx.log = log.child({ reqId: Date.now().toString(36) });
  ctx.log.info("Incoming request");
});
```

---

## Custom Destination Example

```ts
createLogger({
  destination: {
    write(line, level) {
      sendToExternalLogService(line);
    }
  }
});
```

---

## Contributing

Contributions are welcome! If you'd like to help improve **Bonsay**, here's how you can get started:

1. Fork the Repository
Visit the GitHub repo and click **Fork**:
[https://github.com/sujwn/bonsay](https://github.com/sujwn/bonsay)

2. Clone Your Fork
```bash
git clone https://github.com/<your-username>/bonsay.git
cd bonsay
```

3. Install Dependencies
```bash
npm install
```

4. Create a Feature Branch
```bash
git checkout -b feature/my-improvement
```

5. Make Changes
Follow the existing coding style and structure.

6. Run Build & Tests
```bash
npm run build
```

7. Commit Your Changes
```bash
git commit -m "Add feature: my improvement"
```

8. Push & Open PR
```bash
git push origin feature/my-improvement
```

Open a Pull Request to `main` with a clear description.

---

## License

[MIT](LICENSE)
