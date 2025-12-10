import {
  IFormatter,
  LogLevelName,
  LogRecord,
  LoggerFieldsConfig,
} from "./types";
import { formatTimestamp } from "./utils";

// Simple ANSI color constants (no external deps).
const ANSI = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  cyan: "\x1b[36m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
};

function colorForLevel(level: LogLevelName): string {
  switch (level) {
    case "trace":
      return ANSI.dim;
    case "debug":
      return ANSI.cyan;
    case "info":
      return ANSI.green;
    case "warn":
      return ANSI.yellow;
    case "error":
      return ANSI.red;
    case "fatal":
      return ANSI.magenta;
    default:
      return "";
  }
}

function formatValue(value: unknown): string {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

/**
 * JSON formatter: one JSON object per log line.
 */
export class JsonFormatter implements IFormatter {
  format(record: LogRecord): string {
    return JSON.stringify(record);
  }
}

/**
 * Pretty formatter: human-readable, colored output for development.
 */
export class PrettyFormatter implements IFormatter {
  constructor(
    private readonly fields: LoggerFieldsConfig,
    private readonly style: "inline" | "expanded" = "expanded",
    private readonly timestampFormat?: string
  ) { }

  format(record: LogRecord): string {
    const parts: string[] = [];

    if (this.fields.timestamp && record.time != null) {
      let ts = String(record.time);

      if (this.timestampFormat) {
        ts = formatTimestamp(new Date(record.time), this.timestampFormat);
      }

      parts.push(`${ANSI.dim}[${ts}]${ANSI.reset}`);
    }

    if (this.fields.level) {
      const color = colorForLevel(record.level);
      const label = record.level.toUpperCase();
      parts.push(`${color}${label}${ANSI.reset}`);
    }

    if (this.fields.namespace && record.namespace) {
      parts.push(`${ANSI.blue}${record.namespace}${ANSI.reset}`);
    }

    parts.push(record.msg);

    const extra: string[] = [];
    for (const [key, value] of Object.entries(record)) {
      if (key === "time" || key === "level" || key === "msg" || key === "namespace") {
        continue;
      }
      extra.push(`${ANSI.dim}${key}=${formatValue(value)}${ANSI.reset}`);
    }

    if (this.style === "inline") {
      if (extra.length > 0) {
        parts.push(extra.join(" "));
      }
      return parts.join(" ");
    }

    if (this.style === "expanded") {
      const line = parts.join(" ");

      const extraObject: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(record)) {
        if (["time", "level", "msg", "namespace"].includes(key)) continue;
        extraObject[key] = value;
      }

      if (Object.keys(extraObject).length === 0) {
        return line;
      }

      return line + "\n" + JSON.stringify(extraObject, null, 2);
    }

    return parts.join(" ");
  }
}
