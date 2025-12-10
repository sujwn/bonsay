import { LogMeta, LogRecord, TimestampMode } from "./types";

export function resolveTimestamp(
  timestamp?: boolean | "iso" | "epoch"
): TimestampMode {
  if (timestamp === false) return false;
  if (timestamp === "iso" || timestamp === "epoch") return timestamp;
  return "iso"; // default
}

export function now(mode: TimestampMode): string | number | undefined {
  if (!mode) return undefined;
  const t = Date.now();
  return mode === "epoch" ? t : new Date(t).toISOString();
}

export function normalizeMeta(meta?: LogMeta): Record<string, unknown> {
  if (meta == null) return {};
  if (meta instanceof Error) {
    return {
      err: {
        name: meta.name,
        message: meta.message,
        stack: meta.stack,
      },
    };
  }
  if (typeof meta === "object") {
    return meta as Record<string, unknown>;
  }
  return { meta };
}

export function applyRedaction(
  record: LogRecord,
  redactKeys?: string[]
): LogRecord {
  if (!redactKeys || redactKeys.length === 0) return record;
  const copy: LogRecord = { ...record };
  for (const key of redactKeys) {
    if (key in copy) {
      copy[key] = "[REDACTED]";
    }
  }
  return copy;
}

export function applyExclusion(
  record: LogRecord,
  excludeKeys?: string[]
): LogRecord {
  if (!excludeKeys || excludeKeys.length === 0) return record;

  const out: LogRecord = { ...record };
  for (const key of excludeKeys) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete out[key];
  }
  return out;
}

export function formatTimestamp(date: Date, format: string): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

  const map: Record<string, string> = {
    YYYY: `${date.getFullYear()}`,
    MMMM: date.toLocaleString("en-US", { month: "long" }),
    MMM: date.toLocaleString("en-US", { month: "short" }),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
    Z: Intl.DateTimeFormat("en-US", { timeZoneName: "short" })
      .format(date)
      .split(" ")
      .pop()!,
  };

  let output = format;
  for (const [token, value] of Object.entries(map)) {
    output = output.replace(token, value);
  }

  return output;
}