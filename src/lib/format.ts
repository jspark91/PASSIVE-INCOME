export function formatKrw(value?: number | null) {
  if (!value) {
    return "Quote required";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
}

export function formatUsdGuideFromKrw(value?: number | null) {
  if (!value) {
    return "Quote required";
  }

  const guideRate = 1400;
  const roundedUsd = Math.ceil(value / guideRate / 5) * 5;

  return `approx. ${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(roundedUsd)}`;
}

export function formatDate(value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}
