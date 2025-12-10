export type LogLevelName =
  | "trace"
  | "debug"
  | "info"
  | "warn"
  | "error"
  | "fatal"
  | "silent";

export const LOG_LEVEL_VALUES: Record<LogLevelName, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: 90,
};

export interface LogRecord {
  time?: string | number;
  level: LogLevelName;
  msg: string;
  namespace?: string;
  [key: string]: any;
}

export type LogMeta = Record<string, unknown> | Error | unknown;

export type TimestampMode = "iso" | "epoch" | false;

export interface LoggerFieldsConfig {
  level: boolean;
  namespace: boolean;
  timestamp: boolean;
}

export interface IFormatter {
  format(record: LogRecord): string;
}

export interface IDestination {
  write(line: string, level: LogLevelName): void;
}

export interface LoggerOptions {
  /**
   * Minimum log level. Defaults to "info".
   */
  level?: LogLevelName;

  /**
   * Pretty-print logs (human readable, with colors) instead of JSON.
   * Defaults to false.
   */
  pretty?: boolean;

  /**
   * Pretty print style:
   * - "inline"   => msg key=value
   * - "expanded" => msg\n{ json }
   */
  prettyStyle?: "inline" | "expanded";

  /**
   * Timestamp mode:
   * - "iso" (default) => ISO string
   * - "epoch"         => number (ms since epoch)
   * - false           => disable timestamp
   */
  timestamp?: boolean | "iso" | "epoch";

  /**
   * Optional logical scope for this logger (e.g. "api", "db", "user:service").
   */
  namespace?: string;

  /**
   * Base fields to include in every log line (e.g. { service: "payment" }).
   */
  base?: Record<string, unknown>;

  /**
   * Control which fields are printed (mainly for pretty formatter).
   * All default to true.
   */
  fields?: Partial<LoggerFieldsConfig>;

  /**
   * Top-level keys to redact in the final log record.
   * Values will be replaced with "[REDACTED]".
   */
  redactKeys?: string[];

  /**
   * Fully remove these keys from the final log record (JSON + Pretty).
   */
  excludeKeys?: string[];

  /**
   * Custom formatter. Overrides `pretty`.
   */
  formatter?: IFormatter;

  /**
   * Custom destination. Defaults to console.*.
   */
  destination?: IDestination;

  /**
   * Custom timestamp format for pretty mode.
   * Example: "YYYY-MM-DD HH:mm:ss"
   * Only applies when pretty=true
   */
  timestampFormat?: string;
}

export interface ILogger {
  readonly level: LogLevelName;
  readonly namespace?: string;

  trace(msg: string, meta?: LogMeta): void;
  debug(msg: string, meta?: LogMeta): void;
  info(msg: string, meta?: LogMeta): void;
  warn(msg: string, meta?: LogMeta): void;
  error(msg: string, meta?: LogMeta): void;
  fatal(msg: string, meta?: LogMeta): void;

  /**
   * Create a logger that automatically adds given bindings to every log.
   * You can override namespace via `child({ namespace: "new:space" })`.
   */
  child(bindings: Record<string, unknown>): ILogger;
}
