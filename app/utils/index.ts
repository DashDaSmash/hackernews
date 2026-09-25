export type DateFilter = "all" | "today" | "week" | "month";

export function matchesDateFilter(
  time: number | string | Date,
  filter: DateFilter,
  now = Math.floor(Date.now() / 1000),
) {
  if (filter === "all") {
    return true;
  }

  const timestamp =
    time instanceof Date ? Math.floor(time.getTime() / 1000) : Number(time);
  if (Number.isNaN(timestamp)) {
    return false;
  }

  const elapsedSeconds = now - timestamp;
  const thresholds: Record<Exclude<DateFilter, "all">, number> = {
    today: 60 * 60 * 24,
    week: 60 * 60 * 24 * 7,
    month: 60 * 60 * 24 * 30,
  };

  return elapsedSeconds >= 0 && elapsedSeconds <= thresholds[filter];
}

export function host(url: string) {
  const host = url
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace("?id=", "/");
  const parts = host.split(".").slice(-3);
  if (parts[0] === "www") {
    parts.shift();
  }
  return parts.join(".");
}

export function timeAgo(time: number | Date) {
  const between = Date.now() / 1000 - Number(time);
  if (between < 3600) {
    return pluralize(~~(between / 60), " minute");
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), " hour");
  } else {
    return pluralize(~~(between / 86400), " day");
  }
}

export function pluralize(time: number, label: string) {
  if (time === 1) {
    return time + label;
  }

  return `${time + label}s`;
}

export function isAbsolute(url: string) {
  return /^https?:\/\//.test(url);
}
