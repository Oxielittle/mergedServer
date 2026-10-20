const NON_EXPIRING_GOODS_CATEGORIES = new Set([
  "clothes",
  "clothing",
  "shoes",
  "shoe",
  "footwear",
  "blankets",
  "blanket",
  "mats",
  "mat",
  "towels",
  "towel",
  "bedding",
  "mosquito nets",
  "mosquito net",
]);

const toNumber = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const toBoolean = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "required", "requires", "require"].includes(normalized)) {
    return true;
  }
  if (["false", "0", "no", "optional", "not_required", "does_not_require"].includes(normalized)) {
    return false;
  }
  return undefined;
};

const parseDate = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "INVALID_DATE" : parsed;
};

const startOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

const endOfDay = (date) => {
  const normalized = new Date(date);
  normalized.setHours(23, 59, 59, 999);
  return normalized;
};

const startOfWeek = (date) => {
  const normalized = startOfDay(date);
  const day = normalized.getDay();
  normalized.setDate(normalized.getDate() - (day === 0 ? 6 : day - 1));
  return normalized;
};

const startOfMonth = (date) => {
  const normalized = startOfDay(date);
  normalized.setDate(1);
  return normalized;
};

const startOfYear = (date) => {
  const normalized = startOfDay(date);
  normalized.setMonth(0, 1);
  return normalized;
};

const getExpiryMeta = (expirationDate, baseDate = new Date()) => {
  if (!expirationDate) {
    return { expiryStatus: "no_expiry", daysUntilExpiration: null };
  }

  const daysUntilExpiration = Math.ceil(
    (startOfDay(expirationDate).getTime() - startOfDay(baseDate).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) {
    return { expiryStatus: "expired", daysUntilExpiration };
  }
  if (daysUntilExpiration <= 30) {
    return { expiryStatus: "expiring_soon", daysUntilExpiration };
  }
  return { expiryStatus: "ok", daysUntilExpiration };
};

const requiresExpirationForGoods = (category, explicitRule) => {
  if (explicitRule !== undefined) return Boolean(explicitRule);
  const normalizedCategory = String(category || "").trim().toLowerCase();
  return Boolean(
    normalizedCategory && !NON_EXPIRING_GOODS_CATEGORIES.has(normalizedCategory)
  );
};

module.exports = {
  toNumber,
  toBoolean,
  parseDate,
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  getExpiryMeta,
  requiresExpirationForGoods,
};
