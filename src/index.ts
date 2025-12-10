import {
  IDestination,
  IFormatter,
  ILogger,
  LogLevelName,
  LoggerFieldsConfig,
  LoggerOptions,
} from "./types";
import { Logger } from "./Logger";
import { JsonFormatter, PrettyFormatter } from "./formatters";
import { ConsoleDestination } from "./destination";
import { resolveTimestamp } from "./utils";

export * from "./types";

/**
 * Create a new logger instance.
 *
 * - `level`  defaults to "info"
 * - `pretty` defaults to false
 * - `timestamp` defaults to "iso"
 */
export function createLogger(options: LoggerOptions = {}): ILogger {
  const level: LogLevelName = options.level ?? "info";
  const pretty: boolean = options.pretty ?? false;

  const timestampMode = resolveTimestamp(options.timestamp);

  const fields: LoggerFieldsConfig = {
    level: options.fields?.level ?? true,
    namespace: options.fields?.namespace ?? true,
    timestamp: options.fields?.timestamp ?? true,
  };

  const base = options.base ?? {};
  const namespace = options.namespace;

  const prettyStyle = options.prettyStyle ?? "expanded";
  const timestampFormat = options.timestampFormat;

  const formatter: IFormatter =
    options.formatter ??
    (pretty
      ? new PrettyFormatter(fields, prettyStyle, timestampFormat)
      : new JsonFormatter());

  const destination: IDestination = options.destination ?? new ConsoleDestination();

  return new Logger(
    level,
    base,
    {},
    namespace,
    formatter,
    destination,
    timestampMode,
    options.redactKeys,
    options.excludeKeys
  );
}
