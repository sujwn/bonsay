import { IDestination, LogLevelName } from "./types";

export class ConsoleDestination implements IDestination {
  write(line: string, level: LogLevelName): void {
    if (typeof console === "undefined") {
      return;
    }

    if (level === "error" || level === "fatal") {
      console.error(line);
    } else if (level === "warn") {
      console.warn(line);
    } else {
      console.log(line);
    }
  }
}
