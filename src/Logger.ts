import {
  IDestination,
  IFormatter,
  ILogger,
  LogLevelName,
  LogMeta,
  LogRecord,
  LOG_LEVEL_VALUES,
  TimestampMode,
} from "./types";
import {
  applyExclusion,
  applyRedaction,
  normalizeMeta,
  now,
} from "./utils";

export class Logger implements ILogger {
  constructor(
    private readonly minLevel: LogLevelName,
    private readonly base: Record<string, unknown>,
    private readonly bindings: Record<string, unknown>,
    private readonly loggerNamespace: string | undefined,
    private readonly formatter: IFormatter,
    private readonly destination: IDestination,
    private readonly timestampMode: TimestampMode,
    private readonly redactKeys?: string[],
    private readonly excludeKeys?: string[]
  ) { }

  get level(): LogLevelName {
    return this.minLevel;
  }

  get namespace(): string | undefined {
    return this.loggerNamespace;
  }

  trace(msg: string, meta?: LogMeta): void {
    this.log("trace", msg, meta);
  }

  debug(msg: string, meta?: LogMeta): void {
    this.log("debug", msg, meta);
  }

  info(msg: string, meta?: LogMeta): void {
    this.log("info", msg, meta);
  }

  warn(msg: string, meta?: LogMeta): void {
    this.log("warn", msg, meta);
  }

  error(msg: string, meta?: LogMeta): void {
    this.log("error", msg, meta);
  }

  fatal(msg: string, meta?: LogMeta): void {
    this.log("fatal", msg, meta);
  }

  child(bindings: Record<string, unknown>): ILogger {
    const mergedBindings = { ...this.bindings, ...bindings };
    let childNamespace = this.loggerNamespace;

    if (typeof bindings.namespace === "string") {
      childNamespace = bindings.namespace as string;
    }

    return new Logger(
      this.minLevel,
      this.base,
      mergedBindings,
      childNamespace,
      this.formatter,
      this.destination,
      this.timestampMode,
      this.redactKeys,
      this.excludeKeys
    );
  }

  private log(level: LogLevelName, msg: string, meta?: LogMeta): void {
    if (LOG_LEVEL_VALUES[level] < LOG_LEVEL_VALUES[this.minLevel]) {
      return;
    }

    const metaObj = normalizeMeta(meta);

    const record: LogRecord = {
      ...(this.timestampMode ? { time: now(this.timestampMode) } : {}),
      ...this.base,
      ...this.bindings,
      ...metaObj,
      level,
      msg,
    };

    if (this.loggerNamespace) {
      record.namespace = this.loggerNamespace;
    }

    let processed = applyRedaction(record, this.redactKeys);
    processed = applyExclusion(processed, this.excludeKeys);

    const line = this.formatter.format(processed);
    this.destination.write(line, level);
  }
}
