type NotificationLike = {
  title?: string;
  message?: string;
  titleKey?: string;
  messageKey?: string;
  messageParams?: string | null;
  priority?: string;
  notificationType?: string;
};

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

const parseParams = (raw?: string | null): Record<string, unknown> => {
  if (!raw) return {};

  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const localizeParamValue = (
  key: string,
  value: unknown,
  t: TranslateFn,
): unknown => {
  if (typeof value !== "string") {
    return value;
  }

  if (key === "oldStatus" || key === "newStatus") {
    return t(`notification.requestStatuses.${value}`);
  }

  if (key === "priority") {
    return t(`notification.priorities.${value}`);
  }

  if (key === "notificationType") {
    return t(`notification.types.${value}`);
  }

  return value;
};

const buildParams = (item: NotificationLike, t: TranslateFn) => {
  const params = parseParams(item.messageParams);
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      localizeParamValue(key, value, t),
    ]),
  );
};

export const translateNotificationTitle = (
  item: NotificationLike,
  t: TranslateFn,
) => {
  if (item.titleKey) {
    return t(item.titleKey, buildParams(item, t));
  }

  return item.title || t("common.notSpecified");
};

export const translateNotificationMessage = (
  item: NotificationLike,
  t: TranslateFn,
) => {
  if (item.messageKey) {
    return t(item.messageKey, buildParams(item, t));
  }

  return item.message || t("common.notSpecified");
};
