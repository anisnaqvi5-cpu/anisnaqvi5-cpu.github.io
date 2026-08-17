// Minimal structured logger — JSON lines to stdout/stderr, the format any
// log aggregator (Vercel Log Drains, Datadog, CloudWatch, etc.) can ingest
// without extra parsing. Deliberately dependency-free: swapping this for
// pino/winston later is a drop-in change since callers only see log().

type Level = "debug" | "info" | "warn" | "error";

interface LogFields {
  [key: string]: unknown;
}

function write(level: Level, message: string, fields?: LogFields) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    // eslint-disable-next-line no-console
    console.error(line);
  } else {
    // eslint-disable-next-line no-console
    console.log(line);
  }
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write("debug", message, fields),
  info: (message: string, fields?: LogFields) => write("info", message, fields),
  warn: (message: string, fields?: LogFields) => write("warn", message, fields),
  error: (message: string, fields?: LogFields) => write("error", message, fields),
};
